import { Module } from '@nestjs/common';
import { JourneysController } from './journeys.controller';
import { JourneysQueryService } from './journeys-query.service';
import { JourneysRepository } from './journeys.repository';
import { JourneysService } from './journeys.service';

@Module({
  controllers: [JourneysController],
  providers: [JourneysRepository, JourneysService, JourneysQueryService],
  exports: [JourneysQueryService],
})
export class JourneysModule {}
