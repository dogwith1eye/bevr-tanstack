# MCP App Widgets — Implementation Guide

> Companion to `react-mcp-widgets.md` and `mcp-integration.md`.
> Covers how to adopt the `@modelcontextprotocol/ext-apps/react` pattern from the article
> and what changes are needed in this monorepo.

## Current State

The `apps/server-mcp-ui` workspace already implements MCP App widgets end-to-end using
**vanilla JS + raw `postMessage`** for the widget (iframe) side and Effect's `McpServer`
helpers on the server side. The chat client (`apps/client`) does **not** yet implement
the host-side bridge needed to mount and communicate with widget iframes.

## The Two Approaches Compared

| Concern | Current (`server-mcp-ui`) | Article (`@ext-apps/react`) |
|---|---|---|
| Widget HTML | Inline vanilla JS, raw `postMessage` | React SPA via `vite-plugin-singlefile` |
| Host protocol | Manual `ui/initialize` + `ui/notifications/tool-result` | Same protocol, abstracted by `useApp` / `PostMessageTransport` |
| Theming | CSS vars via `--color-background-primary` etc. | `useHostStyles` / `useHostStyleVariables` hooks |
| Payload decode | Manual JSON parse + normalize | `Schema.decodeUnknownSync` in `ontoolresult` |
| Auto-resize | Manual `ResizeObserver` + debounce | `useAutoResize` hook |
| Bundle size | Small (no React, CDN-loaded D3/sszvis) | ~1 MB/widget (React bundled in) |
| Server wiring | `makeUiResource` + `makeUiRenderTool` (Effect) | `registerAppResource` / `registerAppTool` from `@ext-apps/server` |

The server-side registration helpers in `src/service/McpAppService.ts` already produce
the correct `ui.resourceUri` tool annotations and `text/html;profile=mcp-app` MIME type.
**No server changes are required** when migrating widgets to React.

---

## What Would Change: Widget Packages

### New workspace structure

Each widget becomes its own Vite app that compiles to a single self-contained HTML file
(via `vite-plugin-singlefile`) that `server-mcp-ui` reads and serves as a UI resource.

```
packages/
├── widget-bar-chart/
│   ├── src/
│   │   ├── BarChart.tsx
│   │   ├── WidgetApp.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── vite.config.ts     # vite-plugin-singlefile → dist/index.html
├── widget-line-chart/
└── widget-scatterplot/
```

### Widget lifecycle pattern (`WidgetApp.tsx`)

```tsx
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import { Schema } from "effect";
import { useState, useRef } from "react";
import { BarChartPayload } from "@repo/domain"; // shared schema!

export const WidgetApp = () => {
  const [payload, setPayload] = useState<typeof BarChartPayload.Type | null>(null);
  const lastPayloadRef = useRef<string | null>(null);

  const updatePayload = (next: typeof BarChartPayload.Type) => {
    const serialized = JSON.stringify(next);
    if (lastPayloadRef.current === serialized) return;
    lastPayloadRef.current = serialized;
    setPayload(next);
  };

  const { app, isConnected, error } = useApp({
    appInfo: { name: "widget-bar-chart", version: "0.1.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.ontoolresult = (params) => {
        const parsed = Schema.decodeUnknownSync(BarChartPayload)(params);
        if (parsed) updatePayload(parsed);
      };
    },
  });

  // Injects --color-* and other CSS variables from the host theme
  useHostStyles(app, app?.getHostContext());

  if (error) return <div>Error: {error.message}</div>;
  if (!isConnected) return <div>Connecting…</div>;
  if (!payload) return <div>Waiting for data…</div>;

  return <BarChart {...payload} />;
};
```

**Key hooks from `@modelcontextprotocol/ext-apps/react`:**

| Hook | Purpose |
|---|---|
| `useApp` | Creates and connects the `App` instance, fires `onAppCreated` once |
| `useHostStyles` | Injects host CSS variable theme into the widget document |
| `useHostStyleVariables` | Subset — only style variables, no fonts |
| `useHostFonts` | Applies host font stack |
| `useDocumentTheme` | Reactive `light`/`dark` theme value |
| `useAutoResize` | Sends `ui/size-changed` to host (rarely needed manually) |

### New dependencies per widget package

```bash
# runtime
bun add @modelcontextprotocol/ext-apps react react-dom @observablehq/plot

# dev
bun add -d vite @vitejs/plugin-react vite-plugin-singlefile
```

### Vite config

```ts
// packages/widget-bar-chart/vite.config.ts
import { viteSingleFile } from "vite-plugin-singlefile";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: { outDir: "dist" },
});
```

### Server wiring stays identical

```ts
// apps/server-mcp-ui/src/widgets/bar-chart/bar-chart.ts
// The only change: point html at the new built file instead of the inline HTML.
import BarChartHtml from "../../../../../../packages/widget-bar-chart/dist/index.html"
  with { type: "text" };

export const BarChartResourceLayer = makeUiResource("ui://examples/bar-chart", {
  name: "Bar Chart",
  description: "Bar chart UI",
  html: BarChartHtml,
  meta: { prefersBorder: true },
});

// RenderBarChartTool and renderBarChartHandler are unchanged
```

