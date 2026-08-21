import { FileStatus, PrismaService } from '@verqik/database';
import { StorageService } from '@verqik/storage';
import { existsSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

function mimeForFilename(filename: string) {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

export function findDemoAssetsDir() {
  const candidates = [
    join(process.cwd(), 'packages/database/seed-assets/demo'),
    join(process.cwd(), '../../packages/database/seed-assets/demo'),
    join(__dirname, '../../../../packages/database/seed-assets/demo'),
    join(__dirname, '../../../../../packages/database/seed-assets/demo'),
  ];
  return candidates.find((dir) => existsSync(dir));
}

export function findDemoAssetPath(relativePath: string) {
  const base = findDemoAssetsDir();
  if (!base) return null;
  const full = join(base, relativePath);
  return existsSync(full) ? full : null;
}

export async function seedUploadFile(
  prisma: PrismaService,
  storage: StorageService,
  options: {
    ownerId: string;
    module: string;
    relativePath: string;
    entityType?: string;
    entityId?: string;
  },
) {
  const assetPath = findDemoAssetPath(options.relativePath);
  if (!assetPath) {
    throw new Error(`Demo asset not found: ${options.relativePath}`);
  }

  const filename = basename(assetPath);
  const key = storage.buildKey(options.module, `${options.ownerId}/${filename}`);
  const mimeType = mimeForFilename(filename);
  const body = readFileSync(assetPath);

  if (!(await storage.exists(key))) {
    await storage.upload({ key, body, contentType: mimeType });
  }

  let file = await prisma.file.findUnique({ where: { key } });
  if (!file) {
    file = await prisma.file.create({
      data: {
        key,
        bucket: storage.getBucket(),
        originalName: filename,
        mimeType,
        sizeBytes: body.byteLength,
        status: FileStatus.UPLOADED,
        ownerId: options.ownerId,
        module: options.module,
        entityType: options.entityType,
        entityId: options.entityId,
      },
    });
  } else if (file.status !== FileStatus.UPLOADED || file.ownerId !== options.ownerId) {
    file = await prisma.file.update({
      where: { id: file.id },
      data: {
        status: FileStatus.UPLOADED,
        sizeBytes: body.byteLength,
        ownerId: options.ownerId,
        entityType: options.entityType,
        entityId: options.entityId,
        module: options.module,
      },
    });
  }

  return file;
}

/** Placeholder ID scan — reuses profile image under verification module */
export async function seedVerificationDocuments(
  prisma: PrismaService,
  storage: StorageService,
  ownerId: string,
  profileRelativePath: string,
) {
  const idDoc = await seedUploadFile(prisma, storage, {
    ownerId,
    module: 'verification',
    relativePath: `profiles/${profileRelativePath}`,
  });
  const selfie = await seedUploadFile(prisma, storage, {
    ownerId,
    module: 'verification-selfie',
    relativePath: `profiles/${profileRelativePath}`,
  });
  return { idDocumentFileId: idDoc.id, selfieFileId: selfie.id };
}
