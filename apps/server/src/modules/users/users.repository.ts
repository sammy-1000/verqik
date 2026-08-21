import { Injectable } from '@nestjs/common';
import { Prisma, UserProfileType, VerificationStatus } from '@verqik/database';
import { PrismaService } from '@verqik/database';

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileType: true,
  profilePhotoUrl: true,
  profilePhotoFileId: true,
  countryCode: true,
  isActive: true,
  ratingAvg: true,
  ratingCount: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  }

  findPublicById(id: string) {
    return this.prisma.user.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profilePhotoUrl: true,
        profilePhotoFileId: true,
        ratingAvg: true,
        ratingCount: true,
        createdAt: true,
      },
    });
  }

  create(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    profileType: UserProfileType;
  }) {
    return this.prisma.user.create({
      data,
      select: userSelect,
    });
  }

  updateProfile(
    userId: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      profilePhotoUrl: string | null;
      profilePhotoFileId: string | null;
      countryCode: string;
    }>,
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: userSelect,
    });
  }

  createWallet(userId: string) {
    return this.prisma.wallet.create({
      data: { userId },
    });
  }

  storeRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    return this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
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
    return this.prisma.address.create({
      data: { userId, ...data },
    });
  }

  listAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  getVerification(userId: string) {
    return this.prisma.userVerification.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  upsertVerification(
    userId: string,
    data: {
      idDocumentType: string;
      idDocumentUrl: string;
      selfieUrl: string;
      status: VerificationStatus;
      rejectionReason?: string | null;
      reviewedAt?: Date | null;
      reviewedById?: string | null;
    },
  ) {
    return this.prisma.userVerification.create({
      data: {
        userId,
        idDocumentType: data.idDocumentType,
        idDocumentUrl: data.idDocumentUrl,
        selfieUrl: data.selfieUrl,
        status: data.status,
        rejectionReason: data.rejectionReason ?? undefined,
        reviewedAt: data.reviewedAt ?? undefined,
        reviewedById: data.reviewedById ?? undefined,
      },
    });
  }

  updateRating(userId: string, ratingAvg: number, ratingCount: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { ratingAvg, ratingCount },
      select: userSelect,
    });
  }
}
