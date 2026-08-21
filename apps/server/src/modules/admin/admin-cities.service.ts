import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@verqik/database';
import { CityImagesService } from '../reference/city-images.service';
import type { CreateCityDto, UpdateCityDto } from './dto/admin-cities.dto';
import { AdminCitiesRepository } from './admin-cities.repository';

@Injectable()
export class AdminCitiesService {
  constructor(
    private readonly repository: AdminCitiesRepository,
    private readonly prisma: PrismaService,
    private readonly cityImages: CityImagesService,
  ) {}

  async list(filters: { countryCode?: string; q?: string }) {
    const cities = await this.repository.listAll(filters);
    return this.cityImages.attachImageUrls(cities);
  }

  async getById(id: string) {
    const city = await this.repository.findById(id);
    if (!city) return null;
    const [withUrls] = await this.cityImages.attachImageUrls([city]);
    return withUrls;
  }

  async create(dto: CreateCityDto, adminUserId: string) {
    await this.assertCountryExists(dto.countryCode);
    const { imageFileIds, ...data } = dto;
    const city = await this.repository.create(data);
    if (imageFileIds?.length) {
      await this.cityImages.syncCityImages(city.id, imageFileIds, adminUserId);
    }
    return this.getById(city.id);
  }

  async update(id: string, dto: UpdateCityDto, adminUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('City not found');

    if (dto.countryCode && dto.countryCode !== existing.countryCode) {
      await this.assertCountryExists(dto.countryCode);
    }

    const { imageFileIds, ...data } = dto;
    await this.repository.update(id, data);
    if (imageFileIds !== undefined) {
      await this.cityImages.syncCityImages(id, imageFileIds, adminUserId);
    }
    return this.getById(id);
  }

  async remove(id: string, adminUserId: string) {
    const city = await this.repository.findById(id);
    if (!city) throw new NotFoundException('City not found');

    const journeyCount = await this.prisma.journey.count({
      where: {
        OR: [{ originCityId: id }, { destinationCityId: id }],
      },
    });

    if (journeyCount > 0) {
      throw new BadRequestException(
        'Cannot delete a city linked to existing journeys. Disable it instead.',
      );
    }

    if (city.seedKey) {
      await this.repository.addSeedExclusion(city.seedKey, adminUserId);
    }

    await this.repository.delete(id);
    return { deleted: true, seedKey: city.seedKey };
  }

  private async assertCountryExists(code: string) {
    const country = await this.prisma.country.findUnique({ where: { code } });
    if (!country) {
      throw new BadRequestException(`Unknown country code: ${code}`);
    }
  }
}
