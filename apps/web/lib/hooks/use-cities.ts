"use client";

import { useCallback, useEffect, useState } from "react";
import type { CityRecord } from "@/lib/ws/types";
import { wsClient } from "@/lib/ws/client";
import { WsEvents } from "@/lib/ws/events";

const cache = new Map<string, CityRecord[]>();

function cacheKey(countryCode?: string) {
  return countryCode ?? "__all__";
}

export function useCities(countryCode?: string) {
  const key = cacheKey(countryCode);
  const [cities, setCities] = useState<CityRecord[]>(cache.get(key) ?? []);
  const [loading, setLoading] = useState(!cache.has(key));

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const list = await wsClient.rpc<CityRecord[]>(WsEvents.REFERENCE_CITIES, {
        countryCode: countryCode || undefined,
      });
      cache.set(key, list);
      setCities(list);
    } catch {
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, [countryCode, key]);

  useEffect(() => {
    if (cache.has(key)) {
      setCities(cache.get(key)!);
      setLoading(false);
      return;
    }
    void reload();
  }, [key, reload]);

  return { cities, loading, reload };
}

export function getCityById(cities: CityRecord[], id: string) {
  return cities.find((city) => city.id === id);
}

export function invalidateCitiesCache() {
  cache.clear();
}
