import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  FileStatus,
  PrismaService,
} from '@verqik/database';
import { StorageService } from '@verqik/storage';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function citySeedImageKey(seedKey: string) {
  return `cities/seed/${seedKey}.jpg`;
}

export type CityImageView = {
  id: string;
  fileId: string;
  sortOrder: number;
  caption?: string | null;
  /** Resolved at read time — not stored in DB */
  url?: string;
};

type CityWithImages = {
  id: string;
  images: Array<{
    id: string;
    fileId: string;
    sortOrder: number;
    caption: string | null;
    file: { id: string; key: string; mimeType: string; originalName: string };
  }>;
};

@Injectable()
export class CityImagesService {
  private readonly logger = new Logger(CityImagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  cityImagesInclude() {
    return {
      images: {
        orderBy: { sortOrder: 'asc' as const },
        include: {
          file: {
            select: {
              id: true,
              key: true,
              mimeType: true,
              originalName: true,
            },
          },
        },
      },
    };
  }

  async attachImageUrls<T extends CityWithImages>(
    cities: T[],
  ): Promise<Array<T & { images: CityImageView[] }>> {
    return Promise.all(
      cities.map(async (city) => ({
        ...city,
        images: await this.resolveImageViews(city.images),
      })),
    );
  }

  async resolveImageViews(
    images: CityWithImages['images'],
  ): Promise<CityImageView[]> {
    return Promise.all(
      images.map(async (image) => ({
        id: image.id,
        fileId: image.fileId,
        sortOrder: image.sortOrder,
        caption: image.caption,
        url: await this.resolveFileUrl(image.file.key),
      })),
    );
  }

  async resolveFileUrl(key: string) {
    return this.storage.getDownloadUrl(key, 60 * 60 * 24 * 7);
  }

  async syncCityImages(cityId: string, fileIds: string[], ownerId?: string) {
    const uniqueIds = [...new Set(fileIds)];
    if (uniqueIds.length !== fileIds.length) {
      throw new BadRequestException('Duplicate image file IDs');
    }

    for (const fileId of uniqueIds) {
      const file = await this.prisma.file.findUnique({ where: { id: fileId } });
      if (!file) throw new NotFoundException(`File not found: ${fileId}`);
      if (file.status !== FileStatus.UPLOADED) {
        throw new BadRequestException(`File not uploaded: ${fileId}`);
      }
      if (ownerId && file.ownerId && file.ownerId !== ownerId) {
        throw new BadRequestException('Cannot attach file you do not own');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.cityImage.deleteMany({ where: { cityId } });

      for (let i = 0; i < uniqueIds.length; i++) {
        const fileId = uniqueIds[i]!;
        await tx.cityImage.create({
          data: { cityId, fileId, sortOrder: i },
        });
        await tx.file.update({
          where: { id: fileId },
          data: {
            entityType: 'city',
            entityId: cityId,
            module: 'cities',
          },
        });
      }
    });
  }

  findSeedAssetsDir() {
    const candidates = [
      join(process.cwd(), '../../packages/database/seed-assets/cities'),
      join(process.cwd(), 'packages/database/seed-assets/cities'),
      join(__dirname, '../../../../../packages/database/seed-assets/cities'),
      join(__dirname, '../../../../packages/database/seed-assets/cities'),
    ];
    const dir = candidates.find((candidate) => existsSync(candidate));
    if (!dir) {
      this.logger.warn(
        `City seed assets directory not found (cwd=${process.cwd()}). ` +
          'Will try Wikipedia fallback for missing images.',
      );
    }
    return dir;
  }

  /** Idempotent — uploads bundled seed assets and links File records by storage key. */
  async ensureSeedImages() {
    const assetsDir = this.findSeedAssetsDir();

    const cities = await this.prisma.city.findMany({
      where: { seedKey: { not: null } },
      select: {
        id: true,
        seedKey: true,
        name: true,
        countryCode: true,
        images: { select: { id: true } },
      },
    });

    let seeded = 0;
    let skipped = 0;

    for (const city of cities) {
      if (!city.seedKey || city.images.length > 0) continue;

      let body: Buffer | null = null;
      const assetPath = assetsDir
        ? join(assetsDir, `${city.seedKey}.jpg`)
        : null;

      if (assetPath && existsSync(assetPath)) {
        body = readFileSync(assetPath);
      } else {
        body = await this.fetchWikipediaImage(city.name, city.countryCode);
      }

      if (!body) {
        skipped++;
        this.logger.warn(`No city image source for ${city.seedKey}`);
        continue;
      }

      const key = citySeedImageKey(city.seedKey);

      if (!(await this.storage.exists(key))) {
        await this.storage.upload({
          key,
          body,
          contentType: 'image/jpeg',
        });
      }

      let file = await this.prisma.file.findUnique({ where: { key } });
      if (!file) {
        file = await this.prisma.file.create({
          data: {
            key,
            bucket: this.storage.getBucket(),
            originalName: `${city.seedKey}.jpg`,
            mimeType: 'image/jpeg',
            sizeBytes: body.byteLength,
            status: FileStatus.UPLOADED,
            module: 'cities',
            entityType: 'city',
            entityId: city.id,
          },
        });
      } else if (file.status !== FileStatus.UPLOADED) {
        file = await this.prisma.file.update({
          where: { id: file.id },
          data: {
            status: FileStatus.UPLOADED,
            sizeBytes: body.byteLength,
            entityType: 'city',
            entityId: city.id,
          },
        });
      }

      await this.prisma.cityImage.upsert({
        where: { cityId_fileId: { cityId: city.id, fileId: file.id } },
        update: { sortOrder: 0 },
        create: { cityId: city.id, fileId: file.id, sortOrder: 0 },
      });

      seeded++;
      this.logger.log(`Seeded image for city ${city.seedKey}`);
    }

    this.logger.log(
      `City image seed complete: ${seeded} uploaded, ${skipped} missing sources`,
    );
  }

  private async fetchWikipediaImage(cityName: string, countryCode: string) {
    const titles = [cityName, `${cityName}, ${countryCode}`];
    for (const title of titles) {
      try {
        const response = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
          { headers: { 'User-Agent': 'VerqikCitySeed/1.0' } },
        );
        if (!response.ok) continue;
        const data = (await response.json()) as { thumbnail?: { source?: string } };
        const url = data.thumbnail?.source;
        if (!url) continue;
        const imageResponse = await fetch(url, {
          headers: { 'User-Agent': 'VerqikCitySeed/1.0' },
        });
        if (!imageResponse.ok) continue;
        return Buffer.from(await imageResponse.arrayBuffer());
      } catch {
        continue;
      }
    }
    return null;
  }
}
