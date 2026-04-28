# MCP UI Integration

This document describes how to make the chat client aware of `server-mcp-ui` so the AI can render interactive widgets inside the conversation.

## How `server-mcp-ui` works

`server-mcp-ui` is an MCP server that implements the `io.modelcontextprotocol/ui` extension. Each widget is exposed as two MCP components:

- **A render tool** — the AI calls this to trigger a widget (e.g. `render_dashboard`). Returns a plain string confirmation. The tool's metadata annotation carries a `resourceUri` pointing to the widget HTML.
- **A resource** — the full bundled HTML/CSS/JS for the widget, served at a `ui://` URI with MIME type `text/html;profile=mcp-app`.

Some widgets also expose **app tools** (e.g. `get_dashboard_stats`, `poll_log_entries`) marked `visibility: ["app"]`. These are hidden from the LLM and are only called by the widget's own JavaScript while it runs in the chat client.

### Widget communication protocol

Once the chat client renders a widget in an iframe, the widget communicates back using **JSON-RPC 2.0 over `window.parent.postMessage`**:

```
Widget iframe                     Chat client (host)
     |                                    |
     |-- ui/initialize ----------------> |
     |<- { result: {} } ---------------- |
     |-- ui/notifications/initialized -> |  (widget now active)
     |                                    |
     |-- tools/call (polling) ---------> |
     |<- { result: { ... } } ----------- |  (host proxies to server-mcp-ui)
     |                                    |
```

Protocol version: `"2025-06-18"`

---

## What needs to change

### Overview

```
User message
  → ChatService (as today)
  → Agentic loop with merged toolkit (SampleToolkit + McpUiToolkit)
  → AI calls render_dashboard
  → McpUiToolkit forwards call to server-mcp-ui
  → tool-execution-complete event carries resourceUri
  → client receives resourceUri in stream
  → client fetches HTML resource via apps/server proxy
  → client renders sandboxed iframe
  → widget polls via postMessage → apps/server → server-mcp-ui
```

---

## Backend changes

### 1. `packages/domain/src/Chat.ts` — add `resourceUri` to tool complete event

The `tool-execution-complete` stream part needs an optional `resourceUri` field so the client knows when a tool result should be rendered as a widget rather than plain text.

```ts
// packages/domain/src/Chat.ts
export const ChatStreamPart = Schema.Union(
  // ... existing variants ...
  Schema.TaggedStruct("tool-execution-complete", {
    id: Schema.String,
    name: Schema.String,
    result: Schema.String,
    success: Schema.Boolean,
    resourceUri: Schema.optional(Schema.String),  // add this
  }),
  // ...
)
```

### 2. `packages/ai/src/toolkits/McpUiToolkit.ts` — new MCP client toolkit

Connects to `server-mcp-ui` at startup, discovers all tools via `listTools()`, and wraps them in a `Toolkit.WithHandler`. Each handler calls `client.callTool()` and extracts the result text.

The key difference from a plain MCP toolkit: when wrapping a render tool, read the `_meta.ui.resourceUri` annotation from the MCP tool definition and attach it to the execution result so `AgenticLoop` can emit it on the stream.

```ts
// packages/ai/src/toolkits/McpUiToolkit.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import { Config, Effect, Layer } from "effect"
import { Tool, Toolkit } from "@effect/ai"
import { Schema } from "effect"

export class McpUiClient extends Effect.Service<McpUiClient>()(
  "McpUiClient",
  {
    scoped: Effect.gen(function* () {
      const url = yield* Config.string("MCP_UI_URL").pipe(
        Config.withDefault("http://localhost:9010/mcp"),
      )
      const client = new Client({ name: "bevr-server", version: "1.0.0" })
      const transport = new StreamableHTTPClientTransport(new URL(url))
      yield* Effect.promise(() => client.connect(transport))
      yield* Effect.addFinalizer(() => Effect.promise(() => client.close()))
      return client
    }),
  },
) {}

export const McpUiToolkitLive = Layer.effect(
  // build a Toolkit.WithHandler dynamically from discovered tools
  Effect.gen(function* () {
    const client = yield* McpUiClient
    const { tools } = yield* Effect.promise(() => client.listTools())

    const toolDefs = tools.map((t) =>
      Tool.make(t.name, {
        description: t.description ?? "",
        success: Schema.String,
        failure: Schema.Never,
        parameters: Object.fromEntries(
          Object.entries((t.inputSchema as any).properties ?? {}).map(([k]) => [
            k,
            Schema.Unknown,
          ]),
        ),
      }).annotate(Tool.Meta, (t as any)._meta ?? {}),
    )

    const handlers = Object.fromEntries(
      tools.map((t) => [
        t.name,
        (args: Record<string, unknown>) =>
          Effect.promise(() =>
            client.callTool({ name: t.name, arguments: args }),
          ).pipe(
            Effect.map((res) =>
              (res.content as Array<{ text: string }>)
                .map((c) => c.text)
                .join("\n"),
            ),
          ),
      ]),
    )

    return Toolkit.make(...toolDefs).toLayer(Effect.succeed(handlers))
  }),
)
```

