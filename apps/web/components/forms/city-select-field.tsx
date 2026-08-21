"use client";

import type { CityRecord } from "@/lib/ws/types";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import { Building2, Globe, MapPin, Plane } from "lucide-react";

export function formatCityLabel(city: CityRecord) {
  return `${city.name}${city.airportCode ? ` (${city.airportCode})` : ""}`;
}

export function SelectedCityCard({
  city,
  emptyLabel = "Choose a city",
  emptyHint,
  className,
}: {
  city?: CityRecord | null;
  emptyLabel?: string;
  emptyHint?: string;
  className?: string;
}) {
  if (!city) {
    return (
      <div
        className={cn(
          "border-border bg-muted/30 flex items-center gap-3 rounded-xl border border-dashed p-4",
          className,
        )}
      >
        <div className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-lg">
          <MapPin className="size-5" />
        </div>
        <div>
          <p className="text-muted-foreground text-sm font-medium">{emptyLabel}</p>
          {emptyHint ? (
            <p className="text-muted-foreground text-xs">{emptyHint}</p>
          ) : null}
        </div>
      </div>
    );
  }

  const imageUrl = city.images?.[0]?.url;

  return (
    <div
      className={cn(
        "border-border bg-card flex items-center gap-3 rounded-xl border p-3 shadow-sm",
        className,
      )}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={city.name}
          className="size-14 shrink-0 rounded-lg border object-cover"
        />
      ) : (
        <div className="bg-primary/10 text-primary flex size-14 shrink-0 items-center justify-center rounded-lg">
          <Building2 className="size-6" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium">{city.name}</p>
          {city.airportCode ? (
            <Badge variant="secondary" className="gap-1 font-normal">
              <Plane className="size-3" />
              {city.airportCode}
            </Badge>
          ) : null}
          <Badge variant="outline" className="gap-1 font-normal">
            <Globe className="size-3" />
            {city.countryCode}
          </Badge>
        </div>
        <p className="text-muted-foreground truncate text-xs">{city.timezone}</p>
      </div>
    </div>
  );
}

export function CityOptionRow({
  city,
  selected,
  onSelect,
}: {
  city: CityRecord;
  selected: boolean;
  onSelect: () => void;
}) {
  const imageUrl = city.images?.[0]?.url;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "hover:bg-muted flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
        selected && "bg-muted",
      )}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="size-10 shrink-0 rounded-md border object-cover"
        />
      ) : (
        <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-md">
          <MapPin className="text-muted-foreground size-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{city.name}</p>
        <p className="text-muted-foreground truncate text-xs">
          {city.countryCode}
          {city.airportCode ? ` · ${city.airportCode}` : ""}
        </p>
      </div>
      {selected ? (
        <span className="bg-primary size-2 shrink-0 rounded-full" />
      ) : null}
    </button>
  );
}
