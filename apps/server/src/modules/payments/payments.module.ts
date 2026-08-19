import { Module } from '@nestjs/common';
import { DeliveryModule } from '../delivery/delivery.module';
import { PaymentsController } from './payments.controller';
import { PaymentsRepository } from './payments.repository';
import { PaymentsService } from './payments.service';

@Module({
  imports: [DeliveryModule],
  controllers: [PaymentsController],
  providers: [PaymentsRepository, PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
