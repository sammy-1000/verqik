import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StorageService } from '@verqik/storage';
import { FilesRepository } from './files.repository';

@Injectable()
export class FilesService {
  constructor(
    private readonly repository: FilesRepository,
    private readonly storage: StorageService,
  ) {}

  async requestUpload(
    ownerId: string,
    data: {
      filename: string;
      mimeType: string;
      module: string;
      entityType?: string;
      entityId?: string;
    },
  ) {
    const key = this.storage.buildKey(data.module, data.filename);
    const presigned = await this.storage.getPresignedUploadUrl({
      key,
      contentType: data.mimeType,
    });

    const record = await this.repository.create({
      key,
      bucket: this.storage.getBucket(),
      originalName: data.filename,
      mimeType: data.mimeType,
      sizeBytes: 0,
      ownerId,
      module: data.module,
      entityType: data.entityType,
      entityId: data.entityId,
    });

    return {
      fileId: record.id,
      uploadUrl: presigned.uploadUrl,
      publicUrl: presigned.publicUrl,
      key: presigned.key,
    };
  }

  async confirmUpload(fileId: string, ownerId: string) {
    const file = await this.repository.findById(fileId);
    if (!file) throw new NotFoundException('File not found');
    if (file.ownerId && file.ownerId !== ownerId) {
      throw new ForbiddenException('Not your file');
    }

    const exists = await this.storage.exists(file.key);
    if (!exists) {
      throw new NotFoundException('Object not found in storage');
    }

    return this.repository.markUploaded(fileId);
  }

  async getDownloadUrl(fileId: string, ownerId: string) {
    const file = await this.repository.findById(fileId);
    if (!file) throw new NotFoundException('File not found');
    if (file.ownerId && file.ownerId !== ownerId) {
      throw new ForbiddenException('Not your file');
    }

    const url = await this.storage.getPresignedDownloadUrl(file.key);
    return { url, file };
  }

  async delete(fileId: string, ownerId: string) {
    const file = await this.repository.findById(fileId);
    if (!file) throw new NotFoundException('File not found');
    if (file.ownerId && file.ownerId !== ownerId) {
      throw new ForbiddenException('Not your file');
    }

    await this.storage.delete(file.key);
    return this.repository.markDeleted(fileId);
  }
}
