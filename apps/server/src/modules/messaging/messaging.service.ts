import { Injectable } from '@nestjs/common';
import { DeliveryService } from '../delivery/delivery.service';
import { PushEvents } from '../gateway/gateway.events';
import { GatewayPushService } from '../realtime/gateway-push.service';
import { MessagingRepository } from './messaging.repository';

@Injectable()
export class MessagingService {
  constructor(
    private readonly repository: MessagingRepository,
    private readonly deliveryService: DeliveryService,
    private readonly push: GatewayPushService,
  ) {}

  async send(
    senderId: string,
    data: {
      deliveryRequestId: string;
      body?: string;
      attachmentUrl?: string;
    },
  ) {
    const request = await this.deliveryService.getById(
      data.deliveryRequestId,
      senderId,
    );
    const message = await this.repository.create({ senderId, ...data });

    if (this.push.isReady()) {
      this.push.toDelivery(
        data.deliveryRequestId,
        PushEvents.MESSAGE_NEW,
        { message },
      );

      const recipientId =
        senderId === request.senderId ? request.travelerId : request.senderId;
      this.push.toUser(recipientId, PushEvents.MESSAGE_NEW, { message });
    }

    return message;
  }

  async list(deliveryRequestId: string, userId: string) {
    await this.deliveryService.getById(deliveryRequestId, userId);
    return this.repository.listForRequest(deliveryRequestId);
  }
}
