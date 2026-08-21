import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JourneyStatus, TravelPhase } from '@verqik/database';
import { NotificationEvent } from '../notifications/notification.events';
import { NotificationsService } from '../notifications/notifications.service';
import { GatewayPushService } from '../realtime/gateway-push.service';
import { PushEvents } from '../gateway/gateway.events';
import { ReferenceService } from '../reference/reference.service';
import { UsersService } from '../users/users.service';
import type { UpdateJourneyTravelDto } from './dto/journey-travel.dto';
import { JourneysRepository } from './journeys.repository';

const ACTIVE_TRAVEL_PHASES: TravelPhase[] = [
  TravelPhase.DEPARTED,
  TravelPhase.EN_ROUTE,
  TravelPhase.LANDED,
  TravelPhase.AT_RENDEZVOUS,
];

@Injectable()
export class JourneysService {
  constructor(
    private readonly repository: JourneysRepository,
    private readonly notifications: NotificationsService,
    private readonly usersService: UsersService,
    private readonly referenceService: ReferenceService,
    private readonly push: GatewayPushService,
  ) {}

  async create(
    travelerId: string,
    data: {
      originCityId: string;
      destinationCityId: string;
      departureDate: string;
      arrivalDate: string;
      availableWeightKg: number;
      pricePerKg?: number;
      currency?: string;
      flightNumber?: string;
      notes?: string;
    },
  ) {
    await this.usersService.assertVerifiedForTravel(travelerId);

    if (data.originCityId === data.destinationCityId) {
      throw new BadRequestException('Origin and destination must differ');
    }

    const [origin, destination] = await Promise.all([
      this.referenceService.findEnabledCityById(data.originCityId),
      this.referenceService.findEnabledCityById(data.destinationCityId),
    ]);

    if (!origin) {
      throw new BadRequestException('Origin city is not supported or disabled');
    }
    if (!destination) {
      throw new BadRequestException(
        'Destination city is not supported or disabled',
      );
    }

    const journey = await this.repository.create({
      travelerId,
      originCountry: origin.countryCode,
      originCity: origin.name,
      originCityId: origin.id,
      destinationCountry: destination.countryCode,
      destinationCity: destination.name,
      destinationCityId: destination.id,
      departureDate: new Date(data.departureDate),
      arrivalDate: new Date(data.arrivalDate),
      availableWeightKg: data.availableWeightKg,
      pricePerKg: data.pricePerKg,
      currency: data.currency,
      flightNumber: data.flightNumber,
      notes: data.notes,
    });

    void this.notifications.process(NotificationEvent.JOURNEY_CREATED, {
      userId: travelerId,
      relatedId: journey.id,
      meta: {
        route: `${origin.name} → ${destination.name}`,
      },
    });

    return journey;
  }

  search(filters: {
    originCountry?: string;
    destinationCountry?: string;
    originCityId?: string;
    destinationCityId?: string;
    departureFrom?: string;
    limit?: number;
  }) {
    return this.repository.search({
      ...filters,
      departureFrom: filters.departureFrom
        ? new Date(filters.departureFrom)
        : undefined,
      limit: filters.limit,
    });
  }

  browse(filters: {
    originCountry?: string;
    destinationCountry?: string;
    originCityId?: string;
    destinationCityId?: string;
    limit?: number;
  } = {}) {
    const limit = Math.min(Math.max(filters.limit ?? 20, 1), 100);
    return this.repository.search({
      originCountry: filters.originCountry,
      destinationCountry: filters.destinationCountry,
      originCityId: filters.originCityId,
      destinationCityId: filters.destinationCityId,
      departureFrom: new Date(),
      status: JourneyStatus.UPCOMING,
      limit,
    });
  }

  listMine(travelerId: string) {
    return this.repository.listForTraveler(travelerId);
  }

  async getForBooking(journeyId: string, viewerId: string) {
    const journey = await this.repository.findById(journeyId);
    if (!journey) throw new NotFoundException('Journey not found');
    if (journey.status !== JourneyStatus.UPCOMING) {
      throw new BadRequestException('This journey is no longer available');
    }
    if (journey.travelerId === viewerId) {
      throw new BadRequestException('Cannot book your own journey');
    }
    const traveler = await this.usersService.getPublicProfile(journey.travelerId);
    return { ...journey, traveler };
  }

  async updateTravel(
    journeyId: string,
    travelerId: string,
    dto: UpdateJourneyTravelDto,
  ) {
    const journey = await this.repository.findById(journeyId);
    if (!journey) throw new NotFoundException('Journey not found');
    if (journey.travelerId !== travelerId) {
      throw new ForbiddenException('Not your journey');
    }
    if (journey.status === JourneyStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled journey');
    }

    const travelPhase = dto.travelPhase ?? journey.travelPhase;
    let status = journey.status;
    if (ACTIVE_TRAVEL_PHASES.includes(travelPhase)) {
      status = JourneyStatus.IN_TRANSIT;
    }
    if (travelPhase === TravelPhase.SCHEDULED && status === JourneyStatus.IN_TRANSIT) {
      status = JourneyStatus.UPCOMING;
    }

    const actualLandingAt =
      dto.actualLandingAt !== undefined
        ? dto.actualLandingAt
          ? new Date(dto.actualLandingAt)
          : null
        : travelPhase === TravelPhase.LANDED && !journey.actualLandingAt
          ? new Date()
          : journey.actualLandingAt;

    const updated = await this.repository.updateTravel(journeyId, {
      travelPhase,
      expectedLandingAt:
        dto.expectedLandingAt !== undefined
          ? dto.expectedLandingAt
            ? new Date(dto.expectedLandingAt)
            : null
          : undefined,
      actualLandingAt,
      rendezvousAddress:
        dto.rendezvousAddress !== undefined ? dto.rendezvousAddress : undefined,
      rendezvousNotes:
        dto.rendezvousNotes !== undefined ? dto.rendezvousNotes : undefined,
      travelUpdateNote:
        dto.travelUpdateNote !== undefined ? dto.travelUpdateNote : undefined,
      status,
      lastTravelUpdateAt: new Date(),
    });

    if (this.push.isReady()) {
      const payload = { journeyId, journey: updated };
      this.push.toJourney(journeyId, PushEvents.JOURNEY_UPDATED, payload);
      const senderIds = [
        ...new Set(
          updated.deliveryRequests
            .filter((r) => r.status !== 'REJECTED' && r.status !== 'CANCELLED')
            .map((r) => r.senderId),
        ),
      ];
      this.push.toUsers(senderIds, PushEvents.JOURNEY_UPDATED, payload);
    }

    for (const request of updated.deliveryRequests) {
      if (request.status === 'REJECTED' || request.status === 'CANCELLED') {
        continue;
      }
      void this.notifications.process(NotificationEvent.JOURNEY_TRAVEL_UPDATED, {
        userId: request.senderId,
        relatedId: journeyId,
        meta: {
          phase: travelPhase,
          route: `${journey.originCity} → ${journey.destinationCity}`,
        },
      });
    }

    return updated;
  }

  async cancel(journeyId: string, travelerId: string) {
    const journey = await this.repository.findById(journeyId);
    if (!journey) throw new NotFoundException('Journey not found');
    if (journey.travelerId !== travelerId) {
      throw new ForbiddenException('Not your journey');
    }

    const updated = await this.repository.updateStatus(
      journeyId,
      JourneyStatus.CANCELLED,
    );

    void this.notifications.process(NotificationEvent.JOURNEY_CANCELLED, {
      userId: travelerId,
      relatedId: journeyId,
    });

    return updated;
  }
}
