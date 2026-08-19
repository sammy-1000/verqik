import { Injectable } from '@nestjs/common';
import { PrismaService, RequestStatus } from '@verqik/database';

@Injectable()
export class DeliveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    senderId: string;
    journeyId: string;
    travelerId: string;
    itemDescription: string;
    itemWeightKg: number;
    agreedPrice: number;
    itemCategoryId?: number;
    declaredValue?: number;
    pickupAddressId?: string;
    dropoffAddressId?: string;
    recipientName?: string;
    recipientPhone?: string;
    currency?: string;
  }) {
    return this.prisma.deliveryRequest.create({ data });
  }

  findById(id: string) {
    return this.prisma.deliveryRequest.findUnique({
      where: { id },
      include: { statusEvents: { orderBy: { createdAt: 'asc' } } },
    });
  }

  listForUser(userId: string) {
    return this.prisma.deliveryRequest.findMany({
      where: {
        OR: [{ senderId: userId }, { travelerId: userId }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  updateStatus(id: string, status: RequestStatus) {
    return this.prisma.deliveryRequest.update({
      where: { id },
      data: { status },
    });
  }

  addStatusEvent(data: {
    deliveryRequestId: string;
    status: RequestStatus;
    note?: string;
    changedById?: string;
  }) {
    return this.prisma.deliveryStatusEvent.create({ data });
  }

  listCategories() {
    return this.prisma.itemCategory.findMany({ orderBy: { name: 'asc' } });
  }
}
