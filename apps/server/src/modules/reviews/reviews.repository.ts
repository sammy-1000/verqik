import { Injectable } from '@nestjs/common';
import { PrismaService } from '@verqik/database';

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    deliveryRequestId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    comment?: string;
  }) {
    return this.prisma.review.create({ data });
  }

  listForUser(userId: string) {
    return this.prisma.review.findMany({
      where: { revieweeId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
