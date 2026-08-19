export interface StorageModuleOptions {
  endpoint?: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  forcePathStyle?: boolean;
  cdnUrl?: string;
}

export interface UploadOptions {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType: string;
  metadata?: Record<string, string>;
}

export interface PresignedUploadOptions {
  key: string;
  contentType: string;
  expiresIn?: number;
}

export interface StorageObjectInfo {
  key: string;
  url: string;
  bucket: string;
}

export const STORAGE_OPTIONS = Symbol('STORAGE_OPTIONS');
