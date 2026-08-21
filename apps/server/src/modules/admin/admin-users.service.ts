import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import type { CreateAdminUserDto } from './dto/admin-users.dto';
import { AdminUsersRepository } from './admin-users.repository';
import { ensureAdminUser } from './ensure-admin-user';
import { PrismaService } from '@verqik/database';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly repository: AdminUsersRepository,
    private readonly prisma: PrismaService,
  ) {}

  async list(filters: { q?: string }) {
    const rows = await this.repository.list({ q: filters.q, limit: 100 });
    return rows.map((row) => this.toRecord(row));
  }

  async createAdmin(dto: CreateAdminUserDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.repository.findByEmail(email);

    if (existing) {
      const result = await ensureAdminUser(this.prisma, {
        email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        resetPassword: true,
      });

      const row = await this.repository.list({ q: email, limit: 1 });
      const record = row[0] ? this.toRecord(row[0]) : null;
      if (!record) {
        throw new BadRequestException('Failed to load promoted user');
      }

      return {
        ...record,
        created: result.created,
        passwordUpdated: result.passwordUpdated,
        promoted: !result.created,
      };
    }

    const result = await ensureAdminUser(this.prisma, {
      email,
      password: dto.password,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
    });

    const row = await this.repository.list({ q: email, limit: 1 });
    const record = row[0] ? this.toRecord(row[0]) : null;
    if (!record) {
      throw new ConflictException('Admin user was created but could not be loaded');
    }

    return {
      ...record,
      created: result.created,
      passwordUpdated: result.passwordUpdated,
      promoted: false,
    };
  }

  private toRecord(row: Awaited<ReturnType<AdminUsersRepository['list']>>[number]) {
    return {
      id: row.id,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      profileType: row.profileType,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      roles: row.roles.map((entry) => entry.role.name),
      verificationStatus: row.verifications[0]?.status ?? 'UNVERIFIED',
    };
  }
}
