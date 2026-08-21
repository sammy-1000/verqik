#!/usr/bin/env node
import { confirm, input, password } from '@inquirer/prompts';
import { PrismaClient } from '@verqik/database';
import { ensureSeedData } from '@verqik/database';
import { loadEnvFiles } from '@verqik/database';
import { ensureAdminUser } from '../modules/admin/ensure-admin-user';

loadEnvFiles();

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function readFlag(argv: string[], name: string) {
  const prefix = `--${name}=`;
  return argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function parseArgs(argv: string[]) {
  const help = argv.includes('--help') || argv.includes('-h');
  const email = (readFlag(argv, 'email') ?? process.env.ADMIN_EMAIL)?.trim().toLowerCase();
  const password = readFlag(argv, 'password') ?? process.env.ADMIN_PASSWORD;
  const nonInteractive =
    argv.includes('--non-interactive') ||
    !process.stdin.isTTY ||
    (Boolean(email) && Boolean(password));

  return {
    help,
    nonInteractive,
    email,
    password,
    firstName: readFlag(argv, 'first-name') ?? process.env.ADMIN_FIRST_NAME ?? 'Platform',
    lastName: readFlag(argv, 'last-name') ?? process.env.ADMIN_LAST_NAME ?? 'Admin',
    resetPassword:
      argv.includes('--reset-password') ||
      process.env.ADMIN_RESET_PASSWORD === 'true',
  };
}

function printHelp() {
  console.log(`
Verqik — create or promote a system admin

Usage:
  pnpm admin:create [options]

Interactive (local):
  pnpm admin:create

Non-interactive (production / CI):
  pnpm admin:create --non-interactive \\
    --email=admin@example.com \\
    --password='secure-password' \\
    [--first-name=Platform] [--last-name=Admin] [--reset-password]

Environment:
  ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FIRST_NAME, ADMIN_LAST_NAME
  ADMIN_RESET_PASSWORD=true   Reset password when user already exists
`);
}

async function promptPassword(label = 'Password'): Promise<string> {
  const pass = await password({
    message: label,
    validate: (value) =>
      value.length >= 8 ? true : 'Password must be at least 8 characters',
  });

  const confirmPass = await password({
    message: 'Confirm password',
    validate: (value) => (value === pass ? true : 'Passwords do not match'),
  });

  if (confirmPass !== pass) {
    throw new Error('Passwords do not match');
  }

  return pass;
}

async function runNonInteractive(args: ReturnType<typeof parseArgs>) {
  if (!args.email || !isValidEmail(args.email)) {
    throw new Error('Set --email= or ADMIN_EMAIL to a valid email address');
  }
  if (!args.password || args.password.length < 8) {
    throw new Error('Set --password= or ADMIN_PASSWORD (min 8 characters)');
  }

  const prisma = new PrismaClient();
  try {
    await ensureSeedData(prisma);

    const existing = await prisma.user.findUnique({ where: { email: args.email } });
    const result = await ensureAdminUser(prisma, {
      email: args.email,
      password: args.password,
      firstName: args.firstName,
      lastName: args.lastName,
      resetPassword: existing ? args.resetPassword : true,
    });

    if (result.created) {
      console.log(`\nAdmin user created: ${result.email} (${result.userId})`);
      return;
    }

    console.log(`\nAdmin role ensured for ${result.email} (${result.userId})`);
    if (result.passwordUpdated) {
      console.log('Password updated.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function runInteractive() {
  console.log('\nVerqik — create system admin\n');

  const emailInput = await input({
    message: 'Admin email',
    validate: (value) =>
      isValidEmail(value.trim()) ? true : 'Enter a valid email address',
  });

  const email = emailInput.trim().toLowerCase();
  const prisma = new PrismaClient();

  try {
    await ensureSeedData(prisma);

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      console.log(`\nUser already exists: ${existing.firstName} ${existing.lastName}`);

      const grantAdmin = await confirm({
        message: 'Grant the admin role to this user?',
        default: true,
      });

      if (!grantAdmin) {
        console.log('Cancelled.');
        return;
      }

      const resetPassword = await confirm({
        message: 'Set a new password for this user?',
        default: false,
      });

      if (resetPassword) {
        const pass = await promptPassword('New password');
        const result = await ensureAdminUser(prisma, {
          email,
          password: pass,
          resetPassword: true,
        });
        console.log(`\nAdmin role granted and password updated for ${result.email}`);
        return;
      }

      const result = await ensureAdminUser(prisma, {
        email,
        password: '',
        resetPassword: false,
      });
      console.log(`\nAdmin role granted to ${result.email} (${result.userId})`);
      return;
    }

    const firstName = await input({
      message: 'First name',
      default: 'Platform',
      validate: (value) => (value.trim() ? true : 'First name is required'),
    });

    const lastName = await input({
      message: 'Last name',
      default: 'Admin',
      validate: (value) => (value.trim() ? true : 'Last name is required'),
    });

    const pass = await promptPassword();

    const result = await ensureAdminUser(prisma, {
      email,
      password: pass,
      firstName,
      lastName,
    });

    console.log(`\nAdmin user created: ${result.email} (${result.userId})`);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  if (args.nonInteractive) {
    await runNonInteractive(args);
    return;
  }

  await runInteractive();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
