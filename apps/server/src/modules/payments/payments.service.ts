import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentMethodType, PaymentStatus } from '@verqik/database';
import { PushEvents } from '../gateway/gateway.events';
import { GatewayPushService } from '../realtime/gateway-push.service';
import { DeliveryService } from '../delivery/delivery.service';
import { PaymentsRepository } from './payments.repository';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly repository: PaymentsRepository,
    private readonly deliveryService: DeliveryService,
    private readonly push: GatewayPushService,
  ) {}

  getWallet(userId: string) {
    return this.repository.getWallet(userId);
  }

  listTransactions(userId: string) {
    return this.repository.listForUser(userId);
  }

  async holdEscrow(
    payerId: string,
    data: {
      deliveryRequestId: string;
      amount: number;
      method: PaymentMethodType;
      platformFee?: number;
    },
  ) {
    await this.deliveryService.getById(data.deliveryRequestId, payerId);

    const tx = await this.repository.createTransaction({
      payerId,
      ...data,
    });

    const updated = await this.repository.updateStatus(
      tx.id,
      PaymentStatus.HELD_IN_ESCROW,
      { heldAt: new Date() },
    );

    if (this.push.isReady()) {
      this.push.toDelivery(data.deliveryRequestId, PushEvents.PAYMENT_UPDATED, {
        transaction: updated,
      });
    }

    return updated;
  }

  async releaseEscrow(transactionId: string, travelerId: string) {
    const tx = await this.repository.listForUser(travelerId).then((list) =>
      list.find((t) => t.id === transactionId),
    );
    if (!tx) throw new NotFoundException('Transaction not found');

    const request = await this.deliveryService.getById(
      tx.deliveryRequestId,
      travelerId,
    );
    if (request.travelerId !== travelerId) {
      throw new ForbiddenException('Only traveler can release escrow');
    }

    const updated = await this.repository.updateStatus(
      tx.id,
      PaymentStatus.RELEASED,
    );

    if (this.push.isReady()) {
      this.push.toDelivery(tx.deliveryRequestId, PushEvents.PAYMENT_UPDATED, {
        transaction: updated,
      });
      this.push.toUsers(
        [request.senderId, request.travelerId],
        PushEvents.PAYMENT_UPDATED,
        { transaction: updated },
      );
    }

    return updated;
  }
}
