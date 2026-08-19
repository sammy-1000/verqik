import { Module } from '@nestjs/common';
import { JourneysModule } from '../journeys/journeys.module';
import { DeliveryController } from './delivery.controller';
import { DeliveryRepository } from './delivery.repository';
import { DeliveryService } from './delivery.service';

@Module({
  imports: [JourneysModule],
  controllers: [DeliveryController],
  providers: [DeliveryRepository, DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
