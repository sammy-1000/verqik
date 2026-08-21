import type { PrismaClient } from '@prisma/client';
import { ensureSupportedCities } from './seed-cities';

export const PERMISSIONS = [
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
  { name: 'verification:read', resource: 'verification', action: 'read' },
  { name: 'verification:review', resource: 'verification', action: 'review' },
  { name: 'cities:read', resource: 'cities', action: 'read' },
  { name: 'cities:manage', resource: 'cities', action: 'manage' },
  { name: 'rbac:manage', resource: 'rbac', action: 'manage' },
] as const;

export const ROLES: Record<
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
      'notifications:write',
      'cities:read',
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
      'notifications:write',
      'cities:read',
    ],
  },
};

export const ITEM_CATEGORIES = [
  { name: 'Documents', isRestricted: false },
  { name: 'Electronics', isRestricted: false },
  { name: 'Clothing', isRestricted: false },
  { name: 'Food & Perishables', isRestricted: true },
  { name: 'Liquids', isRestricted: true },
  { name: 'Hazardous Materials', isRestricted: true },
];

export const COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'DE', name: 'Germany', currency: 'EUR' },
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'NL', name: 'Netherlands', currency: 'EUR' },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED' },
  { code: 'IN', name: 'India', currency: 'USD' },
  { code: 'CN', name: 'China', currency: 'USD' },
  { code: 'JP', name: 'Japan', currency: 'USD' },
  { code: 'KE', name: 'Kenya', currency: 'KES' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR' },
  { code: 'GH', name: 'Ghana', currency: 'USD' },
  { code: 'TZ', name: 'Tanzania', currency: 'USD' },
  { code: 'UG', name: 'Uganda', currency: 'USD' },
  { code: 'RW', name: 'Rwanda', currency: 'USD' },
  { code: 'ET', name: 'Ethiopia', currency: 'USD' },
  { code: 'EG', name: 'Egypt', currency: 'USD' },
  { code: 'MA', name: 'Morocco', currency: 'USD' },
  { code: 'BR', name: 'Brazil', currency: 'USD' },
  { code: 'MX', name: 'Mexico', currency: 'USD' },
  { code: 'SG', name: 'Singapore', currency: 'USD' },
  { code: 'QA', name: 'Qatar', currency: 'USD' },
  { code: 'ES', name: 'Spain', currency: 'EUR' },
  { code: 'IT', name: 'Italy', currency: 'EUR' },
  { code: 'PT', name: 'Portugal', currency: 'EUR' },
  { code: 'BE', name: 'Belgium', currency: 'EUR' },
  { code: 'CH', name: 'Switzerland', currency: 'CHF' },
];

/** Idempotent — safe to run on every server boot. */
export async function ensureSeedData(prisma: PrismaClient) {
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { resource: perm.resource, action: perm.action },
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
      update: { isRestricted: category.isRestricted },
      create: category,
    });
  }

  for (const country of COUNTRIES) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: { name: country.name, currency: country.currency },
      create: country,
    });
  }

  await ensureSupportedCities(prisma);
}
