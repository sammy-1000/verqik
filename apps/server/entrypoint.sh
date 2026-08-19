#!/bin/sh
set -e

echo "Running database migrations..."
pnpm --filter @verqik/database db:migrate:deploy

echo "Starting Verqik API..."
cd /app/apps/server
exec node dist/main.js
