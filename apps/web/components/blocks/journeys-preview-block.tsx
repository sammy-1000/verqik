"use client";

import Link from "next/link";
import type { JourneysPreviewBlock } from "@/lib/blocks/types";
import { BlockShell, SectionHeading } from "@/components/shared/block-shell";
import { PublicJourneyCard } from "@/components/landing/public-journey-card";
import { usePublicJourneys } from "@/lib/hooks/use-public-journeys";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function JourneysPreviewBlockView({
  id,
  tone,
  width,
  size,
  data,
}: JourneysPreviewBlock) {
  const limit = data.limit ?? 6;
  const { journeys, loading } = usePublicJourneys(limit);

  return (
    <BlockShell id={id} tone={tone} width={width} size={size ?? "auto"}>
      <SectionHeading
        eyebrow={data.eyebrow}
        title={data.title}
        description={data.description}
      />

      {loading ? (
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: Math.min(limit, 3) }).map((_, i) => (
            <li key={i}>
              <Skeleton className="h-48 w-full rounded-2xl" />
            </li>
          ))}
        </ul>
      ) : journeys.length ? (
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {journeys.map((journey) => (
            <li key={journey.id}>
              <PublicJourneyCard journey={journey} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">
          No upcoming journeys yet. List your trip after signing up.
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
