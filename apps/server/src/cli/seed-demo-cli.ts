#!/usr/bin/env node
import { NestFactory } from '@nestjs/core';
import { ensureSeedData, loadEnvFiles, PrismaClient } from '@verqik/database';
import {
  DEMO_ADMIN,
  DEMO_DEFAULT_PASSWORD,
  DEMO_EMAIL_DOMAIN,
  DEMO_USERS,
} from '../seed/demo-seed.data';
import { SeedCliModule } from '../seed/seed-cli.module';
import { DemoSeedService } from '../seed/demo-seed.service';

loadEnvFiles();

function parseArgs(argv: string[]) {
  return {
    reset: argv.includes('--reset'),
    dryRun: argv.includes('--dry-run'),
    help: argv.includes('--help') || argv.includes('-h'),
    password:
      argv.find((a) => a.startsWith('--password='))?.split('=')[1] ??
      process.env.DEMO_SEED_PASSWORD ??
      DEMO_DEFAULT_PASSWORD,
  };
}

function printHelp() {
  console.log(`
Verqik — seed demo users, verifications, journeys, and delivery requests

Usage:
  pnpm seed:demo [options]

Options:
  --reset           Delete existing @demo.verqik.local users first
  --dry-run         Preview actions without writing
  --password=VALUE  Password for all demo accounts (default: DemoVerqik2026!)
  -h, --help        Show this help

Environment:
  DEMO_SEED_PASSWORD   Override default demo password

Creates:
  • Demo admin (${DEMO_ADMIN.email})
  • ${DEMO_USERS.length} demo users (travelers, senders, both)
  • Verified traveler profiles with profile photos
  • Upcoming journeys across East Africa → Europe corridors
  • Sample delivery requests between senders and travelers

All users use emails ending in ${DEMO_EMAIL_DOMAIN}
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  console.log('\nVerqik — demo seed\n');

  const prisma = new PrismaClient();
  try {
    await ensureSeedData(prisma);
  } finally {
    await prisma.$disconnect();
  }

  const app = await NestFactory.createApplicationContext(SeedCliModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const seeder = app.get(DemoSeedService);
    const result = await seeder.run({
      password: args.password,
      reset: args.reset,
      dryRun: args.dryRun,
    });

    if (!args.dryRun) {
      console.log('\n── Demo accounts ──');
      console.log(`Admin:    ${DEMO_ADMIN.email}`);
      console.log(`Password: ${args.password}`);
      console.log('\nTravelers:');
      for (const user of DEMO_USERS.filter((u) => u.verify)) {
        console.log(`  ${user.emailLocal}${DEMO_EMAIL_DOMAIN} — ${user.firstName} ${user.lastName}`);
      }
      console.log('\nSenders:');
      for (const user of DEMO_USERS.filter((u) => !u.verify)) {
        console.log(`  ${user.emailLocal}${DEMO_EMAIL_DOMAIN} — ${user.firstName} ${user.lastName}`);
      }
      console.log(`\nCreated ${result.journeys} journeys, ${result.deliveries} delivery requests.`);
    }
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
