import { Injectable } from '@nestjs/common';
import { JourneysRepository } from './journeys.repository';

/** Read-only journey lookups for other modules (e.g. delivery). */
@Injectable()
export class JourneysQueryService {
  constructor(private readonly repository: JourneysRepository) {}

  findById(id: string) {
    return this.repository.findById(id);
  }
}
