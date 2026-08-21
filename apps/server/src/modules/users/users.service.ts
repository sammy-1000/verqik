import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { VerificationStatus } from '@verqik/database';
import { AppException } from '@verqik/common';
import { FilesService } from '../files/files.service';
import { NotificationEvent } from '../notifications/notification.events';
import { NotificationsService } from '../notifications/notifications.service';
import { RbacService } from '../rbac/rbac.service';
import { GatewayPushService } from '../realtime/gateway-push.service';
import { PushEvents } from '../gateway/gateway.events';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly filesService: FilesService,
    private readonly rbacService: RbacService,
    private readonly notifications: NotificationsService,
    private readonly push: GatewayPushService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    const [verification, permissions, roles] = await Promise.all([
      this.repository.getVerification(userId),
      this.rbacService.getUserPermissions(userId),
      this.rbacService.getUserRoles(userId),
    ]);
    const enriched = await this.enrichProfilePhoto(user);
    return { ...enriched, verification, permissions, roles };
  }

  async getPublicProfile(userId: string) {
    const user = await this.repository.findPublicById(userId);
    if (!user) throw new NotFoundException('User not found');
    const verification = await this.repository.getVerification(userId);
    const enriched = await this.enrichProfilePhoto(user);
    return {
      ...enriched,
      verification: verification
        ? { status: verification.status }
        : { status: VerificationStatus.UNVERIFIED },
    };
  }

  private async enrichProfilePhoto<
    T extends { profilePhotoUrl?: string | null; profilePhotoFileId?: string | null },
  >(user: T) {
    if (!user.profilePhotoFileId) return user;
    const url = await this.filesService.getPresignedUrl(user.profilePhotoFileId);
    return { ...user, profilePhotoUrl: url };
  }

  async updateProfile(
    userId: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      profilePhotoUrl: string;
      profilePhotoFileId: string;
      countryCode: string;
    }>,
  ) {
    const update: Parameters<UsersRepository['updateProfile']>[1] = {
      firstName: data.firstName,
      lastName: data.lastName,
      countryCode: data.countryCode,
    };

    if (data.profilePhotoFileId) {
      await this.filesService.assertOwnedUploadedFile(
        data.profilePhotoFileId,
        userId,
      );
      await this.filesService.linkToEntity(
        data.profilePhotoFileId,
        userId,
        'user',
        userId,
      );
      update.profilePhotoFileId = data.profilePhotoFileId;
      update.profilePhotoUrl = null;
    } else if (data.profilePhotoUrl !== undefined) {
      update.profilePhotoUrl = data.profilePhotoUrl;
    }

    await this.repository.updateProfile(userId, update);
    const profile = await this.getProfile(userId);

    if (this.push.isReady()) {
      this.push.toUser(userId, PushEvents.USER_UPDATED, { user: profile });
    }

    return profile;
  }

  createAddress(
    userId: string,
    data: {
      label?: string;
      line1: string;
      line2?: string;
      city: string;
      countryCode: string;
      postalCode?: string;
    },
  ) {
    return this.repository.createAddress(userId, data);
  }

  listAddresses(userId: string) {
    return this.repository.listAddresses(userId);
  }

  getVerification(userId: string) {
    return this.repository.getVerification(userId);
  }

  async assertVerifiedForTravel(userId: string) {
    const roles = await this.rbacService.getUserRoles(userId);
    if (roles.includes('admin')) return;

    const verification = await this.repository.getVerification(userId);
    if (verification?.status === VerificationStatus.VERIFIED) return;

    const status = verification?.status ?? VerificationStatus.UNVERIFIED;
    throw new AppException({
      userMessage:
        status === VerificationStatus.PENDING
          ? 'Your identity is under review. You can publish journeys once verified.'
          : 'Verify your identity before publishing a journey.',
      errorMessage: `Travel action blocked for user ${userId}: verification status is ${status}`,
      status: HttpStatus.FORBIDDEN,
    });
  }

  async submitVerification(
    userId: string,
    data: {
      idDocumentType: string;
      idDocumentFileId: string;
      selfieFileId: string;
    },
  ) {
    const existing = await this.repository.getVerification(userId);
    if (existing?.status === VerificationStatus.PENDING) {
      throw new BadRequestException('Verification already pending review');
    }
    if (existing?.status === VerificationStatus.VERIFIED) {
      throw new BadRequestException('Account already verified');
    }

    const idDocument = await this.filesService.assertOwnedUploadedFile(
      data.idDocumentFileId,
      userId,
    );
    const selfie = await this.filesService.assertOwnedUploadedFile(
      data.selfieFileId,
      userId,
    );

    const verification = await this.repository.upsertVerification(userId, {
      idDocumentType: data.idDocumentType,
      idDocumentUrl: idDocument.id,
      selfieUrl: selfie.id,
      status: VerificationStatus.PENDING,
      rejectionReason: null,
      reviewedAt: null,
      reviewedById: null,
    });

    await Promise.all([
      this.filesService.linkToEntity(
        idDocument.id,
        userId,
        'verification',
        verification.id,
      ),
      this.filesService.linkToEntity(
        selfie.id,
        userId,
        'verification',
        verification.id,
      ),
    ]);

    void this.notifications.process(NotificationEvent.VERIFICATION_SUBMITTED, {
      userId,
      relatedId: verification.id,
    });

    if (this.push.isReady()) {
      this.push.toUser(userId, PushEvents.VERIFICATION_UPDATED, {
        verification,
      });
    }

    return verification;
  }
}
