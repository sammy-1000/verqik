import { Injectable } from '@nestjs/common';
import { PrismaService } from '@verqik/database';

@Injectable()
export class MessagingRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    deliveryRequestId: string;
    senderId: string;
    body?: string;
    attachmentUrl?: string;
  }) {
    return this.prisma.message.create({ data });
  }

  listForRequest(deliveryRequestId: string) {
    return this.prisma.message.findMany({
      where: { deliveryRequestId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
