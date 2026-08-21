"use client";

import { useMemo, useState } from "react";
import { PublicJourneyCard } from "@/components/landing/public-journey-card";
import { ContentWidth } from "@/components/shared/block-shell";
import { matchesRouteFilter } from "@/lib/journeys/format";
import { usePublicJourneys } from "@/lib/hooks/use-public-journeys";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function JourneysPageContent() {
  const { journeys, loading } = usePublicJourneys(50);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => journeys.filter((j) => matchesRouteFilter(j, query)),
    [journeys, query],
  );

  return (
    <ContentWidth size="auto" className="py-12 sm:py-16">
      <div className="mb-10 max-w-2xl space-y-3">
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
          Open journeys
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Upcoming trips with spare weight
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Real listings from verified travelers. Sign in or create an account to book a
          delivery on a journey.
        </p>
      </div>

      <div className="mb-8 max-w-md">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by city or country…"
        />
      </div>

      {loading ? (
        <ul className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i}>
              <Skeleton className="h-48 w-full rounded-2xl" />
            </li>
          ))}
        </ul>
      ) : filtered.length ? (
        <ul className="grid gap-5 md:grid-cols-2">
          {filtered.map((journey) => (
            <li key={journey.id}>
              <PublicJourneyCard journey={journey} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">
          {journeys.length
            ? "No journeys match your filter."
            : "No upcoming journeys yet. Check back soon or list your own trip."}
        </p>
      )}
    </ContentWidth>
  );
}
