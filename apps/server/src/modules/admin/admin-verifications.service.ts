import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VerificationStatus } from '@verqik/database';
import { FilesService } from '../files/files.service';
import { NotificationEvent } from '../notifications/notification.events';
import { NotificationsService } from '../notifications/notifications.service';
import { GatewayPushService } from '../realtime/gateway-push.service';
import { PushEvents } from '../gateway/gateway.events';
import { AdminVerificationsRepository } from './admin-verifications.repository';

@Injectable()
export class AdminVerificationsService {
  constructor(
    private readonly repository: AdminVerificationsRepository,
    private readonly filesService: FilesService,
    private readonly notifications: NotificationsService,
    private readonly push: GatewayPushService,
  ) {}

  listPending() {
    return this.repository.listPending();
  }

  async getDetail(verificationId: string) {
    const verification = await this.repository.findById(verificationId);
    if (!verification) throw new NotFoundException('Verification not found');
    if (!verification.idDocumentUrl || !verification.selfieUrl) {
      throw new BadRequestException('Verification documents are missing');
    }

    const [idDocument, selfie] = await Promise.all([
      this.filesService.getAdminDownloadUrl(verification.idDocumentUrl),
      this.filesService.getAdminDownloadUrl(verification.selfieUrl),
    ]);

    return {
      ...verification,
      documents: {
        idDocument: {
          fileId: verification.idDocumentUrl,
          url: idDocument.url,
          mimeType: idDocument.file.mimeType,
          originalName: idDocument.file.originalName,
        },
        selfie: {
          fileId: verification.selfieUrl,
          url: selfie.url,
          mimeType: selfie.file.mimeType,
          originalName: selfie.file.originalName,
        },
      },
    };
  }

  async approve(verificationId: string, reviewerId: string) {
    const verification = await this.repository.markReviewed(verificationId, {
      status: VerificationStatus.VERIFIED,
      reviewedById: reviewerId,
      rejectionReason: null,
    });

    if (!verification) {
      throw new BadRequestException('Verification is not pending review');
    }

    await this.afterDecision(verification, NotificationEvent.VERIFICATION_APPROVED);
    return verification;
  }

  async reject(
    verificationId: string,
    reviewerId: string,
    rejectionReason: string,
  ) {
    const verification = await this.repository.markReviewed(verificationId, {
      status: VerificationStatus.REJECTED,
      reviewedById: reviewerId,
      rejectionReason,
    });

    if (!verification) {
      throw new BadRequestException('Verification is not pending review');
    }

    await this.afterDecision(
      verification,
      NotificationEvent.VERIFICATION_REJECTED,
      rejectionReason,
    );
    return verification;
  }

  private async afterDecision(
    verification: {
      id: string;
      userId: string;
      status: VerificationStatus;
      rejectionReason?: string | null;
    },
    event: NotificationEvent.VERIFICATION_APPROVED | NotificationEvent.VERIFICATION_REJECTED,
    rejectionReason?: string,
  ) {
    void this.notifications.process(event, {
      userId: verification.userId,
      relatedId: verification.id,
      meta: rejectionReason ? { reason: rejectionReason } : undefined,
    });

    if (this.push.isReady()) {
      this.push.toUser(verification.userId, PushEvents.VERIFICATION_UPDATED, {
        verification,
      });
    }
  }
}
