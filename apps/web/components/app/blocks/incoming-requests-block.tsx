"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DeliveryActionDialog,
  TRAVELER_ACTION_CONFIG,
} from "@/components/delivery/delivery-action-dialog";
import {
  DeliveryTimeline,
  EvidencePhoto,
} from "@/components/delivery/delivery-detail";
import { JourneyTravelForm } from "@/components/journeys/journey-travel-form";
import type { AppBlock } from "@/lib/app/types";
import { REQUEST_STATUS_LABELS } from "@/lib/delivery/status-labels";
import type { DeliveryRequestRecord, JourneyRecord, UserProfile } from "@/lib/ws/types";
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

const TRAVELER_ACTIONS: Record<string, string[]> = {
  PENDING: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["PICKED_UP"],
  PICKED_UP: ["IN_TRANSIT"],
  IN_TRANSIT: ["DELIVERED"],
};

export function IncomingRequestsBlock({
  user,
  block,
}: {
  user: UserProfile;
  block: AppBlock;
}) {
  const [requests, setRequests] = useState<DeliveryRequestRecord[]>([]);
  const [journeys, setJourneys] = useState<JourneyRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionRequestId, setActionRequestId] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [all, mine] = await Promise.all([
      wsClient.rpc<DeliveryRequestRecord[]>(WsEvents.DELIVERY_REQUESTS_LIST),
      wsClient.rpc<JourneyRecord[]>(WsEvents.JOURNEYS_LIST_MINE),
    ]);
    setRequests(all.filter((r) => r.travelerId === user.id));
    setJourneys(mine);
  }, [user.id]);

  useEffect(() => {
    void load();
    const unsubCreated = wsClient.on(PushEvents.DELIVERY_REQUEST_CREATED, () => {
      void load();
    });
    const unsubStatus = wsClient.on(PushEvents.DELIVERY_STATUS_CHANGED, () => {
      void load();
    });
    const unsubJourney = wsClient.on(PushEvents.JOURNEY_UPDATED, () => {
      void load();
    });
    return () => {
      unsubCreated();
      unsubStatus();
      unsubJourney();
    };
  }, [load]);

  async function submitAction(payload: {
    requestId: string;
    status: string;
    note?: string;
    pickupPhotoFileId?: string;
    deliveryPhotoFileId?: string;
    rendezvousAddress?: string;
  }) {
    try {
      await wsClient.rpc(WsEvents.DELIVERY_REQUESTS_TRANSITION, payload);
      toast.success(`Request ${payload.status.toLowerCase().replace(/_/g, " ")}`);
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
      throw err;
    }
  }

  function openAction(requestId: string, status: string) {
    setActionRequestId(requestId);
    setActionStatus(status);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{block.title}</CardTitle>
          <CardDescription>{block.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {requests.length === 0 ? (
            <p className="text-muted-foreground text-sm">No incoming requests.</p>
          ) : (
            requests.map((r) => {
              const actions = TRAVELER_ACTIONS[r.status] ?? [];
              const expanded = expandedId === r.id;
              const journey =
                r.journey ?? journeys.find((j) => j.id === r.journeyId);

              return (
                <div
                  key={r.id}
                  className="border-border space-y-3 rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{r.itemDescription}</p>
                      <p className="text-muted-foreground text-sm">
                        ${Number(r.agreedPrice).toFixed(2)} · {Number(r.itemWeightKg)} kg
                      </p>
                      {journey ? (
                        <p className="text-muted-foreground text-sm">
                          {journey.originCity} → {journey.destinationCity}
                        </p>
                      ) : null}
                    </div>
                    <Badge variant="secondary">
                      {REQUEST_STATUS_LABELS[r.status] ?? r.status}
                    </Badge>
                  </div>

                  {r.pickupRendezvousAddress ? (
                    <p className="text-muted-foreground text-sm">
                      Pickup rendezvous: {r.pickupRendezvousAddress}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    {actions.map((status) => {
                      const config = TRAVELER_ACTION_CONFIG[status];
                      return (
                        <Button
                          key={status}
                          size="sm"
                          variant={status === "REJECTED" ? "outline" : "default"}
                          onClick={() => openAction(r.id, status)}
                        >
                          {config?.confirmLabel ?? status}
                        </Button>
                      );
                    })}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setExpandedId(expanded ? null : r.id)
                      }
                    >
                      {expanded ? "Hide details" : "Details"}
                    </Button>
                  </div>

                  {expanded ? (
                    <div className="space-y-4 border-t pt-4">
                      <DeliveryTimeline events={r.statusEvents ?? []} />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <EvidencePhoto
                          fileId={r.pickupPhotoFileId ?? r.pickupPhotoFile?.id}
                          label="Pickup evidence"
                        />
                        <EvidencePhoto
                          fileId={r.deliveryPhotoFileId ?? r.deliveryPhotoFile?.id}
                          label="Delivery evidence"
                        />
                      </div>
                      {journey &&
                      ["ACCEPTED", "PICKED_UP", "IN_TRANSIT"].includes(r.status) ? (
                        <JourneyTravelForm
                          journey={journey as JourneyRecord}
                          onUpdated={() => void load()}
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <DeliveryActionDialog
        open={Boolean(actionRequestId && actionStatus)}
        requestId={actionRequestId ?? ""}
        config={
          actionStatus ? TRAVELER_ACTION_CONFIG[actionStatus] ?? null : null
        }
        onClose={() => {
          setActionRequestId(null);
          setActionStatus(null);
        }}
        onSubmit={submitAction}
      />
    </>
  );
}
