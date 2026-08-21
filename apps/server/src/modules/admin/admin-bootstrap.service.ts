import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@verqik/database';
import { ensureAdminUser } from './ensure-admin-user';

/** Optional non-interactive admin bootstrap via ADMIN_EMAIL + ADMIN_PASSWORD env vars. */
@Injectable()
export class AdminBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AdminBootstrapService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    const email = this.config.get<string>('ADMIN_EMAIL');
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!email || !password) return;

    const result = await ensureAdminUser(this.prisma, {
      email,
      password,
      resetPassword: true,
    });

    this.logger.log(
      result.created
        ? `Admin user created for ${result.email}`
        : `Admin role ensured for ${result.email}`,
    );
  }
}
