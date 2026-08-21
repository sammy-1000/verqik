"use client";

import Link from "next/link";
import { Calendar, Package, Plane } from "lucide-react";
import {
  formatJourneyDate,
  formatPricePerKg,
  resolveAirportCode,
} from "@/lib/journeys/format";
import { useCities } from "@/lib/hooks/use-cities";
import { LOGIN_PATH, SIGNUP_PATH } from "@/lib/landing/routes";
import type { JourneyRecord } from "@/lib/ws/types";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

export function PublicJourneyCard({ journey }: { journey: JourneyRecord }) {
  const { cities } = useCities();
  const originCode = resolveAirportCode(journey.originCity, cities);
  const destinationCode = resolveAirportCode(journey.destinationCity, cities);
  const kgLeft = Number(journey.availableWeightKg);

  return (
    <article className="bg-card flex flex-col gap-4 rounded-2xl border border-border p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="min-w-0 shrink-0">
          <p className="text-lg font-bold tracking-wide">{originCode}</p>
          <p className="text-muted-foreground max-w-[6rem] truncate text-xs">
            {journey.originCity}
          </p>
        </div>
        <div className="flex min-w-[3rem] flex-1 items-center gap-1">
          <div className="border-border flex-1 border-t border-dashed" />
          <Plane className="text-muted-foreground size-4 shrink-0" />
          <div className="border-border flex-1 border-t border-dashed" />
        </div>
        <div className="min-w-0 shrink-0 text-right">
          <p className="text-lg font-bold tracking-wide">{destinationCode}</p>
          <p className="text-muted-foreground max-w-[6rem] truncate text-xs">
            {journey.destinationCity}
          </p>
        </div>
      </div>

      <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="size-4" />
          {formatJourneyDate(journey.departureDate)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Package className="size-4" />
          {kgLeft}kg left
        </span>
        <Badge variant="outline" className="ml-auto font-semibold">
          {formatPricePerKg(journey)}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          nativeButton={false}
          render={<Link href={LOGIN_PATH} />}
          variant="outline"
          className="flex-1 sm:flex-none"
        >
          Sign in to book
        </Button>
        <Button
          nativeButton={false}
          render={<Link href={SIGNUP_PATH} />}
          className="flex-1 sm:flex-none"
        >
          Get started
        </Button>
      </div>
    </article>
  );
}
