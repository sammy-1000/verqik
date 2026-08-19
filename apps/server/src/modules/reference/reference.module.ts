import { Module } from '@nestjs/common';
import { ReferenceController } from './reference.controller';
import {
  ReferenceRepository,
  ReferenceService,
} from './reference.service';

@Module({
  controllers: [ReferenceController],
  providers: [ReferenceRepository, ReferenceService],
  exports: [ReferenceService],
})
export class ReferenceModule {}
