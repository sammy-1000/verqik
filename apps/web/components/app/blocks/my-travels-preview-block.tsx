"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MyJourneyPreviewCard } from "@/components/journeys/my-journey-preview-card";
import { ListingSkeleton } from "@/components/app/listing-toolbar";
import { APP_TRAVELS_PATH } from "@/lib/app/routes";
import type { JourneyRecord } from "@/lib/ws/types";
import { wsClient } from "@/lib/ws/client";
import { WsEvents, PushEvents } from "@/lib/ws/events";
import { Button } from "@workspace/ui/components/button";

const PREVIEW_LIMIT = 3;

function sortUpcomingFirst(journeys: JourneyRecord[]) {
  return [...journeys]
    .filter((journey) => journey.status !== "CANCELLED")
    .sort(
      (a, b) =>
        new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime(),
    );
}

export function MyTravelsPreviewBlock() {
  const [journeys, setJourneys] = useState<JourneyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const mine = await wsClient.rpc<JourneyRecord[]>(WsEvents.JOURNEYS_LIST_MINE);
      setJourneys(sortUpcomingFirst(mine).slice(0, PREVIEW_LIMIT));
    } catch {
      setJourneys([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const unsub = wsClient.on(PushEvents.JOURNEY_UPDATED, () => {
      void load();
    });
    return () => {
      unsub();
    };
  }, [load]);

  if (!loading && journeys.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Your travels</h2>
        <Button
          nativeButton={false}
          render={<Link href={APP_TRAVELS_PATH} />}
          variant="ghost"
          size="sm"
          className="gap-1"
        >
          View all
          <ArrowRight className="size-4" />
        </Button>
      </div>

      {loading ? (
        <ListingSkeleton count={PREVIEW_LIMIT} viewMode="list" />
      ) : (
        <div className="space-y-3">
          {journeys.map((journey) => (
            <MyJourneyPreviewCard key={journey.id} journey={journey} />
          ))}
        </div>
      )}
    </section>
  );
}
