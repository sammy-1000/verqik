import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService, VerificationStatus } from '@verqik/database';
import { StorageService } from '@verqik/storage';
import { AdminVerificationsService } from '../modules/admin/admin-verifications.service';
import { ensureAdminUser } from '../modules/admin/ensure-admin-user';
import { AuthService } from '../modules/auth/auth.service';
import { DeliveryService } from '../modules/delivery/delivery.service';
import { JourneysService } from '../modules/journeys/journeys.service';
import { UsersService } from '../modules/users/users.service';
import {
  DEMO_ADMIN,
  DEMO_DEFAULT_PASSWORD,
  DEMO_DELIVERIES,
  DEMO_EMAIL_DOMAIN,
  DEMO_USERS,
  type DemoUserSeed,
} from './demo-seed.data';
import {
  seedUploadFile,
  seedVerificationDocuments,
} from './seed-file.helper';

export interface DemoSeedOptions {
  password?: string;
  reset?: boolean;
  dryRun?: boolean;
}

export interface DemoSeedResult {
  adminUserId: string;
  users: Record<string, string>;
  journeys: number;
  deliveries: number;
}

@Injectable()
export class DemoSeedService {
  private readonly logger = new Logger(DemoSeedService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(StorageService) private readonly storage: StorageService,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(AdminVerificationsService)
    private readonly adminVerifications: AdminVerificationsService,
    @Inject(JourneysService) private readonly journeysService: JourneysService,
    @Inject(DeliveryService) private readonly deliveryService: DeliveryService,
  ) {}

  async run(options: DemoSeedOptions = {}): Promise<DemoSeedResult> {
    const password = options.password ?? DEMO_DEFAULT_PASSWORD;

    if (options.reset) {
      await this.resetDemoData(options.dryRun);
    }

    if (options.dryRun) {
      this.logger.log('Dry run — no writes performed');
      return { adminUserId: '', users: {}, journeys: 0, deliveries: 0 };
    }

    const cityBySeedKey = await this.loadCityMap();
    const admin = await this.ensureDemoAdmin(password);
    const userIds: Record<string, string> = {};
    const journeyIndex = new Map<string, string>();
    let journeyCount = 0;

    for (const seed of DEMO_USERS) {
      const userId = await this.ensureDemoUser(seed, password);
      userIds[seed.key] = userId;

      if (seed.verify) {
        await this.verifyDemoUser(userId, seed, admin.userId);
      }

      if (seed.journeys?.length) {
        for (const journeySeed of seed.journeys) {
          const origin = cityBySeedKey.get(journeySeed.originSeedKey);
          const destination = cityBySeedKey.get(journeySeed.destinationSeedKey);
          if (!origin || !destination) {
            this.logger.warn(
              `Skipping journey — city missing: ${journeySeed.originSeedKey} → ${journeySeed.destinationSeedKey}`,
            );
            continue;
          }

          const departure = addDays(new Date(), journeySeed.departInDays);
          const arrival = addDays(departure, journeySeed.tripDays);
          const routeKey = `${journeySeed.originSeedKey}→${journeySeed.destinationSeedKey}`;

          const existing = await this.prisma.journey.findFirst({
            where: {
              travelerId: userId,
              originCityId: origin.id,
              destinationCityId: destination.id,
              departureDate: departure,
            },
          });

          if (existing) {
            journeyIndex.set(`${seed.key}:${routeKey}`, existing.id);
            continue;
          }

          const journey = await this.journeysService.create(userId, {
            originCityId: origin.id,
            destinationCityId: destination.id,
            departureDate: formatDate(departure),
            arrivalDate: formatDate(arrival),
            availableWeightKg: journeySeed.availableWeightKg,
            pricePerKg: journeySeed.pricePerKg,
            currency: journeySeed.currency,
            flightNumber: journeySeed.flightNumber,
            notes: journeySeed.notes,
          });

          journeyIndex.set(`${seed.key}:${routeKey}`, journey.id);
          journeyCount++;
          this.logger.log(
            `Journey: ${seed.firstName} ${origin.name} → ${destination.name} (${journey.id})`,
          );
        }
      }
    }

    let deliveryCount = 0;
    for (const deliverySeed of DEMO_DELIVERIES) {
      const senderId = userIds[deliverySeed.senderKey];
      const routeKey = `${deliverySeed.travelerJourney.userKey}:${deliverySeed.travelerJourney.route}`;
      const journeyId = journeyIndex.get(routeKey);
      if (!senderId || !journeyId) {
        this.logger.warn(`Skipping delivery — missing sender or journey for ${routeKey}`);
        continue;
      }

      const exists = await this.prisma.deliveryRequest.findFirst({
        where: { senderId, journeyId, itemDescription: deliverySeed.itemDescription },
      });
      if (exists) continue;

      await this.deliveryService.createRequest(senderId, {
        journeyId,
        itemDescription: deliverySeed.itemDescription,
        itemWeightKg: deliverySeed.itemWeightKg,
        agreedPrice: deliverySeed.agreedPrice,
        currency: deliverySeed.currency,
      });
      deliveryCount++;
    }

    this.logger.log(
      `Demo seed complete — ${Object.keys(userIds).length} users, ${journeyCount} new journeys, ${deliveryCount} new delivery requests`,
    );

    return {
      adminUserId: admin.userId,
      users: userIds,
      journeys: journeyCount,
      deliveries: deliveryCount,
    };
  }

