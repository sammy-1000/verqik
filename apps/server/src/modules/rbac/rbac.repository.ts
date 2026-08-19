import { Injectable } from '@nestjs/common';
import { PrismaService } from '@verqik/database';

@Injectable()
export class RbacRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    const permissionSet = new Set<string>();
    for (const userRole of userRoles) {
      for (const rp of userRole.role.permissions) {
        permissionSet.add(rp.permission.name);
      }
    }

    return [...permissionSet];
  }

  async assignRole(userId: string, roleName: string) {
    const role = await this.prisma.role.findUniqueOrThrow({
      where: { name: roleName },
    });

    return this.prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId: role.id } },
      update: {},
      create: { userId, roleId: role.id },
    });
  }

  async listRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
      },
      orderBy: { name: 'asc' },
    });
  }
}
