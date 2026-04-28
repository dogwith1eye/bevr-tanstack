# MCP Server Integration

This document describes how to integrate `apps/server-mcp` into the chat application so that the LLM can call MCP-hosted tools during an agentic loop.

## Current state

The MCP server (`apps/server-mcp`) runs independently and exposes tools, resources, and prompts over HTTP at `MCP_PORT` (default 9009). Nothing in the chat pipeline connects to it — the `ChatService` only has access to `SampleToolkit` (calculator, echo, getCurrentTime), which is statically defined in `packages/ai/src/toolkits/SampleToolkit.ts`.

## Integration approach

Add an MCP client to `apps/server` that connects to `apps/server-mcp`, discovers its tools at startup, and bridges them into a `Toolkit.WithHandler` that the existing agentic loop already accepts.

### 1. `packages/ai/src/toolkits/McpToolkit.ts` (new file)

Create a service that:

1. Opens a connection to the MCP server using `StreamableHTTPClientTransport` from `@modelcontextprotocol/sdk/client/streamableHttp`
2. Calls `client.listTools()` to discover available tools
3. Converts each MCP tool definition into a `Tool.make(...)` with schema derived from the MCP tool's `inputSchema`
4. Returns a `Toolkit.WithHandler` where each handler calls `client.callTool(name, args)` and returns the result text

The MCP server is the schema source of truth — no duplication needed.

```ts
// packages/ai/src/toolkits/McpToolkit.ts
import { Tool, Toolkit } from "@effect/ai"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import { Config, Effect, Layer, Schema } from "effect"

const McpClientLive = Effect.gen(function* () {
  const url = yield* Config.string("MCP_URL").pipe(
    Config.withDefault("http://localhost:9009/mcp"),
  )
  const client = new Client({ name: "bevr-server", version: "1.0.0" })
  const transport = new StreamableHTTPClientTransport(new URL(url))
  yield* Effect.promise(() => client.connect(transport))
  yield* Effect.addFinalizer(() => Effect.promise(() => client.close()))
  return client
})

export const McpToolkitLive: Layer.Layer<Toolkit.WithHandler<any>> =
  Layer.scoped(
    // tag omitted for brevity — use a Context.Tag in real code
    Effect.gen(function* () {
      const client = yield* McpClientLive
      const { tools } = yield* Effect.promise(() => client.listTools())

      const toolDefs = tools.map((t) =>
        Tool.make(t.name, {
          description: t.description ?? "",
          success: Schema.String,
          failure: Schema.Never,
          parameters: Object.fromEntries(
            Object.entries(
              (t.inputSchema as any).properties ?? {},
            ).map(([k]) => [k, Schema.Unknown]),
          ),
        }),
      )

      const toolkit = Toolkit.make(...toolDefs)

      const handlers = Object.fromEntries(
        tools.map((t) => [
          t.name,
          (args: Record<string, unknown>) =>
            Effect.promise(() => client.callTool({ name: t.name, arguments: args })).pipe(
              Effect.map((res) =>
                (res.content as Array<{ text: string }>)
                  .map((c) => c.text)
                  .join("\n"),
              ),
            ),
        ]),
      )

      return toolkit.toLayer(Effect.succeed(handlers))
    }),
  )
```

### 2. Merge into `ChatService.ts`

In `packages/ai/src/services/ChatService.ts`, merge the MCP toolkit alongside `SampleToolkit`:

```ts
// before
const toolkit = yield* Toolkit.merge(SampleToolkit)

// after
const toolkit = yield* Toolkit.merge(SampleToolkit, McpToolkit)
```

### 3. Provide the layer in `apps/server/src/index.ts`

Add `McpToolkitLive` to the server's layer graph and set `MCP_URL` to point at the MCP server:

```ts
// docker-compose.yaml / .env
MCP_URL=http://server-mcp:9009/mcp
```

```ts
// apps/server/src/index.ts
const ServerLive = HttpLive.pipe(
  Layer.provide(ChatService.Default),
  Layer.provide(McpToolkitLive),  // add this
  Layer.provide(SampleToolkitLive),
  Layer.provide(SmartModelLive),
)
```

## Key trade-off

| | `SampleToolkit` (static) | `McpToolkit` (dynamic) |
|---|---|---|
| Schema | Typed at compile time | Derived at runtime from MCP |
| Tool parameters | Fully type-safe | `Schema.Unknown` per param |
| Source of truth | TypeScript file | MCP server |
| Adding tools | Requires code change | Change MCP server only |

Accept the dynamic approach for MCP tools — it's what MCP is designed for, and the LLM receives the real schema descriptions at inference time regardless.

## File changes summary

| File | Change |
|---|---|
| `packages/ai/src/toolkits/McpToolkit.ts` | New — MCP client + toolkit bridge |
| `packages/ai/src/index.ts` | Export `McpToolkitLive` |
| `packages/ai/src/services/ChatService.ts` | Merge `McpToolkit` into agentic loop |
| `apps/server/src/index.ts` | Provide `McpToolkitLive` layer |
| `docker-compose.yaml` / `.env` | Add `MCP_URL` env var |
