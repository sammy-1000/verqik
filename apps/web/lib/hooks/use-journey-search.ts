"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { JourneyRecord } from "@/lib/ws/types";
import { wsClient } from "@/lib/ws/client";
import { WsEvents } from "@/lib/ws/events";

export type JourneySearchFilters = {
  originCountry?: string;
  destinationCountry?: string;
  originCityId?: string;
  destinationCityId?: string;
};

export function useJourneySearch(initialFilters: JourneySearchFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);
  const [journeys, setJourneys] = useState<JourneyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const search = useCallback(async (next?: JourneySearchFilters) => {
    const active = next ?? filters;
    setLoading(true);
    try {
      const results = await wsClient.rpc<JourneyRecord[]>(
        WsEvents.JOURNEYS_SEARCH,
        {
          originCountry: active.originCountry || undefined,
          destinationCountry: active.destinationCountry || undefined,
          originCityId: active.originCityId || undefined,
          destinationCityId: active.destinationCityId || undefined,
        },
      );
      setJourneys(results);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load journeys");
      setJourneys([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void search(initialFilters);
    // Mount-only initial fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyFilters(next: JourneySearchFilters) {
    setFilters(next);
    void search(next);
  }

  return { journeys, loading, filters, applyFilters, reload: () => void search(filters) };
}

export function sortJourneysRecentFirst(journeys: JourneyRecord[]) {
  return [...journeys].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (aTime !== bTime) return bTime - aTime;
    return new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime();
  });
}
