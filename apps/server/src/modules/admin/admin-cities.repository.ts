import { Injectable } from '@nestjs/common';
import { CitySource, PrismaService } from '@verqik/database';
import { CityImagesService } from '../reference/city-images.service';

@Injectable()
export class AdminCitiesRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cityImages: CityImagesService,
  ) {}

  listAll(filters: { countryCode?: string; q?: string }) {
    return this.prisma.city.findMany({
      where: {
        countryCode: filters.countryCode,
        OR: filters.q
          ? [
              { name: { contains: filters.q, mode: 'insensitive' } },
              { airportCode: { contains: filters.q, mode: 'insensitive' } },
            ]
          : undefined,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        country: true,
        ...this.cityImages.cityImagesInclude(),
      },
    });
  }

  findById(id: string) {
    return this.prisma.city.findUnique({
      where: { id },
      include: {
        country: true,
        ...this.cityImages.cityImagesInclude(),
      },
    });
  }

  create(data: {
    name: string;
    countryCode: string;
    timezone: string;
    latitude: number;
    longitude: number;
    airportCode?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactAddress?: string;
    notes?: string;
    sortOrder?: number;
    enabled?: boolean;
  }) {
    return this.prisma.city.create({
      data: {
        ...data,
        source: CitySource.MANUAL,
        seedLocked: true,
      },
      include: {
        country: true,
        ...this.cityImages.cityImagesInclude(),
      },
    });
  }

  update(
    id: string,
    data: Partial<{
      name: string;
      countryCode: string;
      timezone: string;
      latitude: number;
      longitude: number;
      airportCode: string | null;
      contactEmail: string | null;
      contactPhone: string | null;
      contactAddress: string | null;
      notes: string | null;
      sortOrder: number;
      enabled: boolean;
    }>,
  ) {
    return this.prisma.city.update({
      where: { id },
      data: { ...data, seedLocked: true },
      include: {
        country: true,
        ...this.cityImages.cityImagesInclude(),
      },
    });
  }

  delete(id: string) {
    return this.prisma.city.delete({ where: { id } });
  }

  addSeedExclusion(seedKey: string, excludedById?: string) {
    return this.prisma.citySeedExclusion.upsert({
      where: { seedKey },
      update: { excludedById },
      create: { seedKey, excludedById },
    });
  }
}
