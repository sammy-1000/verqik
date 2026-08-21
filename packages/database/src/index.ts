import { Global, Injectable, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ensureSeedData } from './seed-data';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    await ensureSeedData(this);
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

export { PrismaClient } from '@prisma/client';
export * from '@prisma/client';
export { deployMigrations } from './migrate';
export { ensureSeedData } from './seed-data';
export { ensureSupportedCities } from './seed-cities';
export { SUPPORTED_CITIES } from './supported-cities';
export {
  CITY_IMAGE_SEED_URLS,
  citySeedImageKey,
  citySeedImageFilename,
} from './city-image-seed-urls';
export { loadEnvFiles } from './env';
