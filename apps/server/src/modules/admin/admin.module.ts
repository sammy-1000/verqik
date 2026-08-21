import { Module } from '@nestjs/common';
import { FilesModule } from '../files/files.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ReferenceModule } from '../reference/reference.module';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersRepository } from './admin-users.repository';
import { AdminUsersService } from './admin-users.service';
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
  controllers: [AdminVerificationsController, AdminCitiesController, AdminUsersController],
  providers: [
    AdminVerificationsRepository,
    AdminVerificationsService,
    AdminCitiesRepository,
    AdminCitiesService,
    AdminUsersRepository,
    AdminUsersService,
    AdminBootstrapService,
    CityImagesBootstrapService,
  ],
  exports: [AdminVerificationsService, AdminCitiesService, AdminUsersService],
})
export class AdminModule {}