  private async loadCityMap() {
    const cities = await this.prisma.city.findMany({
      where: { enabled: true, seedKey: { not: null } },
      select: { id: true, seedKey: true, name: true },
    });
    return new Map(cities.map((c) => [c.seedKey!, c]));
  }

  private async ensureDemoAdmin(password: string) {
    const result = await ensureAdminUser(this.prisma, {
      email: DEMO_ADMIN.email,
      password,
      firstName: DEMO_ADMIN.firstName,
      lastName: DEMO_ADMIN.lastName,
      resetPassword: true,
    });

    await this.prisma.user.update({
      where: { id: result.userId },
      data: {
        countryCode: DEMO_ADMIN.countryCode,
        phoneNumber: DEMO_ADMIN.phoneNumber,
      },
    });

    this.logger.log(`Demo admin ready: ${DEMO_ADMIN.email}`);
    return result;
  }

  private async ensureDemoUser(seed: DemoUserSeed, password: string) {
    const email = `${seed.emailLocal}${DEMO_EMAIL_DOMAIN}`;
    const existing = await this.prisma.user.findUnique({ where: { email } });

    if (!existing) {
      await this.authService.register({
        email,
        password,
        firstName: seed.firstName,
        lastName: seed.lastName,
        profileType: seed.profileType,
      });
    }

    const user = await this.prisma.user.findUniqueOrThrow({ where: { email } });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        countryCode: seed.countryCode,
        phoneNumber: seed.phoneNumber,
        ratingAvg: seed.ratingAvg ?? user.ratingAvg,
        ratingCount: seed.ratingCount ?? user.ratingCount,
      },
    });

    const profileFile = await seedUploadFile(this.prisma, this.storage, {
      ownerId: user.id,
      module: 'users',
      relativePath: `profiles/${seed.profilePhotoFile}`,
    });

    await this.usersService.updateProfile(user.id, {
      profilePhotoFileId: profileFile.id,
      countryCode: seed.countryCode,
    });

    if (seed.address) {
      const hasAddress = await this.prisma.address.findFirst({
        where: { userId: user.id, label: seed.address.label },
      });
      if (!hasAddress) {
        await this.usersService.createAddress(user.id, seed.address);
      }
    }

    this.logger.log(`User ready: ${email} (${seed.profileType})`);
    return user.id;
  }

  private async verifyDemoUser(
    userId: string,
    seed: DemoUserSeed,
    adminUserId: string,
  ) {
    const verification = await this.usersService.getVerification(userId);
    if (verification?.status === VerificationStatus.VERIFIED) {
      return;
    }

    const docs = await seedVerificationDocuments(
      this.prisma,
      this.storage,
      userId,
      seed.profilePhotoFile,
    );

    if (verification?.status !== VerificationStatus.PENDING) {
      await this.usersService.submitVerification(userId, {
        idDocumentType: 'NATIONAL_ID',
        idDocumentFileId: docs.idDocumentFileId,
        selfieFileId: docs.selfieFileId,
      });
    }

    const pending = await this.usersService.getVerification(userId);
    if (pending?.status === VerificationStatus.PENDING) {
      await this.adminVerifications.approve(pending.id, adminUserId);
      this.logger.log(`Verified traveler: ${seed.firstName} ${seed.lastName}`);
    }
  }

  private async resetDemoData(dryRun?: boolean) {
    const demoUsers = await this.prisma.user.findMany({
      where: { email: { endsWith: DEMO_EMAIL_DOMAIN } },
      select: { id: true, email: true },
    });

    if (!demoUsers.length) return;

    this.logger.warn(`Resetting ${demoUsers.length} demo users…`);
    if (dryRun) return;

    const ids = demoUsers.map((u) => u.id);
    await this.prisma.deliveryRequest.deleteMany({
      where: {
        OR: [{ senderId: { in: ids } }, { travelerId: { in: ids } }],
      },
    });
    await this.prisma.journey.deleteMany({ where: { travelerId: { in: ids } } });
    await this.prisma.userVerification.deleteMany({ where: { userId: { in: ids } } });
    await this.prisma.address.deleteMany({ where: { userId: { in: ids } } });
    await this.prisma.userRole.deleteMany({ where: { userId: { in: ids } } });
    await this.prisma.wallet.deleteMany({ where: { userId: { in: ids } } });
    await this.prisma.user.deleteMany({ where: { id: { in: ids } } });
  }
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  next.setHours(0, 0, 0, 0);
  return next;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
