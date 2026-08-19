import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersQueryService } from './users-query.service';
import { UsersRatingService } from './users-rating.service';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersRepository,
    UsersService,
    UsersQueryService,
    UsersRatingService,
  ],
  exports: [UsersQueryService, UsersRepository, UsersRatingService],
})
export class UsersModule {}
