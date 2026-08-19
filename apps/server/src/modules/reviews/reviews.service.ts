import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { DeliveryService } from '../delivery/delivery.service';
import { UsersRatingService } from '../users/users-rating.service';
import { ReviewsRepository } from './reviews.repository';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly repository: ReviewsRepository,
    private readonly deliveryService: DeliveryService,
    private readonly usersRating: UsersRatingService,
  ) {}

  async create(
    reviewerId: string,
    data: {
      deliveryRequestId: string;
      revieweeId: string;
      rating: number;
      comment?: string;
    },
  ) {
    const request = await this.deliveryService.getById(
      data.deliveryRequestId,
      reviewerId,
    );

    if (
      data.revieweeId !== request.senderId &&
      data.revieweeId !== request.travelerId
    ) {
      throw new BadRequestException('Reviewee must be part of the delivery');
    }

    const review = await this.repository.create({
      reviewerId,
      ...data,
    });

    await this.usersRating.applyReview(data.revieweeId, data.rating);

    return review;
  }

  listForUser(userId: string) {
    return this.repository.listForUser(userId);
  }
}
