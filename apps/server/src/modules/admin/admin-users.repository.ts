import { Injectable } from '@nestjs/common';
import { Prisma } from '@verqik/database';
import { PrismaService } from '@verqik/database';

export const adminUserListSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileType: true,
  profilePhotoUrl: true,
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

export type AdminUserRow = Prisma.UserGetPayload<{ select: typeof adminUserListSelect }>;

@Injectable()
export class AdminUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(q?: string): Prisma.UserWhereInput | undefined {
    const trimmed = q?.trim();
    if (!trimmed) return undefined;
    return {
      OR: [
        { email: { contains: trimmed, mode: 'insensitive' } },
        { firstName: { contains: trimmed, mode: 'insensitive' } },
        { lastName: { contains: trimmed, mode: 'insensitive' } },
      ],
    };
  }

  count(filters: { q?: string }) {
    return this.prisma.user.count({ where: this.buildWhere(filters.q) });
  }

  listPaginated(filters: { q?: string; page: number; pageSize: number }) {
    const skip = (filters.page - 1) * filters.pageSize;
    return this.prisma.user.findMany({
      where: this.buildWhere(filters.q),
      orderBy: { createdAt: 'desc' },
      skip,
      take: filters.pageSize,
      select: adminUserListSelect,
    });
  }

  /** @deprecated use listPaginated */
  list(filters: { q?: string; limit?: number }) {
    return this.prisma.user.findMany({
      where: this.buildWhere(filters.q),
      orderBy: { createdAt: 'desc' },
      take: filters.limit ?? 100,
      select: adminUserListSelect,
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: adminUserListSelect,
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, email: true },
    });
  }

  update(
    id: string,
    data: Prisma.UserUpdateInput,
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: adminUserListSelect,
    });
  }

  delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  countAdmins() {
    return this.prisma.userRole.count({
      where: { role: { name: 'admin' } },
    });
  }

  hasAdminRole(userId: string) {
    return this.prisma.userRole.findFirst({
      where: { userId, role: { name: 'admin' } },
      select: { userId: true },
    });
  }

  assignRole(userId: string, roleName: string) {
    return this.prisma.role.findUnique({ where: { name: roleName } }).then((role) => {
      if (!role) return null;
      return this.prisma.userRole.upsert({
        where: { userId_roleId: { userId, roleId: role.id } },
        update: {},
        create: { userId, roleId: role.id },
      });
    });
  }

  revokeRole(userId: string, roleName: string) {
    return this.prisma.userRole.deleteMany({
      where: { userId, role: { name: roleName } },
    });
  }
}
