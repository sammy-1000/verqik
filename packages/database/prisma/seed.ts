import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PERMISSIONS = [
  { name: 'users:read', resource: 'users', action: 'read' },
  { name: 'users:write', resource: 'users', action: 'write' },
  { name: 'users:manage', resource: 'users', action: 'manage' },
  { name: 'journeys:read', resource: 'journeys', action: 'read' },
  { name: 'journeys:write', resource: 'journeys', action: 'write' },
  { name: 'journeys:manage', resource: 'journeys', action: 'manage' },
  { name: 'delivery:read', resource: 'delivery', action: 'read' },
  { name: 'delivery:write', resource: 'delivery', action: 'write' },
  { name: 'delivery:manage', resource: 'delivery', action: 'manage' },
  { name: 'payments:read', resource: 'payments', action: 'read' },
  { name: 'payments:write', resource: 'payments', action: 'write' },
  { name: 'payments:manage', resource: 'payments', action: 'manage' },
  { name: 'disputes:read', resource: 'disputes', action: 'read' },
  { name: 'disputes:manage', resource: 'disputes', action: 'manage' },
  { name: 'files:read', resource: 'files', action: 'read' },
  { name: 'files:write', resource: 'files', action: 'write' },
  { name: 'notifications:read', resource: 'notifications', action: 'read' },
  { name: 'notifications:write', resource: 'notifications', action: 'write' },
  { name: 'rbac:manage', resource: 'rbac', action: 'manage' },
] as const;

const ROLES: Record<
  string,
  { description: string; isSystem: boolean; permissions: string[] }
> = {
  admin: {
    description: 'Platform administrator',
    isSystem: true,
    permissions: PERMISSIONS.map((p) => p.name),
  },
  sender: {
    description: 'Package sender',
    isSystem: true,
    permissions: [
      'users:read',
      'users:write',
      'journeys:read',
      'delivery:read',
      'delivery:write',
      'payments:read',
      'payments:write',
      'files:read',
      'files:write',
      'notifications:read',
    ],
  },
  traveler: {
    description: 'Journey traveler',
    isSystem: true,
    permissions: [
      'users:read',
      'users:write',
      'journeys:read',
      'journeys:write',
      'delivery:read',
      'delivery:write',
      'payments:read',
      'files:read',
      'files:write',
      'notifications:read',
    ],
  },
};

const ITEM_CATEGORIES = [
  { name: 'Documents', isRestricted: false },
  { name: 'Electronics', isRestricted: false },
  { name: 'Clothing', isRestricted: false },
  { name: 'Food & Perishables', isRestricted: true },
  { name: 'Liquids', isRestricted: true },
  { name: 'Hazardous Materials', isRestricted: true },
];

async function main() {
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  for (const [roleName, config] of Object.entries(ROLES)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: { description: config.description },
      create: {
        name: roleName,
        description: config.description,
        isSystem: config.isSystem,
      },
    });

    for (const permName of config.permissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permName },
      });
      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  for (const category of ITEM_CATEGORIES) {
    await prisma.itemCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

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
