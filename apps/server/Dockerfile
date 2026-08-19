# syntax=docker/dockerfile:1

# ─── Build ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++ wget

RUN corepack enable && corepack prepare pnpm@10.33.4 --activate

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY turbo.json tsconfig.json ./

COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config
COPY packages/database ./packages/database
COPY packages/common ./packages/common
COPY packages/email ./packages/email
COPY packages/storage ./packages/storage

COPY apps/server ./apps/server

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @verqik/database build && \
    pnpm --filter @verqik/common build && \
    pnpm --filter @verqik/email build && \
    pnpm --filter @verqik/storage build

WORKDIR /app/apps/server
RUN pnpm build

# ─── Production ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache wget

RUN corepack enable && corepack prepare pnpm@10.33.4 --activate

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/typescript-config ./packages/typescript-config
COPY packages/database/package.json ./packages/database/package.json
COPY packages/database/prisma ./packages/database/prisma
COPY packages/database/src/migrate.ts ./packages/database/src/migrate.ts
COPY packages/database/src/migrate-cli.ts ./packages/database/src/migrate-cli.ts
COPY packages/common/package.json ./packages/common/package.json
COPY packages/email/package.json ./packages/email/package.json
COPY packages/storage/package.json ./packages/storage/package.json
COPY apps/server/package.json ./apps/server/package.json

RUN pnpm install --frozen-lockfile

COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/email/dist ./packages/email/dist
COPY --from=builder /app/packages/storage/dist ./packages/storage/dist
COPY --from=builder /app/apps/server/dist ./apps/server/dist

RUN pnpm --filter @verqik/database db:generate

COPY apps/server/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3001/api/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]
