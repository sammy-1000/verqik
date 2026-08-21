"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import type { ItemCategoryRecord } from "@/lib/ws/types";
import { wsClient } from "@/lib/ws/client";
import { WsEvents } from "@/lib/ws/events";
import { FormField } from "./form-field";

interface ItemCategorySelectProps {
  value: number | null;
  onValueChange: (id: number | null) => void;
}

export function ItemCategorySelect({
  value,
  onValueChange,
}: ItemCategorySelectProps) {
  const [categories, setCategories] = useState<ItemCategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wsClient
      .rpc<ItemCategoryRecord[]>(WsEvents.DELIVERY_CATEGORIES)
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <FormField
      label="Item category"
      htmlFor="itemCategory"
      hint="Restricted categories may require extra verification"
    >
      <Select
        value={value != null ? String(value) : undefined}
        onValueChange={(v) => onValueChange(v ? Number(v) : null)}
        disabled={loading}
      >
        <SelectTrigger id="itemCategory" className="w-full">
          <SelectValue placeholder={loading ? "Loading…" : "Select category"} />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={String(cat.id)}>
              {cat.name}
              {cat.isRestricted ? " (restricted)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
