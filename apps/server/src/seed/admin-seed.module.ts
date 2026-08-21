import { Module } from '@nestjs/common';
import { FilesModule } from '../modules/files/files.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { AdminVerificationsRepository } from '../modules/admin/admin-verifications.repository';
import { AdminVerificationsService } from '../modules/admin/admin-verifications.service';

/** Admin verification review only — no HTTP controllers or bootstrap hooks */
@Module({
  imports: [FilesModule, NotificationsModule],
  providers: [AdminVerificationsRepository, AdminVerificationsService],
  exports: [AdminVerificationsService],
})
export class AdminSeedModule {}
