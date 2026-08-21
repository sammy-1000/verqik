import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JourneyStatus, RequestStatus, TravelPhase } from '@verqik/database';
import { FilesService } from '../files/files.service';
import { JourneysRepository } from '../journeys/journeys.repository';
import { JourneysQueryService } from '../journeys/journeys-query.service';
import { NotificationEvent } from '../notifications/notification.events';
import { NotificationsService } from '../notifications/notifications.service';
import { DeliveryRepository } from './delivery.repository';
import { GatewayPushService } from '../realtime/gateway-push.service';
import { PushEvents } from '../gateway/gateway.events';
import type { TransitionDeliveryDto } from './dto/delivery.dto';

const STATUS_TO_NOTIFICATION: Partial<Record<RequestStatus, NotificationEvent>> = {
  [RequestStatus.ACCEPTED]: NotificationEvent.DELIVERY_REQUEST_ACCEPTED,
  [RequestStatus.REJECTED]: NotificationEvent.DELIVERY_REQUEST_REJECTED,
  [RequestStatus.CANCELLED]: NotificationEvent.DELIVERY_REQUEST_CANCELLED,
  [RequestStatus.PICKED_UP]: NotificationEvent.DELIVERY_PICKED_UP,
  [RequestStatus.IN_TRANSIT]: NotificationEvent.DELIVERY_IN_TRANSIT,
  [RequestStatus.DELIVERED]: NotificationEvent.DELIVERY_DELIVERED,
};

@Injectable()
export class DeliveryService {
  constructor(
    private readonly repository: DeliveryRepository,
    private readonly journeysQuery: JourneysQueryService,
    private readonly journeysRepository: JourneysRepository,
    private readonly filesService: FilesService,
    private readonly push: GatewayPushService,
    private readonly notifications: NotificationsService,
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
      itemPhotoFileIds?: string[];
    },
  ) {
    const journey = await this.journeysQuery.findById(data.journeyId);
    if (!journey) throw new NotFoundException('Journey not found');
    if (journey.travelerId === senderId) {
      throw new BadRequestException('Cannot request delivery on your own journey');
    }

    if (data.itemPhotoFileIds?.length) {
      for (const fileId of data.itemPhotoFileIds) {
        await this.filesService.assertOwnedUploadedFile(fileId, senderId);
      }
    }

    const request = await this.repository.create({
      senderId,
      travelerId: journey.travelerId,
      ...data,
    });
    if (!request) throw new NotFoundException('Failed to create delivery request');

    if (data.itemPhotoFileIds?.length) {
      await Promise.all(
        data.itemPhotoFileIds.map((fileId) =>
          this.filesService.linkToEntity(
            fileId,
            senderId,
            'delivery_request',
            request.id,
          ),
        ),
      );
    }

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

    void this.notifications.process(NotificationEvent.DELIVERY_REQUEST_CREATED, {
      userId: journey.travelerId,
      relatedId: request.id,
    });

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
    dto: TransitionDeliveryDto,
  ) {
    const { status, note, pickupPhotoFileId, deliveryPhotoFileId, rendezvousAddress } =
      dto;
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

    const updateExtra: {
      pickupPhotoFileId?: string;
      deliveryPhotoFileId?: string;
      pickupRendezvousAddress?: string;
      deliveryRendezvousAddress?: string;
      pickupConfirmedAt?: Date;
      deliveredAt?: Date;
    } = {};

    if (status === RequestStatus.ACCEPTED && rendezvousAddress?.trim()) {
      updateExtra.pickupRendezvousAddress = rendezvousAddress.trim();
    }

    if (status === RequestStatus.PICKED_UP) {
      if (!pickupPhotoFileId) {
        throw new BadRequestException('Pickup photo is required');
      }
      const file = await this.filesService.assertOwnedUploadedFile(
        pickupPhotoFileId,
        userId,
      );
      if (!file.mimeType.startsWith('image/')) {
        throw new BadRequestException('Pickup evidence must be an image');
      }
      await this.filesService.linkToEntity(
        pickupPhotoFileId,
        userId,
        'delivery_request',
        id,
      );
      updateExtra.pickupPhotoFileId = pickupPhotoFileId;
      updateExtra.pickupConfirmedAt = new Date();
      if (rendezvousAddress?.trim()) {
        updateExtra.pickupRendezvousAddress = rendezvousAddress.trim();
      }
    }

    if (status === RequestStatus.DELIVERED) {
      if (!deliveryPhotoFileId) {
        throw new BadRequestException('Delivery photo is required');
      }
      const file = await this.filesService.assertOwnedUploadedFile(
        deliveryPhotoFileId,
        userId,
      );
      if (!file.mimeType.startsWith('image/')) {
        throw new BadRequestException('Delivery evidence must be an image');
      }
      await this.filesService.linkToEntity(
        deliveryPhotoFileId,
        userId,
        'delivery_request',
        id,
      );
      updateExtra.deliveryPhotoFileId = deliveryPhotoFileId;
      updateExtra.deliveredAt = new Date();
      if (rendezvousAddress?.trim()) {
        updateExtra.deliveryRendezvousAddress = rendezvousAddress.trim();
      }
    }

    await this.repository.addStatusEvent({
      deliveryRequestId: id,
      status,
      changedById: userId,
      note,
    });

    const updated = await this.repository.updateStatus(id, status, updateExtra);

    await this.syncJourneyProgress(request.journeyId, status);

    if (this.push.isReady()) {
      const payload = { requestId: id, status, note, request: updated };
      this.push.toDelivery(id, PushEvents.DELIVERY_STATUS_CHANGED, payload);
      this.push.toUsers(
        [request.senderId, request.travelerId],
        PushEvents.DELIVERY_STATUS_CHANGED,
        payload,
      );
    }

    const notificationEvent = STATUS_TO_NOTIFICATION[status];
    if (notificationEvent) {
      const notifyUserId =
        status === RequestStatus.CANCELLED && userId === request.senderId
          ? request.travelerId
          : request.senderId;

      void this.notifications.process(notificationEvent, {
        userId: notifyUserId,
        relatedId: id,
      });
    }

    return updated;
  }

  private async syncJourneyProgress(journeyId: string, status: RequestStatus) {
    if (status === RequestStatus.PICKED_UP) {
      await this.journeysRepository.updateTravel(journeyId, {
        status: JourneyStatus.IN_TRANSIT,
        travelPhase: TravelPhase.DEPARTED,
        lastTravelUpdateAt: new Date(),
      });
      return;
    }

    if (status === RequestStatus.IN_TRANSIT) {
      await this.journeysRepository.updateTravel(journeyId, {
        travelPhase: TravelPhase.EN_ROUTE,
        lastTravelUpdateAt: new Date(),
      });
      return;
    }

    if (status === RequestStatus.DELIVERED) {
      const allDone = await this.repository.allDeliveredForJourney(journeyId);
      if (allDone) {
        await this.journeysRepository.updateTravel(journeyId, {
          status: JourneyStatus.COMPLETED,
          travelPhase: TravelPhase.AT_RENDEZVOUS,
          lastTravelUpdateAt: new Date(),
        });
      }
    }
  }
}
