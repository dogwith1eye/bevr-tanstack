# Presence + Chat Integration Ideas

The Presence and Chat tabs are currently independent features. The presence system has a PubSub broadcast bus and real-time WebSocket connections to all clients; the chat service has a streaming LLM pipeline. Combining them opens up several useful multi-user patterns.

---

## Current architecture (separate)

```
Client A ──HTTP/NDJSON──► ChatService ──► Anthropic API
                                              │
                                         response only
                                         goes back to A

Client A ──WebSocket──► PresenceService (PubSub)
Client B ──WebSocket──► PresenceService (PubSub)
Client C ──WebSocket──► PresenceService (PubSub)
```

---

## 1. Broadcast a single LLM stream to all connected clients

**The most natural first step given the existing code.**

Right now the LLM runs once per HTTP request and the result goes back only to the requesting client. The `PresenceService` already has a PubSub that broadcasts to all subscribers. You could pipe `ChatStreamPart` events from the `ChatService` mailbox into that PubSub so every connected client receives the stream — without each making their own LLM call.

`ChatStreamPart` is already a typed event union; `WebSocketEvent` would just need a new variant to carry it.

```
Client A sends message
    │
    ▼
ChatService mailbox
    │
    ├──► HTTP stream back to Client A (existing)
    │
    └──► PresenceService PubSub
              │
              ├──► Client B WebSocket stream
              └──► Client C WebSocket stream
```

---

## 2. Shared AI conversation room

Multiple users connect to the same chat "room" and watch the same LLM response stream appear in real time — like a whiteboard session. The presence system already tracks who is connected, so you could show participant statuses alongside the streamed response.

Useful for: team Q&A, live demos, pair programming sessions where one person drives the prompt.

---

## 3. AI-assisted collaboration

Each user can see what others are asking the LLM and the responses they get. Avoids duplicate questions across a team and lets participants build on each other's threads.

This extends idea 1 by also broadcasting the *prompt* (not just the response), so all clients see the full exchange.

---

## 4. Presence-aware AI context

The LLM's system prompt could include who is currently connected and their status. The AI would then know it is talking to a group, could address participants, or adjust its response style accordingly.

Example system prompt injection:
```
Currently connected: 3 clients (1 online, 1 away, 1 busy).
```

This requires no changes to the transport layer — just enriching the prompt that `Chat.fromPrompt()` receives in `ChatService`.

---

## 5. Async hand-off

A user starts a chat, their status changes to `away`, and when they return the completed response is waiting. Other online users could see that a question is pending and optionally contribute follow-up prompts.

---

## Recommended starting point

**Option 1** is the lowest-effort path because:

- `PresenceService` already has a `PubSub` and a `subscribe` streaming RPC.
- `ChatStreamPart` is already a typed, serialisable event union.
- The server wiring would be: after `ChatService` offers an event to its mailbox, also publish it to `PresenceService.pubsub`.
- Clients already consume a stream of `WebSocketEvent` — adding a `chat_stream_part` variant to that union is a small domain change.

No new transport infrastructure is needed; it is a composition of two things that already exist.
