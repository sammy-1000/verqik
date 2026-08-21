import type { PrismaClient } from '@prisma/client';
import { CitySource } from '@prisma/client';
import { SUPPORTED_CITIES } from './supported-cities';

function seedCityData(seed: (typeof SUPPORTED_CITIES)[number]) {
  return {
    seedKey: seed.seedKey,
    name: seed.name,
    countryCode: seed.countryCode,
    timezone: seed.timezone,
    latitude: seed.latitude,
    longitude: seed.longitude,
    airportCode: seed.airportCode ?? null,
    contactEmail: seed.contactEmail ?? null,
    contactPhone: seed.contactPhone ?? null,
    contactAddress: seed.contactAddress ?? null,
    notes: seed.notes ?? null,
    enabled: true,
    sortOrder: seed.sortOrder ?? 0,
    source: CitySource.SEED,
  };
}

/**
 * Idempotent city seed — safe on every boot/deploy.
 * Skips excluded seed keys (admin-deleted cities).
 * Does not overwrite cities marked seedLocked (admin-edited).
 */
export async function ensureSupportedCities(prisma: PrismaClient) {
  const exclusions = new Set(
    (await prisma.citySeedExclusion.findMany({ select: { seedKey: true } })).map(
      (row) => row.seedKey,
    ),
  );

  for (const seed of SUPPORTED_CITIES) {
    if (exclusions.has(seed.seedKey)) continue;

    const existing = await prisma.city.findUnique({
      where: { seedKey: seed.seedKey },
    });

    if (existing?.seedLocked) continue;

    const data = seedCityData(seed);

    if (existing) {
      await prisma.city.update({
        where: { seedKey: seed.seedKey },
        data,
      });
    } else {
      await prisma.city.create({ data });
    }
  }
}
