import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JourneyStatus } from '@verqik/database';
import { JourneysRepository } from './journeys.repository';

@Injectable()
export class JourneysService {
  constructor(private readonly repository: JourneysRepository) {}

  create(
    travelerId: string,
    data: {
      originCountry: string;
      originCity: string;
      destinationCountry: string;
      destinationCity: string;
      departureDate: string;
      arrivalDate: string;
      availableWeightKg: number;
      pricePerKg?: number;
      currency?: string;
      flightNumber?: string;
      notes?: string;
    },
  ) {
    return this.repository.create({
      travelerId,
      ...data,
      departureDate: new Date(data.departureDate),
      arrivalDate: new Date(data.arrivalDate),
    });
  }

  search(filters: {
    originCountry?: string;
    destinationCountry?: string;
    departureFrom?: string;
  }) {
    return this.repository.search({
      ...filters,
      departureFrom: filters.departureFrom
        ? new Date(filters.departureFrom)
        : undefined,
    });
  }

  async cancel(journeyId: string, travelerId: string) {
    const journey = await this.repository.findById(journeyId);
    if (!journey) throw new NotFoundException('Journey not found');
    if (journey.travelerId !== travelerId) {
      throw new ForbiddenException('Not your journey');
    }

    return this.repository.updateStatus(journeyId, JourneyStatus.CANCELLED);
  }
}
