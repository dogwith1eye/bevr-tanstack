FROM oven/bun:alpine AS base
RUN apk update && apk add --no-cache jq libc6-compat
WORKDIR /app

# Step 1: Install dependencies only when needed
FROM base AS pruner
WORKDIR /app
COPY --chown=node:node . .
RUN bun add turbo --global
RUN turbo prune server-mcp-ui --docker

# Step 2: Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/full/ .

RUN bun install
RUN bun run build --filter=@repo/lit-lab...
RUN bun run build --filter=server-mcp-ui...

# Step 3: Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 server-mcp-ui
USER server-mcp-ui

COPY --from=builder /app/apps/server-mcp-ui/dist/index.js ./server-mcp-ui/index.js
COPY --from=builder /app/apps/server-mcp-ui/package.json ./server-mcp-ui/package.json

EXPOSE 9010

CMD ["bun", "run", "./server-mcp-ui/index.js"]
