"use client";

import { useEffect, useState } from "react";
import type { CountryRecord } from "@/lib/ws/types";
import { wsClient } from "@/lib/ws/client";
import { WsEvents } from "@/lib/ws/events";
import { COUNTRIES } from "@/lib/reference/fallback-countries";

let cache: CountryRecord[] | null = null;

export function useCountries() {
  const [countries, setCountries] = useState<CountryRecord[]>(cache ?? COUNTRIES);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;

    wsClient
      .rpc<CountryRecord[]>(WsEvents.REFERENCE_COUNTRIES)
      .then((list) => {
        cache = list.length > 0 ? list : COUNTRIES;
        setCountries(cache);
      })
      .catch(() => {
        setCountries(COUNTRIES);
      })
      .finally(() => setLoading(false));
  }, []);

  return { countries, loading };
}

export function getCountryByCode(
  countries: CountryRecord[],
  code: string,
): CountryRecord | undefined {
  return countries.find((c) => c.code === code);
}
