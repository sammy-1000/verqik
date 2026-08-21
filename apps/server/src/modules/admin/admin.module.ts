import { Module } from '@nestjs/common';
import { FilesModule } from '../files/files.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ReferenceModule } from '../reference/reference.module';
import { AdminBootstrapService } from './admin-bootstrap.service';
import { CityImagesBootstrapService } from './city-images-bootstrap.service';
import { AdminCitiesController } from './admin-cities.controller';
import { AdminCitiesRepository } from './admin-cities.repository';
import { AdminCitiesService } from './admin-cities.service';
import { AdminVerificationsController } from './admin-verifications.controller';
import { AdminVerificationsRepository } from './admin-verifications.repository';
import { AdminVerificationsService } from './admin-verifications.service';

@Module({
  imports: [FilesModule, NotificationsModule, ReferenceModule],
  controllers: [AdminVerificationsController, AdminCitiesController],
  providers: [
    AdminVerificationsRepository,
    AdminVerificationsService,
    AdminCitiesRepository,
    AdminCitiesService,
    AdminBootstrapService,
    CityImagesBootstrapService,
  ],
  exports: [AdminVerificationsService, AdminCitiesService],
})
export class AdminModule {}
