"use client";

import Link from "next/link";
import { Calendar, Package, Plane } from "lucide-react";
import { appBookPath } from "@/lib/app/routes";
import { useCities } from "@/lib/hooks/use-cities";
import {
  formatJourneyDate,
  formatPricePerKg,
  resolveAirportCode,
} from "@/lib/journeys/format";
import type { JourneyRecord } from "@/lib/ws/types";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";

export function JourneyBrowseCard({
  journey,
  onView,
}: {
  journey: JourneyRecord;
  onView: () => void;
}) {
  const { cities } = useCities();
  const originCode = resolveAirportCode(journey.originCity, cities);
  const destinationCode = resolveAirportCode(journey.destinationCity, cities);
  const kgLeft = Number(journey.availableWeightKg);

  return (
    <Card className="py-0 shadow-sm">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          {/* Route */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-0 shrink-0">
              <p className="text-lg font-bold tracking-wide">{originCode}</p>
              <p className="text-muted-foreground max-w-[6rem] truncate text-xs">
                {journey.originCity}
              </p>
            </div>
            <div className="flex min-w-[4rem] flex-1 items-center gap-1">
              <div className="border-border flex-1 border-t border-dashed" />
              <Plane className="text-muted-foreground size-4 shrink-0" />
              <div className="border-border flex-1 border-t border-dashed" />
            </div>
            <div className="min-w-0 shrink-0 text-right sm:text-left">
              <p className="text-lg font-bold tracking-wide">{destinationCode}</p>
              <p className="text-muted-foreground max-w-[6rem] truncate text-xs">
                {journey.destinationCity}
              </p>
            </div>
          </div>

          <Separator orientation="vertical" className="hidden h-12 sm:block" />

          {/* Meta */}
          <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4" />
              {formatJourneyDate(journey.departureDate)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Package className="size-4" />
              {kgLeft}kg left
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
          <Badge variant="outline" className="px-3 py-1 text-sm font-semibold">
            {formatPricePerKg(journey)}
          </Badge>
          <Button type="button" variant="outline" size="sm" onClick={onView}>
            View
          </Button>
          <Button nativeButton={false} render={<Link href={appBookPath(journey.id)} />} size="sm">
            Book
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
