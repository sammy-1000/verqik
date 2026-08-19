import { Injectable } from '@nestjs/common';
import { DeliveryService } from '../delivery/delivery.service';
import { DisputesRepository } from './disputes.repository';

@Injectable()
export class DisputesService {
  constructor(
    private readonly repository: DisputesRepository,
    private readonly deliveryService: DeliveryService,
  ) {}

  async raise(
    userId: string,
    data: { deliveryRequestId: string; reason: string },
  ) {
    await this.deliveryService.getById(data.deliveryRequestId, userId);
    return this.repository.create({ raisedById: userId, ...data });
  }

  listForUser(userId: string) {
    return this.repository.listForUser(userId);
  }

  resolve(id: string, adminId: string, resolution: string) {
    return this.repository.resolve(id, adminId, resolution);
  }
}
