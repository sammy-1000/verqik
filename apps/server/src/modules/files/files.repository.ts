import { Injectable } from '@nestjs/common';
import { FileStatus, PrismaService } from '@verqik/database';

@Injectable()
export class FilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    key: string;
    bucket: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    ownerId?: string;
    module: string;
    entityType?: string;
    entityId?: string;
  }) {
    return this.prisma.file.create({ data });
  }

  findById(id: string) {
    return this.prisma.file.findUnique({ where: { id } });
  }

  findDeliveryRequest(id: string) {
    return this.prisma.deliveryRequest.findUnique({
      where: { id },
      select: { senderId: true, travelerId: true },
    });
  }

  markUploaded(id: string) {
    return this.prisma.file.update({
      where: { id },
      data: { status: FileStatus.UPLOADED },
    });
  }

  markDeleted(id: string) {
    return this.prisma.file.update({
      where: { id },
      data: { status: FileStatus.DELETED },
    });
  }

  linkEntity(
    id: string,
    ownerId: string,
    entityType: string,
    entityId: string,
  ) {
    return this.prisma.file.updateMany({
      where: { id, ownerId },
      data: { entityType, entityId },
    });
  }
}
