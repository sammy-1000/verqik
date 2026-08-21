import type { CityRecord } from "@/lib/ws/types";
import type { JourneyRecord } from "@/lib/ws/types";

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  KES: "KSh",
  NGN: "₦",
  ZAR: "R",
  AED: "AED ",
  CAD: "CA$",
  RWF: "FRw",
};

export function formatPricePerKg(journey: JourneyRecord) {
  const symbol = CURRENCY_SYMBOL[journey.currency] ?? `${journey.currency} `;
  const price = Number(journey.pricePerKg ?? 0);
  return `${symbol}${price}/kg`;
}

export function formatJourneyDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function resolveAirportCode(
  cityName: string,
  cities: CityRecord[],
): string {
  const normalized = cityName.trim().toLowerCase();
  const city = cities.find(
    (c) =>
      c.name.toLowerCase() === normalized ||
      normalized.startsWith(c.name.toLowerCase()),
  );
  if (city?.airportCode) return city.airportCode;
  return cityName.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "—";
}

export function journeyRouteLabel(journey: JourneyRecord) {
  return `${journey.originCity} → ${journey.destinationCity}`;
}

export function matchesRouteFilter(journey: JourneyRecord, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    journey.originCity,
    journey.destinationCity,
    journey.originCountry,
    journey.destinationCountry,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}
