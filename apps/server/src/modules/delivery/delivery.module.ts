import { Module, forwardRef } from '@nestjs/common';
import { FilesModule } from '../files/files.module';
import { JourneysModule } from '../journeys/journeys.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DeliveryController } from './delivery.controller';
import { DeliveryRepository } from './delivery.repository';
import { DeliveryService } from './delivery.service';

@Module({
  imports: [forwardRef(() => JourneysModule), NotificationsModule, FilesModule],
  controllers: [DeliveryController],
  providers: [DeliveryRepository, DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
