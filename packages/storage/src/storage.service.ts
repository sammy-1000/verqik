import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable } from '@nestjs/common';
import {
  PresignedUploadOptions,
  STORAGE_OPTIONS,
  type StorageModuleOptions,
  StorageObjectInfo,
  UploadOptions,
} from './storage.interface';

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly cdnUrl?: string;

  constructor(
    @Inject(STORAGE_OPTIONS) private readonly options: StorageModuleOptions,
  ) {
    this.bucket = options.bucket;
    this.cdnUrl = options.cdnUrl;

    this.client = new S3Client({
      region: options.region,
      endpoint: options.endpoint,
      forcePathStyle: options.forcePathStyle ?? false,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
    });
  }

  resolveUrl(key: string): string {
    if (this.cdnUrl) {
      const base = this.cdnUrl.replace(/\/$/, '');
      // CDN base may already include the bucket path (e.g. https://cdn.example.com/verqik-dev)
      if (this.cdnBaseIncludesBucket()) {
        return `${base}/${key}`;
      }
      return `${base}/${this.bucket}/${key}`;
    }
    if (this.options.endpoint) {
      const base = this.options.endpoint.replace(/\/$/, '');
      return `${base}/${this.bucket}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.options.region}.amazonaws.com/${key}`;
  }

  /** Public read URL — CDN when configured, otherwise presigned S3 URL */
  async getDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    if (this.cdnUrl) {
      return this.resolveUrl(key);
    }
    return this.getPresignedDownloadUrl(key, expiresIn);
  }

  hasCdn(): boolean {
    return Boolean(this.cdnUrl);
  }

  private cdnBaseIncludesBucket(): boolean {
    if (!this.cdnUrl) return false;
    const base = this.cdnUrl.replace(/\/$/, '');
    return base.endsWith(`/${this.bucket}`) || base.endsWith(this.bucket);
  }

  buildKey(module: string, filename: string): string {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const date = new Date().toISOString().slice(0, 10);
    return `${module}/${date}/${crypto.randomUUID()}-${safeName}`;
  }

  getBucket(): string {
    return this.bucket;
  }

  async upload(options: UploadOptions): Promise<StorageObjectInfo> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: options.key,
        Body: options.body,
        ContentType: options.contentType,
        Metadata: options.metadata,
      }),
    );

    return {
      key: options.key,
      url: this.resolveUrl(options.key),
      bucket: this.bucket,
    };
  }

  async getPresignedUploadUrl(
    options: PresignedUploadOptions,
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: options.key,
      ContentType: options.contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: options.expiresIn ?? 3600,
    });

    return {
      uploadUrl,
      key: options.key,
      publicUrl: this.resolveUrl(options.key),
    };
  }

  async getPresignedDownloadUrl(
    key: string,
    expiresIn = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
