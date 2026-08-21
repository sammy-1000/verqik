"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { JourneyTravelForm } from "@/components/journeys/journey-travel-form";
import type { AppBlock } from "@/lib/app/types";
import {
  JOURNEY_STATUS_LABELS,
  TRAVEL_PHASE_LABELS,
} from "@/lib/delivery/status-labels";
import type { JourneyRecord, UserProfile } from "@/lib/ws/types";
import { wsClient } from "@/lib/ws/client";
import { WsEvents, PushEvents } from "@/lib/ws/events";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export function MyJourneysBlock({
  user,
  block,
}: {
  user: UserProfile;
  block: AppBlock;
}) {
  const [journeys, setJourneys] = useState<JourneyRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const mine = await wsClient.rpc<JourneyRecord[]>(WsEvents.JOURNEYS_LIST_MINE);
    setJourneys(mine);
  }, []);

  useEffect(() => {
    void load();
    const unsubDelivery = wsClient.on(PushEvents.DELIVERY_REQUEST_CREATED, () => {
      void load();
    });
    const unsubJourney = wsClient.on(PushEvents.JOURNEY_UPDATED, () => {
      void load();
    });
    return () => {
      unsubDelivery();
      unsubJourney();
    };
  }, [load]);

  async function cancel(id: string) {
    try {
      await wsClient.rpc(WsEvents.JOURNEYS_CANCEL, { journeyId: id });
      toast.success("Journey cancelled");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancel failed");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{block.title}</CardTitle>
        <CardDescription>{block.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {journeys.length === 0 ? (
          <p className="text-muted-foreground text-sm">No journeys published yet.</p>
        ) : (
          journeys.map((j) => {
            const expanded = expandedId === j.id;
            const activePackages =
              j.deliveryRequests?.filter((r) =>
                ["ACCEPTED", "PICKED_UP", "IN_TRANSIT"].includes(r.status),
              ).length ?? 0;

            return (
              <div
                key={j.id}
                className="border-border space-y-3 rounded-lg border p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {j.originCity} → {j.destinationCity}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Departs {new Date(j.departureDate).toLocaleDateString()} ·{" "}
                      {Number(j.availableWeightKg)} kg capacity
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {JOURNEY_STATUS_LABELS[j.status] ?? j.status}
                      </Badge>
                      {j.travelPhase ? (
                        <Badge variant="secondary">
                          {TRAVEL_PHASE_LABELS[j.travelPhase] ?? j.travelPhase}
                        </Badge>
                      ) : null}
                      {activePackages > 0 ? (
                        <Badge>{activePackages} active package(s)</Badge>
                      ) : null}
                    </div>
                    {j.expectedLandingAt ? (
                      <p className="text-muted-foreground mt-1 text-sm">
                        ETA landing:{" "}
                        {new Date(j.expectedLandingAt).toLocaleString()}
                      </p>
                    ) : null}
                    {j.rendezvousAddress ? (
                      <p className="text-muted-foreground text-sm">
                        Rendezvous: {j.rendezvousAddress}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    {j.status === "UPCOMING" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void cancel(j.id)}
                      >
                        Cancel
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(expanded ? null : j.id)}
                    >
                      {expanded ? "Close" : "Manage travel"}
                    </Button>
                  </div>
                </div>

                {expanded ? (
                  <JourneyTravelForm journey={j} onUpdated={() => void load()} />
                ) : null}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
