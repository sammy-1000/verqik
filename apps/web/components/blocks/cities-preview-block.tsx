"use client";

import Link from "next/link";
import type { CitiesPreviewBlock } from "@/lib/blocks/types";
import { BlockShell, SectionHeading } from "@/components/shared/block-shell";
import { CityCard } from "@/components/landing/city-card";
import { useCities } from "@/lib/hooks/use-cities";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function CitiesPreviewBlockView({
  id,
  tone,
  width,
  size,
  data,
}: CitiesPreviewBlock) {
  const limit = data.limit ?? 10;
  const { cities, loading } = useCities();
  const preview = cities.slice(0, limit);

  return (
    <BlockShell id={id} tone={tone} width={width} size={size ?? "auto"}>
      <SectionHeading
        eyebrow={data.eyebrow}
        title={data.title}
        description={data.description}
      />

      {loading ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: limit }).map((_, i) => (
            <li key={i}>
              <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            </li>
          ))}
        </ul>
      ) : preview.length ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {preview.map((city) => (
            <li key={city.id}>
              <CityCard city={city} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">
          Supported cities will appear here once the server is connected.
        </p>
      )}

      <div className="mt-10 flex justify-center">
        <Button nativeButton={false} render={<Link href={data.browseMore.href} />} size="lg">
          {data.browseMore.label}
        </Button>
      </div>
    </BlockShell>
  );
}
