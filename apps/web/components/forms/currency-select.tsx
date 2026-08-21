"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  CURRENCY_OPTIONS,
  CurrencyCode,
  isCurrencyCode,
} from "@/lib/enums";
import { FormField } from "./form-field";

interface CurrencySelectProps {
  value: CurrencyCode;
  onValueChange: (value: CurrencyCode) => void;
  label?: string;
}

export function CurrencySelect({
  value,
  onValueChange,
  label = "Currency",
}: CurrencySelectProps) {
  return (
    <FormField label={label} htmlFor="currency">
      <Select
        value={value}
        onValueChange={(v) => {
          if (v && isCurrencyCode(v)) onValueChange(v);
        }}
      >
        <SelectTrigger id="currency" className="w-full">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {CURRENCY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
