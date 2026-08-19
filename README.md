# Verqik Monorepo

Crowdshipping platform — NestJS API + Next.js web app.

## Structure

```
apps/
  server/          NestJS API (modular monolith)
  web/             Next.js frontend
packages/
  database/        Prisma schema + client (@verqik/database)
  storage/         S3-compatible storage module (@verqik/storage)
  email/           SMTP email module (@verqik/email)
  common/          Shared decorators & types (@verqik/common)
  ui/              Shared UI components
```

## Backend architecture

- **Modular monolith**: each domain module owns its tables and writes only to its own data
- **Cross-module integration**: read-only query services + explicit integration services (e.g. `UsersRatingService`)
- **RBAC**: roles + permissions seeded via Prisma; `@RequirePermissions()` on routes
- **Storage**: reusable `@verqik/storage` — works with MinIO, AWS S3, or any S3-compatible provider
- **Email**: reusable `@verqik/email` — SMTP via nodemailer

## Getting started

```bash
pnpm install
cp apps/server/.env.example apps/server/.env
# Edit DATABASE_URL and other secrets

pnpm db:generate
pnpm db:migrate        # create new migrations (interactive)
pnpm db:migrate:deploy # apply pending migrations (CI / prod)
pnpm db:seed

pnpm dev:server   # API on :3001 — runs migrations automatically in dev
pnpm dev:web      # Web on :3000
```

API docs: `http://localhost:3001/api/docs`

## WebSocket (primary interface)

The app uses **Socket.IO** as the main client gateway. REST endpoints remain for Swagger/health, but all domain operations should go through WebSocket.

### Connect

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: { token: accessToken }, // JWT from auth:login
  transports: ['websocket', 'polling'],
});

socket.on('connected', (info) => console.log(info));
```

### Call any endpoint (RPC envelope)

```typescript
socket.emit('rpc', {
  id: 'req-1',
  event: 'delivery:requests:list',
  payload: {},
});

socket.on('rpc:result', ({ id, ok, data }) => { /* ... */ });
socket.on('rpc:error', ({ id, ok, error }) => { /* ... */ });
```

### Or emit events directly

```typescript
socket.emit('journeys:search', { originCountry: 'RW' }, (result) => {
  console.log(result);
});
```

### Real-time push events

| Event | When |
|-------|------|
| `notification:new` | New notification for user |
| `message:new` | Chat message on delivery |
| `delivery:status-changed` | Request status update |
| `delivery:request-created` | New delivery request |
| `payment:updated` | Escrow hold/release |

### Join rooms (live updates)

```typescript
socket.emit('room:join', { type: 'delivery', id: requestId });
socket.on('message:new', handler);
socket.on('delivery:status-changed', handler);
```

### All RPC events

`auth:register`, `auth:login`, `users:me:get`, `users:me:update`, `users:addresses:list`, `users:addresses:create`, `rbac:roles:list`, `files:upload-url`, `files:confirm`, `files:download-url`, `files:delete`, `journeys:create`, `journeys:search`, `journeys:cancel`, `delivery:categories`, `delivery:requests:create`, `delivery:requests:list`, `delivery:requests:get`, `delivery:requests:transition`, `payments:wallet`, `payments:transactions`, `payments:escrow:hold`, `payments:escrow:release`, `reviews:create`, `reviews:list`, `messaging:send`, `messaging:list`, `disputes:raise`, `disputes:list`, `disputes:resolve`, `notifications:list`, `notifications:read`, `reference:countries`, `health:check`

## Domain modules

| Module | Responsibility |
|--------|----------------|
| auth | JWT login/register |
| rbac | Roles & permissions |
| users | Profiles, addresses |
| files | S3 uploads (uses storage package) |
| journeys | Traveler trips |
| delivery | Package requests & status |
| payments | Wallets, escrow |
| reviews | Ratings |
| messaging | Per-request chat |
| disputes | Dispute resolution |
| notifications | In-app + email alerts |
| reference | Countries lookup |
