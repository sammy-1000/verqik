"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CountryPicker } from "@/components/forms/country-picker";
import { FileUploadField } from "@/components/forms/file-upload-field";
import { FormField } from "@/components/forms/form-field";
import type { AppBlock } from "@/lib/app/types";
import { invalidateCitiesCache } from "@/lib/hooks/use-cities";
import { wsClient } from "@/lib/ws/client";
import { WsEvents } from "@/lib/ws/events";
import type { CityRecord } from "@/lib/ws/types";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  ListingSkeleton,
  ListingToolbar,
} from "@/components/app/listing-toolbar";
import {
  useListingView,
  usePaginatedItems,
} from "@/lib/hooks/use-listing-view";

type CityFormState = {
  name: string;
  countryCode: string;
  timezone: string;
  latitude: string;
  longitude: string;
  airportCode: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  notes: string;
  sortOrder: string;
  enabled: boolean;
  imageFileIds: string[];
};

const emptyForm = (): CityFormState => ({
  name: "",
  countryCode: "RW",
  timezone: "Africa/Kigali",
  latitude: "",
  longitude: "",
  airportCode: "",
  contactEmail: "",
  contactPhone: "",
  contactAddress: "",
  notes: "",
  sortOrder: "0",
  enabled: true,
  imageFileIds: [],
});

function cityToForm(city: CityRecord): CityFormState {
  return {
    name: city.name,
    countryCode: city.countryCode,
    timezone: city.timezone,
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    airportCode: city.airportCode ?? "",
    contactEmail: city.contactEmail ?? "",
    contactPhone: city.contactPhone ?? "",
    contactAddress: city.contactAddress ?? "",
    notes: city.notes ?? "",
    sortOrder: String(city.sortOrder),
    enabled: city.enabled,
    imageFileIds: city.images?.map((img) => img.fileId) ?? [],
  };
}

function formToPayload(form: CityFormState) {
  return {
    name: form.name.trim(),
    countryCode: form.countryCode,
    timezone: form.timezone.trim(),
    latitude: Number(form.latitude),
    longitude: Number(form.longitude),
    airportCode: form.airportCode.trim() || undefined,
    contactEmail: form.contactEmail.trim() || undefined,
    contactPhone: form.contactPhone.trim() || undefined,
    contactAddress: form.contactAddress.trim() || undefined,
    notes: form.notes.trim() || undefined,
    sortOrder: Number(form.sortOrder) || 0,
    enabled: form.enabled,
    imageFileIds: form.imageFileIds,
  };
}

