import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { ReferenceModule } from '../reference/reference.module';
import { UsersModule } from '../users/users.module';
import { JourneysController } from './journeys.controller';
import { JourneysQueryService } from './journeys-query.service';
import { JourneysRepository } from './journeys.repository';
import { JourneysService } from './journeys.service';

@Module({
  imports: [NotificationsModule, UsersModule, ReferenceModule],
  controllers: [JourneysController],
  providers: [JourneysRepository, JourneysService, JourneysQueryService],
  exports: [JourneysService, JourneysQueryService, JourneysRepository],
})
export class JourneysModule {}
