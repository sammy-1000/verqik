import { Injectable, Logger } from '@nestjs/common';
import type { Server } from 'socket.io';

@Injectable()
export class GatewayPushService {
  private readonly logger = new Logger(GatewayPushService.name);
  private server?: Server;

  setServer(server: Server) {
    this.server = server;
  }

  toUser(userId: string, event: string, data: unknown) {
    this.server?.to(`user:${userId}`).emit(event, data);
  }

  toUsers(userIds: string[], event: string, data: unknown) {
    for (const userId of userIds) {
      this.toUser(userId, event, data);
    }
  }

  toDelivery(requestId: string, event: string, data: unknown) {
    this.server?.to(`delivery:${requestId}`).emit(event, data);
  }

  toJourney(journeyId: string, event: string, data: unknown) {
    this.server?.to(`journey:${journeyId}`).emit(event, data);
  }

  broadcast(event: string, data: unknown) {
    this.server?.emit(event, data);
  }

  isReady() {
    return Boolean(this.server);
  }

  logNotReady(event: string) {
    this.logger.warn(`Push skipped (${event}): gateway not ready`);
  }
}
