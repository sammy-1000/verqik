import { Module } from '@nestjs/common';
import { DeliveryModule } from '../delivery/delivery.module';
import { MessagingController } from './messaging.controller';
import { MessagingRepository } from './messaging.repository';
import { MessagingService } from './messaging.service';

@Module({
  imports: [DeliveryModule],
  controllers: [MessagingController],
  providers: [MessagingRepository, MessagingService],
})
export class MessagingModule {}
