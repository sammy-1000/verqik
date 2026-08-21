"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";

export type SearchComboboxOption = {
  value: string;
  label: string;
  keywords?: string;
};

export function LabeledSearchCombobox({
  id,
  inlineLabel,
  value,
  onValueChange,
  options,
  emptyOption,
  searchPlaceholder = "Search…",
  disabled,
  className,
}: {
  id?: string;
  inlineLabel: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SearchComboboxOption[];
  emptyOption?: SearchComboboxOption;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected =
    options.find((o) => o.value === value) ??
    (emptyOption && value === "" ? emptyOption : undefined);

  const displayLabel = selected?.label ?? emptyOption?.label ?? "Select…";

  const listOptions = useMemo(() => {
    const base = emptyOption ? [emptyOption, ...options] : options;
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((o) => {
      const hay = `${o.label} ${o.keywords ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [options, emptyOption, query]);

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

  function pick(next: string) {
    onValueChange(next);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "border-input bg-background hover:bg-muted/40 flex h-10 w-full items-center gap-2 rounded-lg border px-3 text-left text-sm transition-colors",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <span className="text-muted-foreground shrink-0 font-medium">
          {inlineLabel}
        </span>
        <span className="border-border mx-1 h-4 w-px shrink-0 bg-border" />
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            !selected && "text-muted-foreground",
          )}
        >
          {disabled ? "Loading…" : displayLabel}
        </span>
        <ChevronDown
          className={cn(
            "text-muted-foreground size-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="bg-popover absolute z-50 mt-1 w-full rounded-lg border p-2 shadow-md">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-8"
              autoFocus
            />
          </div>
          <ul className="mt-2 max-h-52 space-y-0.5 overflow-y-auto">
            {listOptions.length === 0 ? (
              <li className="text-muted-foreground py-4 text-center text-sm">
                No matches
              </li>
            ) : (
              listOptions.map((option) => (
                <li key={option.value || "__empty__"}>
                  <button
                    type="button"
                    onClick={() => pick(option.value)}
                    className={cn(
                      "hover:bg-muted flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm",
                      option.value === value && "bg-muted font-medium",
                      option.value === "" && value === "" && "bg-muted font-medium",
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {(option.value === value ||
                      (option.value === "" && value === "")) && (
                      <Check className="text-primary size-4 shrink-0" />
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
