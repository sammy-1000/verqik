"use client";

import Link from "next/link";
import { Calendar, MapPin, Package, Plane } from "lucide-react";
import { appBookPath } from "@/lib/app/routes";
import {
  formatJourneyDate,
  formatPricePerKg,
  journeyRouteLabel,
} from "@/lib/journeys/format";
import type { JourneyRecord } from "@/lib/ws/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";

export function JourneyViewDialog({
  journey,
  open,
  onOpenChange,
}: {
  journey: JourneyRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!journey) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="text-primary size-5" />
            Journey details
          </DialogTitle>
          <DialogDescription>{journeyRouteLabel(journey)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">Route</p>
              <p className="text-muted-foreground">
                {journey.originCity}, {journey.originCountry} →{" "}
                {journey.destinationCity}, {journey.destinationCountry}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">Schedule</p>
              <p className="text-muted-foreground">
                Departs {formatJourneyDate(journey.departureDate)} · Arrives{" "}
                {formatJourneyDate(journey.arrivalDate)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Package className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">Capacity & rate</p>
              <p className="text-muted-foreground">
                {Number(journey.availableWeightKg)} kg available ·{" "}
                {formatPricePerKg(journey)}
              </p>
            </div>
          </div>
          {journey.notes ? (
            <p className="text-muted-foreground border-t pt-3">{journey.notes}</p>
          ) : null}
        </div>
        <DialogFooter>
          <Button nativeButton={false} render={<Link href={appBookPath(journey.id)} />}>Book this journey</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
