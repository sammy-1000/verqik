import { Module } from '@nestjs/common';
import { FilesModule } from '../files/files.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RbacModule } from '../rbac/rbac.module';
import { UsersController } from './users.controller';
import { UsersQueryService } from './users-query.service';
import { UsersRatingService } from './users-rating.service';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [NotificationsModule, FilesModule, RbacModule],
  controllers: [UsersController],
  providers: [
    UsersRepository,
    UsersService,
    UsersQueryService,
    UsersRatingService,
  ],
  exports: [
    UsersService,
    UsersQueryService,
    UsersRepository,
    UsersRatingService,
  ],
})
export class UsersModule {}
