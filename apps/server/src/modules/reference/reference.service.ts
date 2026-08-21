import { Injectable } from '@nestjs/common';
import { PrismaService } from '@verqik/database';
import { CityImagesService } from './city-images.service';

@Injectable()
export class ReferenceRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cityImages: CityImagesService,
  ) {}

  listCountries() {
    return this.prisma.country.findMany({ orderBy: { name: 'asc' } });
  }

  listCities(filters: {
    countryCode?: string;
    q?: string;
    enabledOnly?: boolean;
  }) {
    return this.prisma.city.findMany({
      where: {
        enabled: filters.enabledOnly === false ? undefined : true,
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

  findEnabledCityById(id: string) {
    return this.prisma.city.findFirst({
      where: { id, enabled: true },
      include: {
        country: true,
        ...this.cityImages.cityImagesInclude(),
      },
    });
  }
}

@Injectable()
export class ReferenceService {
  constructor(
    private readonly repository: ReferenceRepository,
    private readonly cityImages: CityImagesService,
  ) {}

  listCountries() {
    return this.repository.listCountries();
  }

  async listCities(filters: {
    countryCode?: string;
    q?: string;
    enabledOnly?: boolean;
  }) {
    const cities = await this.repository.listCities(filters);
    return this.cityImages.attachImageUrls(cities);
  }

  async findEnabledCityById(id: string) {
    const city = await this.repository.findEnabledCityById(id);
    if (!city) return null;
    const [withUrls] = await this.cityImages.attachImageUrls([city]);
    return withUrls;
  }
}
