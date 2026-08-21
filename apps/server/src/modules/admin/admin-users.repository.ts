import { Injectable } from '@nestjs/common';
import { Prisma } from '@verqik/database';
import { PrismaService } from '@verqik/database';

const userListSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileType: true,
  isActive: true,
  createdAt: true,
  roles: {
    select: {
      role: {
        select: { name: true },
      },
    },
  },
  verifications: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    select: { status: true },
  },
} satisfies Prisma.UserSelect;

export type AdminUserRow = Prisma.UserGetPayload<{ select: typeof userListSelect }>;

@Injectable()
export class AdminUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(filters: { q?: string; limit?: number }) {
    const q = filters.q?.trim();
    const where: Prisma.UserWhereInput | undefined = q
      ? {
          OR: [
            { email: { contains: q, mode: 'insensitive' } },
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
          ],
        }
      : undefined;

    return this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit ?? 100,
      select: userListSelect,
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, email: true },
    });
  }
}
