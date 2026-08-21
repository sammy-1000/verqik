import { Injectable } from '@nestjs/common';
import { PrismaService, RequestStatus } from '@verqik/database';

const deliveryInclude = {
  statusEvents: { orderBy: { createdAt: 'asc' as const } },
  journey: {
    select: {
      id: true,
      originCity: true,
      destinationCity: true,
      departureDate: true,
      arrivalDate: true,
      flightNumber: true,
      status: true,
      travelPhase: true,
      expectedLandingAt: true,
      actualLandingAt: true,
      rendezvousAddress: true,
      rendezvousNotes: true,
      lastTravelUpdateAt: true,
      travelUpdateNote: true,
    },
  },
  pickupPhotoFile: {
    select: { id: true, originalName: true, mimeType: true },
  },
  deliveryPhotoFile: {
    select: { id: true, originalName: true, mimeType: true },
  },
  itemPhotos: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      file: { select: { id: true, originalName: true, mimeType: true } },
    },
  },
};

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
    itemPhotoFileIds?: string[];
  }) {
    const { itemPhotoFileIds, ...rest } = data;
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.deliveryRequest.create({ data: rest });
      if (itemPhotoFileIds?.length) {
        await tx.deliveryRequestItemPhoto.createMany({
          data: itemPhotoFileIds.map((fileId, sortOrder) => ({
            deliveryRequestId: request.id,
            fileId,
            sortOrder,
          })),
        });
      }
      return tx.deliveryRequest.findUnique({
        where: { id: request.id },
        include: deliveryInclude,
      });
    });
  }

  findById(id: string) {
    return this.prisma.deliveryRequest.findUnique({
      where: { id },
      include: deliveryInclude,
    });
  }

  listForUser(userId: string) {
    return this.prisma.deliveryRequest.findMany({
      where: {
        OR: [{ senderId: userId }, { travelerId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      include: deliveryInclude,
    });
  }

  updateStatus(
    id: string,
    status: RequestStatus,
    extra: {
      pickupPhotoFileId?: string;
      deliveryPhotoFileId?: string;
      pickupRendezvousAddress?: string;
      deliveryRendezvousAddress?: string;
      pickupConfirmedAt?: Date;
      deliveredAt?: Date;
    } = {},
  ) {
    return this.prisma.deliveryRequest.update({
      where: { id },
      data: { status, ...extra },
      include: deliveryInclude,
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

  countActiveForJourney(journeyId: string) {
    return this.prisma.deliveryRequest.count({
      where: {
        journeyId,
        status: {
          in: [
            RequestStatus.ACCEPTED,
            RequestStatus.PICKED_UP,
            RequestStatus.IN_TRANSIT,
          ],
        },
      },
    });
  }

  allDeliveredForJourney(journeyId: string) {
    return this.prisma.deliveryRequest
      .findMany({
        where: {
          journeyId,
          status: {
            notIn: [RequestStatus.REJECTED, RequestStatus.CANCELLED],
          },
        },
        select: { status: true },
      })
      .then(
        (rows) =>
          rows.length > 0 &&
          rows.every((row) => row.status === RequestStatus.DELIVERED),
      );
  }
}
