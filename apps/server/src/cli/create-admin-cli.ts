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

async function main() {
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

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
