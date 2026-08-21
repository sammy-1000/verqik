"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { getCityById, useCities } from "@/lib/hooks/use-cities";
import { FormField } from "./form-field";
import {
  CityOptionRow,
  SelectedCityCard,
} from "./city-select-field";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";

/** Internal sentinel — never shown in UI. */
const ANY_CITY = "__any__";

export type CitySelectAppearance = "filter" | "field";

interface CitySelectFieldProps {
  id?: string;
  label?: string;
  value: string;
  onValueChange: (cityId: string) => void;
  countryCode?: string;
  placeholder?: string;
  emptyLabel?: string;
  emptyHint?: string;
  allowEmpty?: boolean;
  emptyOptionLabel?: string;
  required?: boolean;
  hint?: string;
  /** filter = compact select for search bars; field = rich card + searchable list */
  appearance?: CitySelectAppearance;
  className?: string;
}

export function CitySelectField({
  id = "city",
  label = "City",
  value,
  onValueChange,
  countryCode,
  placeholder = "Select city",
  emptyLabel = "Choose a city",
  emptyHint,
  allowEmpty = false,
  emptyOptionLabel = "Any city",
  required,
  hint,
  appearance = "filter",
  className,
}: CitySelectFieldProps) {
  const { cities, loading } = useCities(countryCode);
  const filtered = useMemo(
    () =>
      countryCode
        ? cities.filter((city) => city.countryCode === countryCode)
        : cities,
    [cities, countryCode],
  );

  if (appearance === "filter") {
    const selectValue = value || (allowEmpty ? ANY_CITY : undefined);
    const selectedCity = value ? filtered.find((c) => c.id === value) : null;
    const triggerLabel = loading
      ? "Loading…"
      : selectedCity
        ? `${selectedCity.name}${selectedCity.airportCode ? ` (${selectedCity.airportCode})` : ""}`
        : allowEmpty
          ? emptyOptionLabel
          : placeholder;

    return (
      <FormField
        label={label}
        htmlFor={id}
        required={required}
        hint={hint}
        className={className}
      >
        <Select
          value={selectValue}
          onValueChange={(v) => {
            if (!v) return;
            onValueChange(v === ANY_CITY ? "" : v);
          }}
          disabled={loading}
        >
          <SelectTrigger id={id} className="w-full">
            <span className="truncate">{triggerLabel}</span>
          </SelectTrigger>
          <SelectContent>
            {allowEmpty ? (
              <SelectItem value={ANY_CITY}>{emptyOptionLabel}</SelectItem>
            ) : null}
            {filtered.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
                {city.airportCode ? ` (${city.airportCode})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    );
  }

  return (
    <RichCitySelectField
      id={id}
      label={label}
      value={value}
      onValueChange={onValueChange}
      cities={filtered}
      loading={loading}
      placeholder={placeholder}
      emptyLabel={emptyLabel}
      emptyHint={emptyHint}
      allowEmpty={allowEmpty}
      emptyOptionLabel={emptyOptionLabel}
      required={required}
      hint={hint}
      className={className}
    />
  );
}

function RichCitySelectField({
  id,
  label,
  value,
  onValueChange,
  cities,
  loading,
  placeholder,
  emptyLabel,
  emptyHint,
  allowEmpty,
  emptyOptionLabel,
  required,
  hint,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onValueChange: (cityId: string) => void;
  cities: ReturnType<typeof useCities>["cities"];
  loading: boolean;
  placeholder: string;
  emptyLabel: string;
  emptyHint?: string;
  allowEmpty: boolean;
  emptyOptionLabel: string;
  required?: boolean;
  hint?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedCity = value ? getCityById(cities, value) : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((city) => {
      const hay = `${city.name} ${city.countryCode} ${city.airportCode ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [cities, query]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function pick(cityId: string) {
    onValueChange(cityId);
    setOpen(false);
    setQuery("");
  }

  function clear() {
    onValueChange("");
  }

  return (
    <FormField
      label={label}
      htmlFor={id}
      required={required}
      hint={hint}
      className={className}
    >
      <div ref={rootRef} className="space-y-2">
        <SelectedCityCard
          city={selectedCity}
          emptyLabel={loading ? "Loading cities…" : emptyLabel}
          emptyHint={emptyHint ?? placeholder}
        />
        <div className="flex gap-2">
          <Button
            id={id}
            type="button"
            variant="outline"
            className="flex-1 justify-between"
            disabled={loading}
            onClick={() => setOpen((v) => !v)}
          >
            <span>{selectedCity ? "Change city" : "Browse cities"}</span>
            <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
          </Button>
          {selectedCity && allowEmpty ? (
            <Button type="button" variant="ghost" size="icon" onClick={clear}>
              <X className="size-4" />
              <span className="sr-only">Clear</span>
            </Button>
          ) : null}
        </div>
        {open ? (
          <div className="border-border bg-popover rounded-xl border p-2 shadow-md">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by city, country, or airport code"
                className="pl-8"
                autoFocus
              />
            </div>
            <ul className="mt-2 max-h-56 space-y-0.5 overflow-y-auto">
              {allowEmpty && !query ? (
                <li>
                  <button
                    type="button"
                    onClick={() => pick("")}
                    className={cn(
                      "hover:bg-muted flex w-full rounded-lg px-3 py-2 text-left text-sm",
                      !value && "bg-muted font-medium",
                    )}
                  >
                    {emptyOptionLabel}
                  </button>
                </li>
              ) : null}
              {filtered.length === 0 ? (
                <li className="text-muted-foreground py-6 text-center text-sm">
                  No cities match your search
                </li>
              ) : (
                filtered.map((city) => (
                  <li key={city.id}>
                    <CityOptionRow
                      city={city}
                      selected={city.id === value}
                      onSelect={() => pick(city.id)}
                    />
                  </li>
                ))
              )}
            </ul>
          </div>
        ) : null}
      </div>
    </FormField>
  );
}

/** @deprecated Use CitySelectField */
export function CityPicker(props: Omit<CitySelectFieldProps, "appearance"> & {
  searchable?: boolean;
}) {
  const { searchable, ...rest } = props;
  return (
    <CitySelectField
      {...rest}
      appearance={searchable ? "field" : "filter"}
    />
  );
}
