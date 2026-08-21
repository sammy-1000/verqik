import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserProfileType } from '@verqik/database';
import * as bcrypt from 'bcrypt';
import type {
  CreateAdminUserDto,
  UpdateAdminUserDto,
} from './dto/admin-users.dto';
import { AdminUsersRepository, type AdminUserRow } from './admin-users.repository';
import { ensureAdminUser } from './ensure-admin-user';
import { PrismaService } from '@verqik/database';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly repository: AdminUsersRepository,
    private readonly prisma: PrismaService,
  ) {}

  async list(filters: { q?: string; page?: number; pageSize?: number }) {
    const pageSize = Math.min(Math.max(filters.pageSize ?? 10, 1), 100);
    const requestedPage = Math.max(filters.page ?? 1, 1);
    const total = await this.repository.count({ q: filters.q });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(requestedPage, totalPages);

    const rows = await this.repository.listPaginated({
      q: filters.q,
      page,
      pageSize,
    });

    return {
      items: rows.map((row) => this.toRecord(row)),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getById(userId: string) {
    const row = await this.repository.findById(userId);
    if (!row) throw new NotFoundException('User not found');
    return this.toRecord(row);
  }

  async createUser(dto: CreateAdminUserDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.repository.findByEmail(email);

    if (existing) {
      if (!dto.grantAdmin) {
        throw new ConflictException('Email already registered');
      }

      const result = await ensureAdminUser(this.prisma, {
        email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        resetPassword: true,
      });

      if (dto.profileType) {
        await this.repository.update(existing.id, {
          profileType: dto.profileType,
        });
        await this.syncProfileRoles(existing.id, dto.profileType);
      }

      return {
        ...(await this.getById(result.userId)),
        created: result.created,
        passwordUpdated: result.passwordUpdated,
        promoted: !result.created,
      };
    }

    if (dto.grantAdmin) {
      const result = await ensureAdminUser(this.prisma, {
        email,
        password: dto.password,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
      });

      if (dto.profileType && dto.profileType !== UserProfileType.BOTH) {
        await this.repository.update(result.userId, {
          profileType: dto.profileType,
        });
        await this.syncProfileRoles(result.userId, dto.profileType);
      }

      return {
        ...(await this.getById(result.userId)),
        created: true,
        passwordUpdated: true,
        promoted: false,
      };
    }

    const profileType = dto.profileType ?? UserProfileType.SENDER;
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        profileType,
      },
    });

    await this.syncProfileRoles(user.id, profileType);
    await this.prisma.wallet.create({ data: { userId: user.id } });

    return {
      ...(await this.getById(user.id)),
      created: true,
      passwordUpdated: true,
      promoted: false,
    };
  }

  async updateUser(
    userId: string,
    dto: UpdateAdminUserDto,
    actorUserId: string,
  ) {
    const existing = await this.repository.findById(userId);
    if (!existing) throw new NotFoundException('User not found');

    const data: {
      firstName?: string;
      lastName?: string;
      profileType?: UserProfileType;
      isActive?: boolean;
      passwordHash?: string;
    } = {};

    if (dto.firstName !== undefined) data.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) data.lastName = dto.lastName.trim();
    if (dto.profileType !== undefined) data.profileType = dto.profileType;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 12);
    }

    if (Object.keys(data).length > 0) {
      await this.repository.update(userId, data);
    }

    if (dto.profileType !== undefined) {
      await this.syncProfileRoles(userId, dto.profileType);
    }

    if (dto.grantAdmin !== undefined) {
      await this.setAdminRole(userId, dto.grantAdmin, actorUserId);
    }

    return this.getById(userId);
  }

  async deleteUser(userId: string, actorUserId: string) {
    if (userId === actorUserId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const existing = await this.repository.findById(userId);
    if (!existing) throw new NotFoundException('User not found');

    const isAdmin = existing.roles.some((entry) => entry.role.name === 'admin');
    if (isAdmin) {
      const adminCount = await this.repository.countAdmins();
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot delete the last admin account');
      }
    }

    await this.repository.delete(userId);
    return { deleted: true, userId };
  }

  /** @deprecated use createUser */
  createAdmin(dto: CreateAdminUserDto) {
    return this.createUser({ ...dto, grantAdmin: true });
  }

  private async syncProfileRoles(userId: string, profileType: UserProfileType) {
    await this.repository.revokeRole(userId, 'sender');
    await this.repository.revokeRole(userId, 'traveler');

    if (
      profileType === UserProfileType.SENDER ||
      profileType === UserProfileType.BOTH
    ) {
      await this.repository.assignRole(userId, 'sender');
    }
    if (
      profileType === UserProfileType.TRAVELER ||
      profileType === UserProfileType.BOTH
    ) {
      await this.repository.assignRole(userId, 'traveler');
    }
  }

  private async setAdminRole(
    userId: string,
    grantAdmin: boolean,
    actorUserId: string,
  ) {
    if (grantAdmin) {
      await this.repository.assignRole(userId, 'admin');
      return;
    }

    if (userId === actorUserId) {
      throw new BadRequestException('You cannot remove your own admin role');
    }

    const isAdmin = await this.repository.hasAdminRole(userId);
    if (!isAdmin) return;

    const adminCount = await this.repository.countAdmins();
    if (adminCount <= 1) {
      throw new BadRequestException('Cannot remove the last admin account');
    }

    await this.repository.revokeRole(userId, 'admin');
  }

  private toRecord(row: AdminUserRow) {
    return {
      id: row.id,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      profileType: row.profileType,
      profilePhotoUrl: row.profilePhotoUrl,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      roles: row.roles.map((entry) => entry.role.name),
      verificationStatus: row.verifications[0]?.status ?? 'UNVERIFIED',
    };
  }
}
