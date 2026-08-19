import { Module } from '@nestjs/common';
import { DeliveryModule } from '../delivery/delivery.module';
import { DisputesController } from './disputes.controller';
import { DisputesRepository } from './disputes.repository';
import { DisputesService } from './disputes.service';

@Module({
  imports: [DeliveryModule],
  controllers: [DisputesController],
  providers: [DisputesRepository, DisputesService],
})
export class DisputesModule {}
