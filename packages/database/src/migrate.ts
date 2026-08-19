import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { config } from 'dotenv';

function loadEnvFiles() {
  const candidates = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '../../apps/server/.env'),
    path.join(process.cwd(), '../.env'),
    path.join(process.cwd(), '../../.env'),
    path.resolve(__dirname, '../../../apps/server/.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../../.env'),
  ];

  for (const envPath of candidates) {
    if (existsSync(envPath)) {
      config({ path: envPath, override: false });
    }
  }
}

/**
 * Applies pending Prisma migrations (non-interactive).
 * Loads `.env` from the server cwd when run via `pnpm dev` in apps/server.
 */
export function deployMigrations(): void {
  loadEnvFiles();

  const packageRoot = path.resolve(__dirname, '..');

  execSync('pnpm exec prisma migrate deploy', {
    cwd: packageRoot,
    stdio: 'inherit',
    env: process.env,
  });
}
