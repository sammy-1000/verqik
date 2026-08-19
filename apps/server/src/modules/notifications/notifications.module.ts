import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import {
  NotificationsRepository,
  NotificationsService,
} from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsRepository, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
