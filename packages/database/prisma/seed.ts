import { PrismaClient } from '@prisma/client';
import { ensureSeedData } from '../src/seed-data';

const prisma = new PrismaClient();

async function main() {
  await ensureSeedData(prisma);
  console.log('Seed completed: RBAC roles/permissions and item categories');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