### Schema reuse superpower

Move payload schemas to `@repo/domain` so server tool definitions and widget decoders
share the same types without duplication:

```ts
// packages/domain/src/BarChartPayload.ts
export const BarChartPayload = Schema.Struct({ ... });

// server-mcp-ui — imports from @repo/domain
// widget-bar-chart — imports from @repo/domain
```

---

## The Missing Piece: Client Host Bridge

This is the **main work**. The chat client (`apps/client/src/routes/chat.tsx`) currently
renders all tool results as `<ToolCall segment={segment} />` (text/JSON display). To
actually mount widget iframes, the client needs a **host-side bridge**.

### What the host bridge must do

```
tool result arrives with _meta.ui.resourceUri = "ui://examples/bar-chart"
  → detect the resourceUri annotation in the tool call segment
  → fetch widget HTML from MCP server:
      GET http://localhost:9010/mcp → resources/read("ui://examples/bar-chart")
  → render <iframe srcdoc={html} sandbox="allow-scripts" />
  → listen to iframe postMessage for "ui/initialize"
  → respond with hostContext (theme, style variables, capabilities)
  → forward tool result payload via "ui/notifications/tool-result" postMessage
  → handle ui/message and ui/update-model-context from widget → chat loop
```

### Proposed component tree in `chat.tsx`

```tsx
// Current — renders text/JSON
{segment._tag === "tool_call" && <ToolCall segment={segment} />}

// After — detect resourceUri and branch
{segment._tag === "tool_call" && segment.resourceUri ? (
  <McpAppHost
    resourceUri={segment.resourceUri}
    toolResult={segment.result}
    onMessage={(msg) => sendMessages([...history, msg])}
  />
) : (
  <ToolCall segment={segment} />
)}
```

### `McpAppHost` component responsibilities

```tsx
// apps/client/src/components/McpAppHost.tsx (new)
//
// 1. Fetch widget HTML via MCP resources/read
// 2. Render <iframe srcdoc={html} sandbox="allow-scripts allow-same-origin" />
// 3. postMessage bridge:
//    - Receive:  ui/initialize → send hostContext response
//    - Send:     ui/notifications/tool-result with structuredContent
//    - Receive:  ui/message → forward to chat loop
//    - Receive:  ui/notifications/size-changed → resize iframe
// 4. Apply own theme vars as hostContext.styles
```

This component is **self-contained** — it doesn't require changes to the agentic loop
or the MCP server, only the rendering layer of `chat.tsx`.

---

## Work Breakdown

```
1. Widget packages (new)
   packages/widget-bar-chart/
   packages/widget-line-chart/
   packages/widget-scatterplot/
   → React + @ext-apps/react + Plot/sszvis
   → vite-plugin-singlefile build

2. Shared schema (small)
   packages/domain/src/widget-payloads.ts
   → Move BarChartPayload, LineChartPayload, etc. here
   → Import from both server-mcp-ui and widget packages

3. Server wiring (trivial)
   apps/server-mcp-ui/src/widgets/*/
   → Swap inline HTML import for built widget HTML
   → No other changes needed

4. Client host bridge (main effort)
   apps/client/src/components/McpAppHost.tsx  (new)
   apps/client/src/routes/chat.tsx            (add resourceUri detection)
   → postMessage protocol implementation
   → iframe lifecycle management
   → theme variable injection as hostContext
```

| Step | Effort | Blocks |
|---|---|---|
| Widget packages | Medium | Step 3 |
| Shared schema | Small | Steps 1 + 3 |
| Server wiring | Trivial | Nothing |
| **Client host bridge** | **Main work** | End-to-end test |

---

## Does `apps/client` Need to Change?

**Yes, for end-to-end widget rendering.** The `apps/server-mcp-ui` server is already
correct. The chat client needs to:

1. Detect `ui.resourceUri` annotations on tool results (currently ignored)
2. Fetch the UI resource HTML from the MCP server
3. Mount a sandboxed `<iframe>` with that HTML
4. Implement the JSON-RPC `postMessage` host protocol

Without the client host bridge, widgets are served by the MCP server correctly but the
chat UI will continue to render tool results as plain text/JSON.

---

## References

- MCP Apps spec: <https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/2026-01-26/apps.mdx>
- `@ext-apps/react` API: <https://apps.extensions.modelcontextprotocol.io/api/modules/_modelcontextprotocol_ext-apps_react.html>
- MCP Apps blog post: <https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/>
- MCP Apps quickstart: <https://modelcontextprotocol.github.io/ext-apps/api/documents/Quickstart.html>
- `docs/react-mcp-widgets.md` — article notes
- `docs/mcp-integration.md` — MCP tool bridge into agentic loop
- `apps/server-mcp-ui/src/service/McpAppService.ts` — `makeUiResource` / `makeUiRenderTool`
- `apps/server-mcp-ui/src/widgets/bar-chart/` — existing widget pattern
