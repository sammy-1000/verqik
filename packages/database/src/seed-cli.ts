import { execSync } from 'node:child_process';
import path from 'node:path';
import { loadEnvFiles } from './env';

loadEnvFiles();

execSync('pnpm exec tsx prisma/seed.ts', {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
  env: process.env,
});
