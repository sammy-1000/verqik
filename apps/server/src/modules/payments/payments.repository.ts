import { Injectable } from '@nestjs/common';
import {
  PaymentMethodType,
  PaymentStatus,
  PrismaService,
} from '@verqik/database';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  getWallet(userId: string) {
    return this.prisma.wallet.findUnique({ where: { userId } });
  }

  createTransaction(data: {
    deliveryRequestId: string;
    payerId: string;
    amount: number;
    method: PaymentMethodType;
    platformFee?: number;
    currency?: string;
  }) {
    return this.prisma.transaction.create({
      data: {
        ...data,
        status: PaymentStatus.PENDING,
      },
    });
  }

  listForUser(userId: string) {
    return this.prisma.transaction.findMany({
      where: { OR: [{ payerId: userId }, { payeeId: userId }] },
      orderBy: { createdAt: 'desc' },
    });
  }

  updateStatus(id: string, status: PaymentStatus, extra?: { heldAt?: Date }) {
    return this.prisma.transaction.update({
      where: { id },
      data: { status, ...extra },
    });
  }
}
