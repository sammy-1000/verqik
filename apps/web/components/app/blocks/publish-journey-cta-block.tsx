"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plane } from "lucide-react";
import { canSeeTravelsTab } from "@/lib/app/navigation";
import { isVerifiedForTravel } from "@/lib/app/get-app-blocks";
import { APP_TRAVELS_PATH } from "@/lib/app/routes";
import type { UserProfile, JourneyRecord } from "@/lib/ws/types";
import { wsClient } from "@/lib/ws/client";
import { WsEvents, PushEvents } from "@/lib/ws/events";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

const ACTIVE_JOURNEY_STATUSES = new Set(["UPCOMING", "IN_TRANSIT"]);

function hasActiveJourney(journeys: JourneyRecord[]) {
  return journeys.some((journey) => ACTIVE_JOURNEY_STATUSES.has(journey.status));
}

export function PublishJourneyCtaBlock({ user }: { user: UserProfile }) {
  const [hasActiveRoute, setHasActiveRoute] = useState(false);

  const load = useCallback(async () => {
    try {
      const mine = await wsClient.rpc<JourneyRecord[]>(WsEvents.JOURNEYS_LIST_MINE);
      setHasActiveRoute(hasActiveJourney(mine));
    } catch {
      setHasActiveRoute(false);
    }
  }, []);

  useEffect(() => {
    if (!canSeeTravelsTab(user) || !isVerifiedForTravel(user)) return;
    void load();
    const unsub = wsClient.on(PushEvents.JOURNEY_UPDATED, () => {
      void load();
    });
    return () => {
      unsub();
    };
  }, [user, load]);

  if (!canSeeTravelsTab(user) || !isVerifiedForTravel(user)) {
    return null;
  }

  const copy = hasActiveRoute
    ? {
        title: "Another trip on the horizon?",
        description: "Publish your next route and keep earning from spare luggage space.",
        label: "Add another journey",
      }
    : {
        title: "Flying soon? Get paid for extra space.",
        description:
          "List your route in minutes and earn from luggage room you're not using.",
        label: "Add your journey",
      };

  return (
    <section
      className={cn(
        "bg-primary text-primary-foreground mx-auto w-full max-w-6xl rounded-2xl px-6 py-8 sm:px-10 sm:py-10",
      )}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
        <div className="bg-primary-foreground/15 flex size-12 items-center justify-center rounded-full">
          <Plane className="size-6" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {copy.title}
        </h2>
        <p className="text-primary-foreground/85 text-sm leading-relaxed text-pretty sm:text-base">
          {copy.description}
        </p>
        <Button
          size="lg"
          variant="secondary"
          className="gap-2"
          nativeButton={false}
          render={<Link href={APP_TRAVELS_PATH} />}
        >
          {copy.label}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </section>
  );
}
