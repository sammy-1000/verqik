import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { CityImagesService } from '../reference/city-images.service';

@Injectable()
export class CityImagesBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CityImagesBootstrapService.name);

  constructor(private readonly cityImages: CityImagesService) {}

  async onApplicationBootstrap() {
    try {
      await this.cityImages.ensureSeedImages();
    } catch (err) {
      this.logger.warn(
        `City image seed skipped: ${err instanceof Error ? err.message : err}`,
      );
    }
  }
}
