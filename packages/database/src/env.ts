import { existsSync } from 'node:fs';
import path from 'node:path';
import { config } from 'dotenv';

/** Load DATABASE_URL and other vars from apps/server/.env in the monorepo. */
export function loadEnvFiles() {
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
