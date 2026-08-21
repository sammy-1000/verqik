import { PrismaClient, UserProfileType } from '@verqik/database';
import * as bcrypt from 'bcrypt';

export interface EnsureAdminUserInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  resetPassword?: boolean;
}

export interface EnsureAdminUserResult {
  userId: string;
  email: string;
  created: boolean;
  roleAssigned: boolean;
  passwordUpdated: boolean;
}

async function assignAdminRole(prisma: PrismaClient, userId: string) {
  const role = await prisma.role.findUniqueOrThrow({
    where: { name: 'admin' },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId: role.id } },
    update: {},
    create: { userId, roleId: role.id },
  });
}

export async function ensureAdminUser(
  prisma: PrismaClient,
  input: EnsureAdminUserInput,
): Promise<EnsureAdminUserResult> {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await assignAdminRole(prisma, existing.id);

    let passwordUpdated = false;
    if (input.resetPassword) {
      const passwordHash = await bcrypt.hash(input.password, 12);
      await prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash },
      });
      passwordUpdated = true;
    }

    return {
      userId: existing.id,
      email,
      created: false,
      roleAssigned: true,
      passwordUpdated,
    };
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: input.firstName?.trim() || 'Platform',
      lastName: input.lastName?.trim() || 'Admin',
      profileType: UserProfileType.BOTH,
    },
  });

  await assignAdminRole(prisma, user.id);
  await prisma.wallet.create({ data: { userId: user.id } });

  return {
    userId: user.id,
    email,
    created: true,
    roleAssigned: true,
    passwordUpdated: true,
  };
}
