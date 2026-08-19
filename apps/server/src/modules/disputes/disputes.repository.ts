import { Injectable } from '@nestjs/common';
import { DisputeStatus, PrismaService } from '@verqik/database';

@Injectable()
export class DisputesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    deliveryRequestId: string;
    raisedById: string;
    reason: string;
  }) {
    return this.prisma.dispute.create({ data });
  }

  findById(id: string) {
    return this.prisma.dispute.findUnique({ where: { id } });
  }

  listForUser(userId: string) {
    return this.prisma.dispute.findMany({
      where: { raisedById: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  resolve(id: string, resolvedById: string, resolution: string) {
    return this.prisma.dispute.update({
      where: { id },
      data: {
        status: DisputeStatus.RESOLVED,
        resolution,
        resolvedById,
        resolvedAt: new Date(),
      },
    });
  }
}
