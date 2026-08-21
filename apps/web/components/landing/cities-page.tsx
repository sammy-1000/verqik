"use client";

import { useMemo, useState } from "react";
import { CityCard } from "@/components/landing/city-card";
import { ContentWidth } from "@/components/shared/block-shell";
import { useCities } from "@/lib/hooks/use-cities";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function CitiesPageContent() {
  const { cities, loading } = useCities();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((city) => {
      const hay = [
        city.name,
        city.countryCode,
        city.country?.name,
        city.airportCode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [cities, query]);

  return (
    <ContentWidth size="auto" className="py-12 sm:py-16">
      <div className="mb-10 max-w-2xl space-y-3">
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
          Supported cities
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Where Verqik operates
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Browse enabled corridors. Travelers list journeys between these cities; senders
          search by route and date.
        </p>
      </div>

      <div className="mb-8 max-w-md">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by city, country, or airport code…"
        />
      </div>

      {loading ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <li key={i}>
              <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            </li>
          ))}
        </ul>
      ) : filtered.length ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((city) => (
            <li key={city.id}>
              <CityCard city={city} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">No cities match your search.</p>
      )}
    </ContentWidth>
  );
}
