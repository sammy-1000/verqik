"use client";

import { useEffect, useState } from "react";
import type { DeliveryStatusEventRecord } from "@/lib/ws/types";
import { REQUEST_STATUS_LABELS } from "@/lib/delivery/status-labels";
import { wsClient } from "@/lib/ws/client";
import { WsEvents } from "@/lib/ws/events";

export function DeliveryTimeline({
  events,
}: {
  events: DeliveryStatusEventRecord[];
}) {
  if (!events.length) {
    return (
      <p className="text-muted-foreground text-xs">No status history yet.</p>
    );
  }

  return (
    <ol className="space-y-2 border-l pl-4">
      {events.map((event) => (
        <li key={event.id} className="relative">
          <span className="bg-primary absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full" />
          <p className="text-sm font-medium">
            {REQUEST_STATUS_LABELS[event.status] ?? event.status}
          </p>
          <p className="text-muted-foreground text-xs">
            {new Date(event.createdAt).toLocaleString()}
            {event.note ? ` · ${event.note}` : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function EvidencePhoto({
  fileId,
  label,
}: {
  fileId?: string | null;
  label: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fileId) {
      setUrl(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    wsClient
      .rpc<{ url: string }>(WsEvents.FILES_DOWNLOAD_URL, { fileId })
      .then((result) => {
        if (!cancelled) setUrl(result.url);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fileId]);

  if (!fileId) return null;

  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      {loading ? (
        <p className="text-muted-foreground text-xs">Loading photo…</p>
      ) : url ? (
        <a href={url} target="_blank" rel="noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={label}
            className="max-h-40 rounded-md border object-cover"
          />
        </a>
      ) : (
        <p className="text-muted-foreground text-xs">Photo unavailable</p>
      )}
    </div>
  );
}
