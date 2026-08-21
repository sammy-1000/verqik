#!/bin/sh
set -e

echo "Running database migrations..."
pnpm --filter @verqik/database exec prisma migrate deploy

echo "Starting Verqik API..."
cd /app/apps/server
exec node dist/main.js
