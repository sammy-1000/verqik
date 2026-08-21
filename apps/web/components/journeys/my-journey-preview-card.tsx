"use client";

import { Calendar, Package, Plane } from "lucide-react";
import { useCities } from "@/lib/hooks/use-cities";
import {
  formatJourneyDate,
  formatPricePerKg,
  resolveAirportCode,
} from "@/lib/journeys/format";
import { JOURNEY_STATUS_LABELS } from "@/lib/delivery/status-labels";
import type { JourneyRecord } from "@/lib/ws/types";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";

export function MyJourneyPreviewCard({ journey }: { journey: JourneyRecord }) {
  const { cities } = useCities();
  const originCode = resolveAirportCode(journey.originCity, cities);
  const destinationCode = resolveAirportCode(journey.destinationCity, cities);
  const activePackages =
    journey.deliveryRequests?.filter((request) =>
      ["ACCEPTED", "PICKED_UP", "IN_TRANSIT"].includes(request.status),
    ).length ?? 0;

  return (
    <Card className="py-0 shadow-sm">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
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

          <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4" />
              {formatJourneyDate(journey.departureDate)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Package className="size-4" />
              {Number(journey.availableWeightKg)}kg
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Badge variant="outline">
            {JOURNEY_STATUS_LABELS[journey.status] ?? journey.status}
          </Badge>
          {activePackages > 0 ? (
            <Badge variant="secondary">{activePackages} package(s)</Badge>
          ) : null}
          <Badge variant="outline" className="px-3 py-1 text-sm font-semibold">
            {formatPricePerKg(journey)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
