# Chat Workflow

This document describes how a user message travels from the chat UI to the LLM and back.

## Overview

```
User Input
  → Chat Component (React)
  → Chat Atom (Effect)
  → RPC Client (HTTP/NDJSON)
  → RPC Handler (Server)
  → Chat Service
  → Agentic Loop
  → Anthropic API (claude-haiku-4-5)
  → NDJSON Stream back to client
  → Chat Atom (stream accumulation)
  → UI re-render
```

---

## Step 1 — User submits a message

**`apps/client/src/routes/chat.tsx:91-99`**

`handleSend()` appends the new user message to the existing message history and calls `sendMessages(messages)`, which invokes `runChat(messages)` to kick off the Effect-based atom.

---

## Step 2 — Chat atom makes the RPC call

**`apps/client/src/lib/atoms/chat-atom.ts:11-16`**

The atom is an Effect that yields the `RpcClient` dependency and calls `rpc.client.chat({ messages })`. This returns a `Stream` of `ChatStreamPart` events. The atom uses `Stream.scan()` (lines 21–260) to accumulate those events into a single `ChatResponse` state object that the UI reads.

---

## Step 3 — RPC client sends the HTTP request

**`apps/client/src/lib/rpc-client.ts:6-13`**

The RPC client is configured to POST to `http://localhost:9000/rpc` (overridable via `VITE_SERVER_URL`) using NDJSON serialization. The `chat` endpoint is declared as a streaming RPC in the shared domain package:

**`packages/domain/src/Rpc.ts:19-25`**

```ts
chat: {
  payload: { messages: Schema.Array(ChatMessage) },
  success: ChatStreamPart,
  stream: true,
}
```

The `stream: true` flag means the server returns an NDJSON stream rather than a single JSON response, and the client consumes it as an Effect `Stream`.

---

## Step 4 — Server RPC handler receives the request

**`apps/server/src/Rpc/Event.ts:28-40`**

`EventRpcLive` implements the `chat` endpoint. It:

1. Receives the array of `ChatMessage` values from the client.
2. Transforms them into `Prompt.Message[]` (the format expected by `@effect/ai`).
3. Calls `bot.chat(messages)` from `ChatService`, which returns a `Mailbox` — a push-based stream.
4. Returns that mailbox to the RPC layer, which serialises it as NDJSON back to the client.

The server is wired up in **`apps/server/src/index.ts:40-51`** where `EventRpcLive`, `ChatService.Default`, and `FastModelLive` are all composed into the HTTP router layer.

---

## Step 5 — Chat Service initialises the LLM session

**`packages/ai/src/services/ChatService.ts:9-43`**

`ChatService.chat()`:

1. Creates a `Mailbox` that will hold streaming events.
2. Forks a background Effect that calls `Chat.fromPrompt()` to create an LLM session, binding it to a system prompt.
3. Gets the available tool definitions from the toolkit.
4. Calls `runAgenticLoop({ chat, mailbox, toolkit })`.
5. Returns the mailbox immediately so the RPC layer can begin streaming events to the client while the background Effect is still running.

---

## Step 6 — Agentic loop calls the LLM

**`packages/ai/src/workflow/AgenticLoop.ts`**

`runAgenticLoop()` (lines 193–236) uses `Effect.iterate()` to support multi-turn agentic behaviour (tool use → re-prompt → tool use → …).

Each iteration calls the inner `loop()` function (lines 16–180), which:

1. **Calls `chat.streamText({ prompt: [], toolkit })`** (line 39–43) — the actual LLM API call via `@effect/ai`.
2. Processes each chunk from the resulting stream:
   - `text-delta` / `text-complete` — streaming text tokens
   - `tool-params-start` / `tool-params-delta` / `tool-params-end` — the LLM generating a tool call
   - `tool-result` — the result of executing a tool
   - `finish` — completion signal with usage statistics
   - `error` — error events
3. Each event is offered to the mailbox using helpers from **`packages/ai/src/workflow/MailboxEvents.ts`**, which emit typed `ChatStreamPart` values.

The loop continues iterating as long as the LLM requests tool use. Once the LLM returns a plain text response, the loop terminates and the mailbox is closed.

---

## Step 7 — Language model layer

**`packages/ai/src/LanguageModel.ts:13-15`**

`FastModelLive` provides the `@effect/ai` language model layer backed by `claude-haiku-4-5` via the Anthropic client. The Anthropic API key is read from the `ANTHROPIC_API_KEY` environment variable.

---

## Step 8 — Response streams back to the UI

1. Each `ChatStreamPart` emitted to the mailbox is serialised as an NDJSON line and flushed to the HTTP response.
2. The `RpcClient` on the client side decodes each line back into a typed `ChatStreamPart`.
3. The `chatAtom`'s `Stream.scan()` accumulator folds each part into the current `ChatResponse` state.
4. React re-renders the chat component as state updates arrive.

---

## Domain types

| Type | File | Description |
|------|------|-------------|
| `ChatMessage` | `packages/domain/src/Chat.ts` | A single user or assistant message |
| `ChatStreamPart` | `packages/domain/src/Chat.ts:7-70` | Union of all streaming event variants |
| `ChatResponse` | `packages/domain/src/Chat.ts:128-144` | Accumulated client-side state for one response |
| `EventRpc` | `packages/domain/src/Rpc.ts` | RPC schema shared between client and server |

---

## Key dependencies

| Package | Purpose |
|---------|---------|
| `@effect/ai` | Provides `Chat`, `streamText`, and the Anthropic language model adapter |
| `@effect/rpc` | Type-safe RPC with streaming support over HTTP/NDJSON |
| `@tanstack/react-router` | File-based routing; the chat UI lives at `apps/client/src/routes/chat.tsx` |
| `jotai` + Effect atoms | Reactive client state; `chatAtom` bridges Effect streams into React |
