import { Injectable } from '@nestjs/common';
import { Prisma, VerificationStatus } from '@verqik/database';
import { PrismaService } from '@verqik/database';

const userSummary = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileType: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class AdminVerificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  listPending() {
    return this.prisma.userVerification.findMany({
      where: { status: VerificationStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: userSummary } },
    });
  }

  findById(id: string) {
    return this.prisma.userVerification.findUnique({
      where: { id },
      include: { user: { select: userSummary } },
    });
  }

  async markReviewed(
    id: string,
    data: {
      status: typeof VerificationStatus.VERIFIED | typeof VerificationStatus.REJECTED;
      reviewedById: string;
      rejectionReason?: string | null;
    },
  ) {
    const result = await this.prisma.userVerification.updateMany({
      where: { id, status: VerificationStatus.PENDING },
      data: {
        status: data.status,
        reviewedById: data.reviewedById,
        reviewedAt: new Date(),
        rejectionReason: data.rejectionReason ?? null,
      },
    });

    if (result.count === 0) return null;

    return this.findById(id);
  }
}
