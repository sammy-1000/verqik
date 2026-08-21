import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationChannel, PrismaService } from '@verqik/database';
import { EmailService } from '@verqik/email';
import { PushEvents } from '../gateway/gateway.events';
import { GatewayPushService } from '../realtime/gateway-push.service';
import {
  NotificationEvent,
  NotificationProcessPayload,
  resolveNotificationTemplate,
} from './notification.events';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    userId: string;
    channel: NotificationChannel;
    eventType: string;
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

  markUnread(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: false },
    });
  }

  markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  countUnread(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
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

  unreadCount(userId: string) {
    return this.repository.countUnread(userId);
  }

  async markRead(id: string, userId: string) {
    const result = await this.repository.markRead(id, userId);
    if (result.count === 0) {
      throw new NotFoundException('Notification not found');
    }
    return { ok: true };
  }

  async markUnread(id: string, userId: string) {
    const result = await this.repository.markUnread(id, userId);
    if (result.count === 0) {
      throw new NotFoundException('Notification not found');
    }
    return { ok: true };
  }

  markAllRead(userId: string) {
    return this.repository.markAllRead(userId);
  }

  /** Single entry point for all domain notification events */
  async process(event: NotificationEvent, payload: NotificationProcessPayload) {
    const template = resolveNotificationTemplate(event, payload.meta);

    const notification = await this.repository.create({
      userId: payload.userId,
      channel: template.channel,
      eventType: event,
      title: template.title,
      body: template.body,
      relatedId: payload.relatedId,
    });

    if (template.channel === NotificationChannel.EMAIL && payload.email) {
      void this.emailService
        .send({
          to: payload.email,
          subject: template.title,
          text: template.body,
        })
        .catch(() => undefined);
    }

    if (this.push.isReady()) {
      this.push.toUser(payload.userId, PushEvents.NOTIFICATION_NEW, {
        notification,
      });
    }

    return notification;
  }

  /** @deprecated Use process() instead */
  async notify(data: {
    userId: string;
    channel: NotificationChannel;
    title: string;
    body?: string;
    relatedId?: string;
    email?: string;
  }) {
    const notification = await this.repository.create({
      userId: data.userId,
      channel: data.channel,
      eventType: 'legacy.manual',
      title: data.title,
      body: data.body,
      relatedId: data.relatedId,
    });

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