export function CitiesManagementBlock({ block }: { block: AppBlock }) {
  const [cities, setCities] = useState<CityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCountry, setFilterCountry] = useState("");
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CityFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const { viewMode, setViewMode, page, setPage, pageSize } = useListingView(12);
  const paginated = usePaginatedItems(cities, page, pageSize);

  const loadCities = useCallback(async () => {
    setPage(1);
    setLoading(true);
    try {
      const list = await wsClient.rpc<CityRecord[]>(WsEvents.ADMIN_CITIES_LIST, {
        countryCode: filterCountry || undefined,
        q: search.trim() || undefined,
      });
      setCities(list);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load cities");
    } finally {
      setLoading(false);
    }
  }, [filterCountry, search]);

  useEffect(() => {
    void loadCities();
  }, [loadCities]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setEditorOpen(true);
  }

  function openEdit(city: CityRecord) {
    setEditingId(city.id);
    setForm(cityToForm(city));
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  }

  async function saveCity() {
    setSaving(true);
    try {
      const payload = formToPayload(form);
      if (editingId) {
        await wsClient.rpc(WsEvents.ADMIN_CITIES_UPDATE, {
          cityId: editingId,
          ...payload,
        });
        toast.success("City updated");
      } else {
        await wsClient.rpc(WsEvents.ADMIN_CITIES_CREATE, payload);
        toast.success("City added");
      }
      invalidateCitiesCache();
      closeEditor();
      await loadCities();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save city");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCity(city: CityRecord) {
    if (
      !window.confirm(
        `Delete ${city.name}?${city.seedKey ? " It will not be re-added on deploy." : ""}`,
      )
    ) {
      return;
    }

    try {
      await wsClient.rpc(WsEvents.ADMIN_CITIES_DELETE, { cityId: city.id });
      toast.success("City deleted");
      invalidateCitiesCache();
      await loadCities();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete city");
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{block.title}</CardTitle>
            <CardDescription>{block.description}</CardDescription>
          </div>
          <Button type="button" onClick={openCreate}>
            Add city
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <CountryPicker
              id="cityFilterCountry"
              label="Filter by country"
              value={filterCountry}
              onValueChange={setFilterCountry}
              allowEmpty
              placeholder="All countries"
            />
            <FormField label="Search" htmlFor="citySearch">
              <Input
                id="citySearch"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or airport code"
              />
            </FormField>
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
            <p className="text-sm text-muted-foreground">No cities found.</p>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                  : "divide-y rounded-md border"
              }
            >
              {paginated.items.map((city) => (
                <CityRow
                  key={city.id}
                  city={city}
                  viewMode={viewMode}
                  onEdit={() => openEdit(city)}
                  onDelete={() => void deleteCity(city)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={(open) => !open && closeEditor()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit city" : "Add city"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Name" htmlFor="cityName" required className="sm:col-span-2">
              <Input
                id="cityName"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </FormField>
            <CountryPicker
              id="cityCountry"
              label="Country"
              value={form.countryCode}
              onValueChange={(code) =>
                setForm((f) => ({ ...f, countryCode: code }))
              }
              required
            />
            <FormField label="Timezone" htmlFor="cityTimezone" required>
              <Input
                id="cityTimezone"
                value={form.timezone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, timezone: e.target.value }))
                }
                placeholder="Africa/Kigali"
                required
              />
            </FormField>
            <FormField label="Latitude" htmlFor="cityLat" required>
              <Input
                id="cityLat"
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) =>
                  setForm((f) => ({ ...f, latitude: e.target.value }))
                }
                required
              />
            </FormField>
            <FormField label="Longitude" htmlFor="cityLng" required>
              <Input
                id="cityLng"
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) =>
                  setForm((f) => ({ ...f, longitude: e.target.value }))
                }
                required
              />
            </FormField>
            <FormField label="Airport code" htmlFor="cityAirport">
              <Input
                id="cityAirport"
                value={form.airportCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, airportCode: e.target.value.toUpperCase() }))
                }
                maxLength={3}
                placeholder="KGL"
              />
            </FormField>
            <FormField label="Sort order" htmlFor="citySort">
              <Input
                id="citySort"
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sortOrder: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Contact email" htmlFor="cityEmail" className="sm:col-span-2">
              <Input
                id="cityEmail"
                type="email"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactEmail: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Contact phone" htmlFor="cityPhone" className="sm:col-span-2">
              <Input
                id="cityPhone"
                value={form.contactPhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactPhone: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Contact address" htmlFor="cityAddress" className="sm:col-span-2">
              <Textarea
                id="cityAddress"
                value={form.contactAddress}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactAddress: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Notes" htmlFor="cityNotes" className="sm:col-span-2">
              <Textarea
                id="cityNotes"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </FormField>
            <FileUploadField
              id="cityImage"
              label="Add image"
              hint="Upload city photo; save to attach. Files store path only — URLs resolved at read time."
              module="cities"
              entityType="city"
              value={null}
              onValueChange={(fileId) => {
                if (!fileId) return;
                setForm((f) => ({
                  ...f,
                  imageFileIds: [...f.imageFileIds, fileId],
                }));
              }}
              className="sm:col-span-2"
            />
            {form.imageFileIds.length > 0 ? (
              <p className="text-muted-foreground text-xs sm:col-span-2">
                {form.imageFileIds.length} image(s) attached
              </p>
            ) : null}
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) =>
                  setForm((f) => ({ ...f, enabled: e.target.checked }))
                }
              />
              Enabled for journeys
            </label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeEditor}>
              Cancel
            </Button>
            <Button type="button" disabled={saving} onClick={() => void saveCity()}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CityRow({
  city,
  viewMode,
  onEdit,
  onDelete,
}: {
  city: CityRecord;
  viewMode: "grid" | "list";
  onEdit: () => void;
  onDelete: () => void;
}) {
  const content = (
    <>
      <div className="flex gap-3">
        {city.images?.[0]?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={city.images[0].url}
            alt={city.name}
            className={
              viewMode === "grid"
                ? "h-28 w-full rounded-md border object-cover"
                : "h-16 w-16 shrink-0 rounded-md border object-cover"
            }
          />
        ) : null}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{city.name}</span>
            <Badge variant="outline">{city.countryCode}</Badge>
            {city.airportCode ? (
              <Badge variant="secondary">{city.airportCode}</Badge>
            ) : null}
            {!city.enabled ? (
              <Badge variant="destructive">Disabled</Badge>
            ) : null}
            <Badge variant="outline">{city.source}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {city.timezone}
            {city.contactPhone ? ` · ${city.contactPhone}` : ""}
            {city.contactEmail ? ` · ${city.contactEmail}` : ""}
          </p>
          {city.contactAddress ? (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {city.contactAddress}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </>
  );

  if (viewMode === "grid") {
    return (
      <Card className="overflow-hidden py-0">
        <CardContent className="flex h-full flex-col gap-3 p-4">
          {content}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
      {content}
    </div>
  );
}
