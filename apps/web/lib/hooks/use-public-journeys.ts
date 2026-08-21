"use client";

import { useCallback, useEffect, useState } from "react";
import type { JourneyRecord } from "@/lib/ws/types";
import { wsClient } from "@/lib/ws/client";
import { WsEvents } from "@/lib/ws/events";

const cache = new Map<string, JourneyRecord[]>();

function cacheKey(limit: number, filters: Record<string, string | undefined>) {
  return JSON.stringify({ limit, ...filters });
}

export function usePublicJourneys(
  limit = 10,
  filters: {
    originCountry?: string;
    destinationCountry?: string;
    originCityId?: string;
    destinationCityId?: string;
  } = {},
) {
  const key = cacheKey(limit, filters);
  const [journeys, setJourneys] = useState<JourneyRecord[]>(cache.get(key) ?? []);
  const [loading, setLoading] = useState(!cache.has(key));

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const list = await wsClient.rpc<JourneyRecord[]>(WsEvents.JOURNEYS_BROWSE, {
        limit,
        originCountry: filters.originCountry || undefined,
        destinationCountry: filters.destinationCountry || undefined,
        originCityId: filters.originCityId || undefined,
        destinationCityId: filters.destinationCityId || undefined,
      });
      cache.set(key, list);
      setJourneys(list);
    } catch {
      setJourneys([]);
    } finally {
      setLoading(false);
    }
  }, [filters.destinationCityId, filters.destinationCountry, filters.originCityId, filters.originCountry, key, limit]);

  useEffect(() => {
    if (cache.has(key)) {
      setJourneys(cache.get(key)!);
      setLoading(false);
      return;
    }
    void reload();
  }, [key, reload]);

  return { journeys, loading, reload };
}
