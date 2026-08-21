"use client";

import { useMemo } from "react";
import { LabeledSearchCombobox } from "@/components/forms/labeled-search-combobox";
import { useCountries } from "@/lib/hooks/use-countries";
import { getCityById, useCities } from "@/lib/hooks/use-cities";

const ANY_COUNTRY = { value: "", label: "Any country" };
const ANY_CITY = { value: "", label: "Any city" };

export function RouteCountryCombobox({
  id,
  inlineLabel,
  value,
  onValueChange,
}: {
  id?: string;
  inlineLabel: "From" | "To";
  value: string;
  onValueChange: (code: string) => void;
}) {
  const { countries, loading } = useCountries();

  const options = useMemo(
    () =>
      countries.map((c) => ({
        value: c.code,
        label: `${c.name} (${c.code})`,
        keywords: c.name,
      })),
    [countries],
  );

  return (
    <LabeledSearchCombobox
      id={id}
      inlineLabel={inlineLabel}
      value={value}
      onValueChange={onValueChange}
      options={options}
      emptyOption={ANY_COUNTRY}
      searchPlaceholder="Search countries…"
      disabled={loading}
    />
  );
}

export function RouteCityCombobox({
  id,
  inlineLabel,
  value,
  onValueChange,
  countryCode,
}: {
  id?: string;
  inlineLabel: "From" | "To";
  value: string;
  onValueChange: (cityId: string) => void;
  countryCode?: string;
}) {
  const { cities, loading } = useCities(countryCode);

  const filtered = useMemo(
    () =>
      countryCode
        ? cities.filter((c) => c.countryCode === countryCode)
        : cities,
    [cities, countryCode],
  );

  const options = useMemo(
    () =>
      filtered.map((city) => ({
        value: city.id,
        label: `${city.name}${city.airportCode ? ` (${city.airportCode})` : ""}`,
        keywords: `${city.countryCode} ${city.airportCode ?? ""}`,
      })),
    [filtered],
  );

  const selected = value ? getCityById(filtered, value) : null;

  return (
    <LabeledSearchCombobox
      id={id}
      inlineLabel={inlineLabel}
      value={value}
      onValueChange={onValueChange}
      options={options}
      emptyOption={ANY_CITY}
      searchPlaceholder={
        selected
          ? selected.name
          : countryCode
            ? "Search cities in selected country…"
            : "Search all cities…"
      }
      disabled={loading}
    />
  );
}
