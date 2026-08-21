import { execSync } from 'node:child_process';
import path from 'node:path';
import { loadEnvFiles } from './env';

export function runPrismaCommand(args: string[]) {
  loadEnvFiles();

  const packageRoot = path.resolve(__dirname, '..');

  execSync(['pnpm', 'exec', 'prisma', ...args].join(' '), {
    cwd: packageRoot,
    stdio: 'inherit',
    env: process.env,
  });
}

/** Applies pending Prisma migrations (non-interactive). */
export function deployMigrations(): void {
  runPrismaCommand(['migrate', 'deploy']);
}

/** Creates and applies migrations in development (forwards CLI args). */
export function devMigrations(): void {
  runPrismaCommand(['migrate', 'dev', ...process.argv.slice(2)]);
}

/** Pushes schema changes without migration files. */
export function pushSchema(): void {
  runPrismaCommand(['db', 'push', ...process.argv.slice(2)]);
}
