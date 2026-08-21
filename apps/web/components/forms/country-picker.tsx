"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@workspace/ui/components/select";
import { useCountries } from "@/lib/hooks/use-countries";
import { FormField } from "./form-field";

const ANY_COUNTRY = "__any__";

interface CountryPickerProps {
  id?: string;
  label?: string;
  value: string;
  onValueChange: (code: string) => void;
  placeholder?: string;
  allowEmpty?: boolean;
  required?: boolean;
  hint?: string;
}

export function CountryPicker({
  id = "country",
  label = "Country",
  value,
  onValueChange,
  placeholder = "Select country",
  allowEmpty = false,
  required,
  hint,
}: CountryPickerProps) {
  const { countries, loading } = useCountries();
  const selectValue = value || (allowEmpty ? ANY_COUNTRY : undefined);
  const selectedCountry = value
    ? countries.find((c) => c.code === value)
    : null;
  const triggerLabel = loading
    ? "Loading…"
    : selectedCountry
      ? `${selectedCountry.name} (${selectedCountry.code})`
      : allowEmpty
        ? "Any country"
        : placeholder;

  return (
    <FormField label={label} htmlFor={id} required={required} hint={hint}>
      <Select
        value={selectValue}
        onValueChange={(v) => {
          if (!v) return;
          onValueChange(v === ANY_COUNTRY ? "" : v);
        }}
        disabled={loading}
      >
        <SelectTrigger id={id} className="w-full">
          <span className="truncate">{triggerLabel}</span>
        </SelectTrigger>
        <SelectContent>
          {allowEmpty ? (
            <SelectItem value={ANY_COUNTRY}>Any country</SelectItem>
          ) : null}
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.name} ({country.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
