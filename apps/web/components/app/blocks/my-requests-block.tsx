"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar, ChevronDown, ChevronUp, MapPin, Package } from "lucide-react";
import {
  DeliveryTimeline,
  EvidencePhoto,
} from "@/components/delivery/delivery-detail";
import { JourneyTravelSummary } from "@/components/journeys/journey-travel-form";
import { REQUEST_STATUS_LABELS } from "@/lib/delivery/status-labels";
import { formatJourneyDate } from "@/lib/journeys/format";
import type { DeliveryRequestRecord, UserProfile } from "@/lib/ws/types";
import { wsClient } from "@/lib/ws/client";
import { WsEvents, PushEvents } from "@/lib/ws/events";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { ListingSkeleton } from "@/components/app/listing-toolbar";

export function MyRequestsBlock({ user }: { user: UserProfile }) {
  const [requests, setRequests] = useState<DeliveryRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await wsClient.rpc<DeliveryRequestRecord[]>(
        WsEvents.DELIVERY_REQUESTS_LIST,
      );
      setRequests(all.filter((r) => r.senderId === user.id));
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    void load();
    const unsubStatus = wsClient.on(PushEvents.DELIVERY_STATUS_CHANGED, () => {
      void load();
    });
    const unsubJourney = wsClient.on(PushEvents.JOURNEY_UPDATED, () => {
      void load();
    });
    return () => {
      unsubStatus();
      unsubJourney();
    };
  }, [load]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">My delivery requests</h2>

      {loading ? (
        <ListingSkeleton count={3} viewMode="list" />
      ) : requests.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          No shipments yet. Browse journeys to send your first package.
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const expanded = expandedId === r.id;
            return (
              <Card key={r.id} className="py-0">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium">{r.itemDescription}</p>
                      {r.journey ? (
                        <p className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
                          <MapPin className="size-3.5 shrink-0" />
                          {r.journey.originCity} → {r.journey.destinationCity}
                        </p>
                      ) : null}
                      <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <Package className="size-3.5" />
                          {Number(r.itemWeightKg)} kg
                        </span>
                        {r.journey ? (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="size-3.5" />
                            {formatJourneyDate(r.journey.departureDate)}
                          </span>
                        ) : null}
                        <span>
                          {r.currency} {Number(r.agreedPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {REQUEST_STATUS_LABELS[r.status] ?? r.status}
                    </Badge>
                  </div>

                  {r.journey ? <JourneyTravelSummary journey={r.journey} /> : null}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1 px-2"
                    onClick={() => setExpandedId(expanded ? null : r.id)}
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="size-4" />
                        Hide tracking
                      </>
                    ) : (
                      <>
                        <ChevronDown className="size-4" />
                        Track package
                      </>
                    )}
                  </Button>

                  {expanded ? (
                    <div className="space-y-4 border-t pt-4">
                      {r.pickupRendezvousAddress ? (
                        <p className="text-muted-foreground text-sm">
                          Pickup: {r.pickupRendezvousAddress}
                        </p>
                      ) : null}
                      {r.deliveryRendezvousAddress ? (
                        <p className="text-muted-foreground text-sm">
                          Delivery: {r.deliveryRendezvousAddress}
                        </p>
                      ) : null}
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
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
