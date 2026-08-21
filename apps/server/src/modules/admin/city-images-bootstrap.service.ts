import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CityImagesService } from '../reference/city-images.service';

@Injectable()
export class CityImagesBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(CityImagesBootstrapService.name);

  constructor(private readonly cityImages: CityImagesService) {}

  async onModuleInit() {
    try {
      await this.cityImages.ensureSeedImages();
    } catch (err) {
      this.logger.warn(
        `City image seed skipped: ${err instanceof Error ? err.message : err}`,
      );
    }
  }
}
