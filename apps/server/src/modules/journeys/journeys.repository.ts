import { Injectable } from '@nestjs/common';
import { JourneyStatus, PrismaService } from '@verqik/database';

@Injectable()
export class JourneysRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    travelerId: string;
    originCountry: string;
    originCity: string;
    destinationCountry: string;
    destinationCity: string;
    departureDate: Date;
    arrivalDate: Date;
    availableWeightKg: number;
    pricePerKg?: number;
    currency?: string;
    flightNumber?: string;
    notes?: string;
  }) {
    return this.prisma.journey.create({ data });
  }

  findById(id: string) {
    return this.prisma.journey.findUnique({ where: { id } });
  }

  search(filters: {
    originCountry?: string;
    destinationCountry?: string;
    departureFrom?: Date;
    status?: JourneyStatus;
  }) {
    return this.prisma.journey.findMany({
      where: {
        originCountry: filters.originCountry,
        destinationCountry: filters.destinationCountry,
        departureDate: filters.departureFrom
          ? { gte: filters.departureFrom }
          : undefined,
        status: filters.status ?? JourneyStatus.UPCOMING,
      },
      orderBy: { departureDate: 'asc' },
    });
  }

  updateStatus(id: string, status: JourneyStatus) {
    return this.prisma.journey.update({
      where: { id },
      data: { status },
    });
  }
}
