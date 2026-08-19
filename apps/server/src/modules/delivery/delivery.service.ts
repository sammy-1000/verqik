import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestStatus } from '@verqik/database';
import { JourneysQueryService } from '../journeys/journeys-query.service';
import { DeliveryRepository } from './delivery.repository';
import { GatewayPushService } from '../realtime/gateway-push.service';
import { PushEvents } from '../gateway/gateway.events';

@Injectable()
export class DeliveryService {
  constructor(
    private readonly repository: DeliveryRepository,
    private readonly journeysQuery: JourneysQueryService,
    private readonly push: GatewayPushService,
  ) {}

  listCategories() {
    return this.repository.listCategories();
  }

  async createRequest(
    senderId: string,
    data: {
      journeyId: string;
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
    },
  ) {
    const journey = await this.journeysQuery.findById(data.journeyId);
    if (!journey) throw new NotFoundException('Journey not found');
    if (journey.travelerId === senderId) {
      throw new BadRequestException('Cannot request delivery on your own journey');
    }

    const request = await this.repository.create({
      senderId,
      travelerId: journey.travelerId,
      ...data,
    });

    await this.repository.addStatusEvent({
      deliveryRequestId: request.id,
      status: RequestStatus.PENDING,
      changedById: senderId,
      note: 'Request created',
    });

    if (this.push.isReady()) {
      this.push.toUser(journey.travelerId, PushEvents.DELIVERY_REQUEST_CREATED, {
        request,
      });
      this.push.toDelivery(request.id, PushEvents.DELIVERY_REQUEST_CREATED, {
        request,
      });
    }

    return request;
  }

  listForUser(userId: string) {
    return this.repository.listForUser(userId);
  }

  async getById(id: string, userId: string) {
    const request = await this.repository.findById(id);
    if (!request) throw new NotFoundException('Delivery request not found');
    if (request.senderId !== userId && request.travelerId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return request;
  }

  async transition(
    id: string,
    userId: string,
    status: RequestStatus,
    note?: string,
  ) {
    const request = await this.getById(id, userId);

    const allowed: Partial<Record<RequestStatus, RequestStatus[]>> = {
      [RequestStatus.PENDING]: [
        RequestStatus.ACCEPTED,
        RequestStatus.REJECTED,
        RequestStatus.CANCELLED,
      ],
      [RequestStatus.ACCEPTED]: [
        RequestStatus.PICKED_UP,
        RequestStatus.CANCELLED,
      ],
      [RequestStatus.PICKED_UP]: [RequestStatus.IN_TRANSIT],
      [RequestStatus.IN_TRANSIT]: [RequestStatus.DELIVERED],
    };

    const nextStatuses = allowed[request.status] ?? [];
    if (!nextStatuses.includes(status)) {
      throw new BadRequestException(
        `Cannot transition from ${request.status} to ${status}`,
      );
    }

    const travelerActions: RequestStatus[] = [
      RequestStatus.ACCEPTED,
      RequestStatus.REJECTED,
      RequestStatus.PICKED_UP,
      RequestStatus.IN_TRANSIT,
      RequestStatus.DELIVERED,
    ];

    if (travelerActions.includes(status) && request.travelerId !== userId) {
      throw new ForbiddenException('Only the traveler can perform this action');
    }

    if (status === RequestStatus.CANCELLED && request.senderId !== userId) {
      throw new ForbiddenException('Only the sender can cancel');
    }

    await this.repository.addStatusEvent({
      deliveryRequestId: id,
      status,
      changedById: userId,
      note,
    });

    const updated = await this.repository.updateStatus(id, status);

    if (this.push.isReady()) {
      const payload = { requestId: id, status, note, changedBy: userId };
      this.push.toDelivery(id, PushEvents.DELIVERY_STATUS_CHANGED, payload);
      this.push.toUsers(
        [request.senderId, request.travelerId],
        PushEvents.DELIVERY_STATUS_CHANGED,
        payload,
      );
    }

    return updated;
  }
}
