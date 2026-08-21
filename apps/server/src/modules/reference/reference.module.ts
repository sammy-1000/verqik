import { Module } from '@nestjs/common';
import { StorageModule } from '@verqik/storage';
import { ReferenceController } from './reference.controller';
import { CityImagesService } from './city-images.service';
import {
  ReferenceRepository,
  ReferenceService,
} from './reference.service';

@Module({
  imports: [StorageModule],
  controllers: [ReferenceController],
  providers: [ReferenceRepository, ReferenceService, CityImagesService],
  exports: [ReferenceService, CityImagesService],
})
export class ReferenceModule {}