### 3. `packages/ai/src/workflow/AgenticLoop.ts` — emit `resourceUri` on tool complete

In the `tool-result` case, check if the tool definition has a `Tool.Meta` annotation with `ui.resourceUri` and include it in the `toolExecutionComplete` mailbox event.

### 4. `packages/ai/src/services/ChatService.ts` — merge toolkit

```ts
// before
const toolkit = yield* Toolkit.merge(SampleToolkit)

// after
const toolkit = yield* Toolkit.merge(SampleToolkit, McpUiToolkit)
```

### 5. `apps/server/src/index.ts` — provide layer and env var

```ts
Layer.provide(McpUiClient.Default)
```

```
# .env / docker-compose
MCP_UI_URL=http://server-mcp-ui:9010/mcp
```

### 6. `apps/server` — two new RPC endpoints

The browser cannot reach `server-mcp-ui` directly (it is on the internal Docker network). `apps/server` must proxy both operations:

| Endpoint | Purpose |
|---|---|
| `mcp.resource({ uri })` | Fetches the HTML for a `ui://` resource from `server-mcp-ui`; returns the raw HTML string |
| `mcp.toolCall({ name, arguments })` | Forwards a widget's polling tool call to `server-mcp-ui`; returns the tool result |

Add these to `packages/domain/src/Rpc.ts` and implement them in `apps/server/src/Rpc/`.

---

## Frontend changes

### 7. `packages/domain/src/Chat.ts` — `ToolCall` type update

The client-side `ToolCall` type (used in `ChatResponse` segments) needs the same optional `resourceUri` field so the chat component can branch on it.

### 8. `apps/client/src/components/ui/McpWidgetHost.tsx` — new component

A self-contained component that:

1. On mount, calls the `mcp.resource` RPC endpoint to fetch the widget HTML.
2. Injects the HTML into a sandboxed `<iframe srcdoc={html}>`.
3. Listens for `message` events from the iframe and handles the JSON-RPC protocol:

```ts
window.addEventListener("message", async (event) => {
  const msg = event.data
  if (!msg?.jsonrpc) return

  if (msg.method === "ui/initialize") {
    iframe.contentWindow.postMessage(
      { jsonrpc: "2.0", id: msg.id, result: {} },
      "*",
    )
  }

  if (msg.method === "tools/call") {
    const result = await rpcClient.mcp.toolCall({
      name: msg.params.name,
      arguments: msg.params.arguments ?? {},
    })
    iframe.contentWindow.postMessage(
      { jsonrpc: "2.0", id: msg.id, result },
      "*",
    )
  }
})
```

4. Iframe sandbox attributes: `allow-scripts allow-same-origin` — enough for `postMessage` and CDN asset loading.

### 9. `apps/client/src/components/ui/segment.tsx` — branch on `resourceUri`

In the `ToolCall` renderer, check for `resourceUri`:

```tsx
// before: always show plain tool call display
<ToolCall segment={segment} />

// after: show widget iframe when tool has a resourceUri
{segment._tag === "tool-call" && segment.tool.resourceUri ? (
  <McpWidgetHost resourceUri={segment.tool.resourceUri} toolName={segment.tool.name} />
) : (
  <ToolCall segment={segment} />
)}
```

---

## File changes summary

| File | Change |
|---|---|
| `packages/domain/src/Chat.ts` | Add `resourceUri?: string` to `tool-execution-complete` part and `ToolCall` type |
| `packages/domain/src/Rpc.ts` | Add `mcp.resource` and `mcp.toolCall` RPC definitions |
| `packages/ai/src/toolkits/McpUiToolkit.ts` | New — MCP client + dynamic toolkit from `server-mcp-ui` |
| `packages/ai/src/workflow/AgenticLoop.ts` | Emit `resourceUri` on `tool-execution-complete` when tool meta carries it |
| `packages/ai/src/services/ChatService.ts` | Merge `McpUiToolkit` into agentic loop |
| `packages/ai/src/index.ts` | Export `McpUiClient`, `McpUiToolkitLive` |
| `apps/server/src/Rpc/Mcp.ts` | New — `mcp.resource` and `mcp.toolCall` RPC handlers |
| `apps/server/src/index.ts` | Provide `McpUiClient.Default`; add `MCP_UI_URL` env var; wire `McpRpcLive` |
| `apps/client/src/components/ui/McpWidgetHost.tsx` | New — iframe renderer + postMessage bridge |
| `apps/client/src/components/ui/segment.tsx` | Branch on `resourceUri` to render `McpWidgetHost` |
| `docker-compose.yaml` | Add `MCP_UI_URL=http://server-mcp-ui:9010/mcp` to `server` environment |
