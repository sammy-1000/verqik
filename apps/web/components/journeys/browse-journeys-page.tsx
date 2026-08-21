"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  RouteCityCombobox,
  RouteCountryCombobox,
} from "@/components/forms/route-filter-comboboxes";
import { JourneyBrowseCard } from "@/components/journeys/journey-browse-card";
import { JourneyViewDialog } from "@/components/journeys/journey-view-dialog";
import { ListingSkeleton } from "@/components/app/listing-toolbar";
import { APP_HOME_PATH } from "@/lib/app/routes";
import {
  useJourneySearch,
  type JourneySearchFilters,
} from "@/lib/hooks/use-journey-search";
import { matchesRouteFilter } from "@/lib/journeys/format";
import type { JourneyRecord } from "@/lib/ws/types";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";

export function BrowseJourneysPage() {
  const router = useRouter();
  const { journeys, loading, applyFilters, filters } = useJourneySearch();
  const [routeQuery, setRouteQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState<JourneySearchFilters>({});
  const [viewJourney, setViewJourney] = useState<JourneyRecord | null>(null);

  const filtered = useMemo(
    () => journeys.filter((j) => matchesRouteFilter(j, routeQuery)),
    [journeys, routeQuery],
  );

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.originCountry) n++;
    if (filters.destinationCountry) n++;
    if (filters.originCityId) n++;
    if (filters.destinationCityId) n++;
    return n;
  }, [filters]);

  function openFilters() {
    setDraft({ ...filters });
    setFiltersOpen(true);
  }

  function applyAdvancedFilters() {
    applyFilters({
      originCountry: draft.originCountry || undefined,
      destinationCountry: draft.destinationCountry || undefined,
      originCityId: draft.originCityId || undefined,
      destinationCityId: draft.destinationCityId || undefined,
    });
    setFiltersOpen(false);
  }

  function clearFilters() {
    const empty: JourneySearchFilters = {};
    setDraft(empty);
    applyFilters(empty);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push(APP_HOME_PATH)}
          >
            <ArrowLeft className="size-4" />
            <span className="sr-only">Back to home</span>
          </Button>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Browse Journeys
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={routeQuery}
              onChange={(e) => setRouteQuery(e.target.value)}
              placeholder="Search by route…"
              className="pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={openFilters}
          >
            <SlidersHorizontal className="size-4" />
            Advanced filters
            {activeFilterCount > 0 ? (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-[10px] font-medium">
                {activeFilterCount}
              </span>
            ) : null}
          </Button>
        </div>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Advanced filters</SheetTitle>
            <SheetDescription>
              Narrow journeys by origin and destination.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-2">
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Origin
              </p>
              <RouteCountryCombobox
                id="filterFromCountry"
                inlineLabel="From"
                value={draft.originCountry ?? ""}
                onValueChange={(code) =>
                  setDraft((d) => ({
                    ...d,
                    originCountry: code,
                    originCityId: "",
                  }))
                }
              />
              <RouteCityCombobox
                id="filterFromCity"
                inlineLabel="From"
                value={draft.originCityId ?? ""}
                onValueChange={(id) =>
                  setDraft((d) => ({ ...d, originCityId: id }))
                }
                countryCode={draft.originCountry || undefined}
              />
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Destination
              </p>
              <RouteCountryCombobox
                id="filterToCountry"
                inlineLabel="To"
                value={draft.destinationCountry ?? ""}
                onValueChange={(code) =>
                  setDraft((d) => ({
                    ...d,
                    destinationCountry: code,
                    destinationCityId: "",
                  }))
                }
              />
              <RouteCityCombobox
                id="filterToCity"
                inlineLabel="To"
                value={draft.destinationCityId ?? ""}
                onValueChange={(id) =>
                  setDraft((d) => ({ ...d, destinationCityId: id }))
                }
                countryCode={draft.destinationCountry || undefined}
              />
            </div>
          </div>

          <div className="border-border mt-auto flex gap-2 border-t pt-4">
            <Button type="button" className="flex-1" onClick={applyAdvancedFilters}>
              Apply filters
            </Button>
            <Button type="button" variant="outline" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {loading ? (
        <ListingSkeleton count={4} viewMode="list" />
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          No journeys match your search.
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((journey) => (
            <JourneyBrowseCard
              key={journey.id}
              journey={journey}
              onView={() => setViewJourney(journey)}
            />
          ))}
        </div>
      )}

      <JourneyViewDialog
        journey={viewJourney}
        open={viewJourney !== null}
        onOpenChange={(open) => !open && setViewJourney(null)}
      />
    </div>
  );
}
