import { Module } from '@nestjs/common';
import { DeliveryModule } from '../delivery/delivery.module';
import { UsersModule } from '../users/users.module';
import { ReviewsController } from './reviews.controller';
import { ReviewsRepository } from './reviews.repository';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [DeliveryModule, UsersModule],
  controllers: [ReviewsController],
  providers: [ReviewsRepository, ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
