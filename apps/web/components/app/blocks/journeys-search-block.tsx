"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CountryPicker } from "@/components/forms/country-picker";
import { CityPicker } from "@/components/forms/city-picker";
import { CurrencySelect } from "@/components/forms/currency-select";
import { FormField } from "@/components/forms/form-field";
import { ItemCategorySelect } from "@/components/forms/item-category-select";
import { CurrencyCode, isCurrencyCode } from "@/lib/enums";
import type { AppBlock } from "@/lib/app/types";
import type { DeliveryRequestRecord, JourneyRecord } from "@/lib/ws/types";
import { wsClient } from "@/lib/ws/client";
import { WsEvents, PushEvents } from "@/lib/ws/events";
import { Button } from "@workspace/ui/components/button";
import {
  ListingSkeleton,
  ListingToolbar,
} from "@/components/app/listing-toolbar";
import {
  useListingView,
  usePaginatedItems,
} from "@/lib/hooks/use-listing-view";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Textarea } from "@workspace/ui/components/textarea";

export function JourneysSearchBlock({ block }: { block: AppBlock }) {
  const [originCountry, setOriginCountry] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [originCityId, setOriginCityId] = useState("");
  const [destinationCityId, setDestinationCityId] = useState("");
  const [journeys, setJourneys] = useState<JourneyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { viewMode, setViewMode, page, setPage, pageSize } = useListingView(12);
  const paginated = usePaginatedItems(journeys, page, pageSize);

  const search = useCallback(async () => {
    setPage(1);
    setLoading(true);
    try {
      const results = await wsClient.rpc<JourneyRecord[]>(
        WsEvents.JOURNEYS_SEARCH,
        {
          originCountry: originCountry || undefined,
          destinationCountry: destinationCountry || undefined,
          originCityId: originCityId || undefined,
          destinationCityId: destinationCityId || undefined,
        },
      );
      setJourneys(results);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [originCountry, destinationCountry, originCityId, destinationCityId]);

  useEffect(() => {
    void search();
  }, [search]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{block.title}</CardTitle>
        <CardDescription>{block.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CountryPicker
            id="searchOrigin"
            label="Origin country"
            value={originCountry}
            onValueChange={(code) => {
              setOriginCountry(code);
              setOriginCityId("");
            }}
            allowEmpty
            placeholder="Any origin"
          />
          <CityPicker
            id="searchOriginCity"
            label="Origin city"
            value={originCityId}
            onValueChange={setOriginCityId}
            countryCode={originCountry || undefined}
            allowEmpty
            placeholder="Any city"
          />
          <CountryPicker
            id="searchDestination"
            label="Destination country"
            value={destinationCountry}
            onValueChange={(code) => {
              setDestinationCountry(code);
              setDestinationCityId("");
            }}
            allowEmpty
            placeholder="Any destination"
          />
          <CityPicker
            id="searchDestinationCity"
            label="Destination city"
            value={destinationCityId}
            onValueChange={setDestinationCityId}
            countryCode={destinationCountry || undefined}
            allowEmpty
            placeholder="Any city"
          />
          <div className="flex items-end">
            <Button className="w-full" onClick={() => void search()} disabled={loading}>
              {loading ? "Searching…" : "Search"}
            </Button>
          </div>
        </div>

        <ListingToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          total={paginated.total}
          page={paginated.page}
          totalPages={paginated.totalPages}
          onPageChange={setPage}
        />

        {loading ? (
          <ListingSkeleton viewMode={viewMode} />
        ) : paginated.items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No journeys found.</p>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "space-y-3"
            }
          >
            {paginated.items.map((j) => (
              <Card key={j.id} className={viewMode === "list" ? "py-0" : ""}>
                <CardContent
                  className={
                    viewMode === "grid"
                      ? "flex h-full flex-col gap-3 p-4"
                      : "flex flex-wrap items-center justify-between gap-3 p-4"
                  }
                >
                  <div>
                    <p className="font-medium">
                      {j.originCity} → {j.destinationCity}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {j.originCountry} → {j.destinationCountry}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Departs {new Date(j.departureDate).toLocaleDateString()} ·{" "}
                      {Number(j.availableWeightKg)} kg
                    </p>
                  </div>
                  <RequestDialog journey={j} onCreated={() => void search()} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RequestDialog({
  journey,
  onCreated,
}: {
  journey: JourneyRecord;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [weight, setWeight] = useState("1");
  const [price, setPrice] = useState("25");
  const [currency, setCurrency] = useState<CurrencyCode>(
    isCurrencyCode(journey.currency) ? journey.currency : CurrencyCode.USD,
  );
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    try {
      await wsClient.rpc(WsEvents.DELIVERY_REQUESTS_CREATE, {
        journeyId: journey.id,
        itemDescription: description,
        itemCategoryId: categoryId ?? undefined,
        itemWeightKg: Number(weight),
        agreedPrice: Number(price),
        currency,
      });
      toast.success("Delivery request sent!");
      setOpen(false);
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm">Send request</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send delivery request</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <ItemCategorySelect value={categoryId} onValueChange={setCategoryId} />
          <FormField label="Item description" htmlFor="itemDescription" required>
            <Textarea
              id="itemDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you sending?"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Weight (kg)" htmlFor="itemWeight" required>
              <Input
                id="itemWeight"
                type="number"
                min="0.1"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </FormField>
            <FormField label="Agreed price" htmlFor="agreedPrice" required>
              <Input
                id="agreedPrice"
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </FormField>
          </div>
          <CurrencySelect value={currency} onValueChange={setCurrency} />
          <Button className="w-full" disabled={submitting} onClick={() => void submit()}>
            {submitting ? "Sending…" : "Submit request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
