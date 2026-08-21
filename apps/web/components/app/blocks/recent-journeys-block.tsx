"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JourneyBrowseCard } from "@/components/journeys/journey-browse-card";
import { JourneyViewDialog } from "@/components/journeys/journey-view-dialog";
import { ListingSkeleton } from "@/components/app/listing-toolbar";
import { APP_BROWSE_PATH } from "@/lib/app/routes";
import { sortJourneysRecentFirst } from "@/lib/hooks/use-journey-search";
import type { JourneyRecord } from "@/lib/ws/types";
import { wsClient } from "@/lib/ws/client";
import { WsEvents } from "@/lib/ws/events";
import { Button } from "@workspace/ui/components/button";

const PREVIEW_LIMIT = 4;

export function RecentJourneysBlock() {
  const [journeys, setJourneys] = useState<JourneyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewJourney, setViewJourney] = useState<JourneyRecord | null>(null);

  useEffect(() => {
    let cancelled = false;
    void wsClient
      .rpc<JourneyRecord[]>(WsEvents.JOURNEYS_SEARCH, {})
      .then((results) => {
        if (!cancelled) {
          setJourneys(
            sortJourneysRecentFirst(results).slice(0, PREVIEW_LIMIT),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && journeys.length === 0) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Recently added journeys
          </h2>
          <Button nativeButton={false} render={<Link href={APP_BROWSE_PATH} />} variant="ghost" size="sm" className="gap-1">
            Browse more
            <ArrowRight className="size-4" />
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          No journeys available yet. Check back soon.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Recently added journeys
        </h2>
        <Button nativeButton={false} render={<Link href={APP_BROWSE_PATH} />} variant="ghost" size="sm" className="gap-1">
          Browse more
          <ArrowRight className="size-4" />
        </Button>
      </div>

      {loading ? (
        <ListingSkeleton count={3} viewMode="list" />
      ) : (
        <div className="space-y-3">
          {journeys.map((journey) => (
            <JourneyBrowseCard
              key={journey.id}
              journey={journey}
              onView={() => setViewJourney(journey)}
            />
          ))}
        </div>
      )}

      <JourneyViewDialog
        journey={viewJourney}
        open={viewJourney !== null}
        onOpenChange={(open) => !open && setViewJourney(null)}
      />
    </section>
  );
}
