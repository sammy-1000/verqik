import { Injectable } from '@nestjs/common';
import { JourneyStatus, PrismaService, TravelPhase } from '@verqik/database';

@Injectable()
export class JourneysRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    travelerId: string;
    originCountry: string;
    originCity: string;
    originCityId: string;
    destinationCountry: string;
    destinationCity: string;
    destinationCityId: string;
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
    return this.prisma.journey.findUnique({
      where: { id },
      include: {
        deliveryRequests: {
          select: {
            id: true,
            status: true,
            itemDescription: true,
            senderId: true,
          },
        },
      },
    });
  }

  listForTraveler(travelerId: string) {
    return this.prisma.journey.findMany({
      where: { travelerId },
      orderBy: { departureDate: 'desc' },
      include: {
        deliveryRequests: {
          select: { id: true, status: true, itemDescription: true },
        },
      },
    });
  }

  search(filters: {
    originCountry?: string;
    destinationCountry?: string;
    originCityId?: string;
    destinationCityId?: string;
    departureFrom?: Date;
    status?: JourneyStatus;
    limit?: number;
  }) {
    return this.prisma.journey.findMany({
      where: {
        originCountry: filters.originCountry,
        destinationCountry: filters.destinationCountry,
        originCityId: filters.originCityId,
        destinationCityId: filters.destinationCityId,
        departureDate: filters.departureFrom
          ? { gte: filters.departureFrom }
          : undefined,
        status: filters.status ?? JourneyStatus.UPCOMING,
      },
      orderBy: { departureDate: 'asc' },
      take: filters.limit,
    });
  }

  updateStatus(id: string, status: JourneyStatus) {
    return this.prisma.journey.update({
      where: { id },
      data: { status },
    });
  }

  updateTravel(
    id: string,
    data: {
      travelPhase?: TravelPhase;
      expectedLandingAt?: Date | null;
      actualLandingAt?: Date | null;
      rendezvousAddress?: string | null;
      rendezvousNotes?: string | null;
      travelUpdateNote?: string | null;
      status?: JourneyStatus;
      lastTravelUpdateAt?: Date;
    },
  ) {
    return this.prisma.journey.update({
      where: { id },
      data,
      include: {
        deliveryRequests: {
          select: { id: true, senderId: true, status: true },
        },
      },
    });
  }
}
