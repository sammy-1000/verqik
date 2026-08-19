import { Injectable } from '@nestjs/common';
import { NotificationChannel, PrismaService } from '@verqik/database';
import { EmailService } from '@verqik/email';
import { PushEvents } from '../gateway/gateway.events';
import { GatewayPushService } from '../realtime/gateway-push.service';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    userId: string;
    channel: NotificationChannel;
    title: string;
    body?: string;
    relatedId?: string;
  }) {
    return this.prisma.notification.create({ data });
  }

  listForUser(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        isRead: unreadOnly ? false : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly repository: NotificationsRepository,
    private readonly emailService: EmailService,
    private readonly push: GatewayPushService,
  ) {}

  list(userId: string, unreadOnly = false) {
    return this.repository.listForUser(userId, unreadOnly);
  }

  markRead(id: string, userId: string) {
    return this.repository.markRead(id, userId);
  }

  async notify(data: {
    userId: string;
    channel: NotificationChannel;
    title: string;
    body?: string;
    relatedId?: string;
    email?: string;
  }) {
    const notification = await this.repository.create(data);

    if (data.channel === NotificationChannel.EMAIL && data.email) {
      void this.emailService
        .send({
          to: data.email,
          subject: data.title,
          text: data.body,
        })
        .catch(() => undefined);
    }

    if (this.push.isReady()) {
      this.push.toUser(data.userId, PushEvents.NOTIFICATION_NEW, {
        notification,
      });
    }

    return notification;
  }
}
