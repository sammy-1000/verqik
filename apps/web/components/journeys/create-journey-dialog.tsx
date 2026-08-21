"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Package,
  Plane,
  Wallet,
} from "lucide-react";
import { CitySelectField } from "@/components/forms/city-picker";
import { SelectedCityCard } from "@/components/forms/city-select-field";
import { CurrencySelect } from "@/components/forms/currency-select";
import { FormField } from "@/components/forms/form-field";
import {
  CurrencyCode,
  isCurrencyCode,
} from "@/lib/enums";
import {
  getCityById,
  useCities,
} from "@/lib/hooks/use-cities";
import {
  getCountryByCode,
  useCountries,
} from "@/lib/hooks/use-countries";
import { wsClient } from "@/lib/ws/client";
import { WsEvents } from "@/lib/ws/events";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";

const STEPS = [
  { id: "route", label: "Route", icon: MapPin },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "pricing", label: "Capacity", icon: Package },
  { id: "review", label: "Review", icon: Check },
] as const;

type StepId = (typeof STEPS)[number]["id"];

type FormState = {
  originCityId: string;
  destinationCityId: string;
  departureDate: string;
  arrivalDate: string;
  weight: string;
  pricePerKg: string;
  currency: CurrencyCode;
  notes: string;
};

const emptyForm = (): FormState => ({
  originCityId: "",
  destinationCityId: "",
  departureDate: "",
  arrivalDate: "",
  weight: "5",
  pricePerKg: "10",
  currency: CurrencyCode.USD,
  notes: "",
});

export function CreateJourneyDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}) {
  const { countries } = useCountries();
  const { cities } = useCities();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const currentStep = STEPS[step]!;
  const originCity = getCityById(cities, form.originCityId);
  const destinationCity = getCityById(cities, form.destinationCityId);

  function reset() {
    setStep(0);
    setForm(emptyForm());
  }

  function close(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) reset();
  }

  function patch(values: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...values }));
  }

  function handleOriginCity(cityId: string) {
    const city = getCityById(cities, cityId);
    const country = city
      ? getCountryByCode(countries, city.countryCode)
      : undefined;
    const updates: Partial<FormState> = { originCityId: cityId };
    if (country?.currency && isCurrencyCode(country.currency)) {
      updates.currency = country.currency;
    }
    patch(updates);
  }

  function canContinue(): boolean {
    if (currentStep.id === "route") {
      return Boolean(form.originCityId && form.destinationCityId && form.originCityId !== form.destinationCityId);
    }
    if (currentStep.id === "schedule") {
      return Boolean(form.departureDate && form.arrivalDate && form.arrivalDate >= form.departureDate);
    }
    if (currentStep.id === "pricing") {
      return Number(form.weight) > 0 && Number(form.pricePerKg) > 0;
    }
    return true;
  }

  async function submit() {
    setSubmitting(true);
    try {
      await wsClient.rpc(WsEvents.JOURNEYS_CREATE, {
        originCityId: form.originCityId,
        destinationCityId: form.destinationCityId,
        departureDate: form.departureDate,
        arrivalDate: form.arrivalDate,
        availableWeightKg: Number(form.weight),
        pricePerKg: Number(form.pricePerKg),
        currency: form.currency,
        notes: form.notes || undefined,
      });
      toast.success("Journey published!");
      close(false);
      onCreated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create journey");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        showCloseButton
        className={cn(
          "flex max-h-[100dvh] flex-col gap-0 overflow-hidden p-0",
          "fixed inset-0 h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 rounded-none",
          "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[min(90dvh,820px)] sm:w-full sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl",
        )}
      >
        <DialogHeader className="border-border space-y-3 border-b px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2 pr-8">
            <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
              <Plane className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Publish a journey</DialogTitle>
              <DialogDescription>
                Step {step + 1} of {STEPS.length} · {currentStep.label}
              </DialogDescription>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs",
                    active && "bg-primary/10 text-primary font-medium",
                    done && !active && "text-muted-foreground",
                    !active && !done && "text-muted-foreground/70",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="truncate">{s.label}</span>
                </div>
              );
            })}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {currentStep.id === "route" ? (
            <div className="space-y-5">
              <CitySelectField
                id="originCity"
                label="Where are you leaving from?"
                value={form.originCityId}
                onValueChange={handleOriginCity}
                appearance="field"
                emptyLabel="Select origin city"
                emptyHint="Pick the airport city you depart from"
                required
              />
              <div className="flex justify-center">
                <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full">
                  <ArrowRight className="size-5" />
                </div>
              </div>
              <CitySelectField
                id="destinationCity"
                label="Where are you going?"
                value={form.destinationCityId}
                onValueChange={(id: string) => patch({ destinationCityId: id })}
                appearance="field"
                emptyLabel="Select destination city"
                emptyHint="Pick where you'll arrive"
                required
              />
              {form.originCityId &&
              form.destinationCityId &&
              form.originCityId === form.destinationCityId ? (
                <p className="text-destructive text-sm">
                  Origin and destination must be different cities.
                </p>
              ) : null}
            </div>
          ) : null}

          {currentStep.id === "schedule" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Departure date" htmlFor="departureDate" required>
                <Input
                  id="departureDate"
                  type="date"
                  value={form.departureDate}
                  onChange={(e) => patch({ departureDate: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Arrival date" htmlFor="arrivalDate" required>
                <Input
                  id="arrivalDate"
                  type="date"
                  min={form.departureDate || undefined}
                  value={form.arrivalDate}
                  onChange={(e) => patch({ arrivalDate: e.target.value })}
                  required
                />
              </FormField>
            </div>
          ) : null}

          {currentStep.id === "pricing" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Available weight (kg)" htmlFor="weight" required>
                <Input
                  id="weight"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={form.weight}
                  onChange={(e) => patch({ weight: e.target.value })}
                />
              </FormField>
              <FormField label="Price per kg" htmlFor="pricePerKg" required>
                <div className="relative">
                  <Wallet className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                  <Input
                    id="pricePerKg"
                    type="number"
                    min="1"
                    className="pl-8"
                    value={form.pricePerKg}
                    onChange={(e) => patch({ pricePerKg: e.target.value })}
                  />
                </div>
              </FormField>
              <CurrencySelect
                value={form.currency}
                onValueChange={(c) => patch({ currency: c })}
              />
            </div>
          ) : null}

          {currentStep.id === "review" ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <SelectedCityCard city={originCity} emptyLabel="Origin" />
                <ArrowRight className="text-muted-foreground mx-auto hidden size-5 sm:block" />
                <SelectedCityCard city={destinationCity} emptyLabel="Destination" />
              </div>
              <div className="bg-muted/40 grid gap-2 rounded-xl p-4 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Departure:</span>{" "}
                  {form.departureDate
                    ? new Date(form.departureDate).toLocaleDateString()
                    : "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Arrival:</span>{" "}
                  {form.arrivalDate
                    ? new Date(form.arrivalDate).toLocaleDateString()
                    : "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Capacity:</span>{" "}
                  {form.weight} kg
                </p>
                <p>
                  <span className="text-muted-foreground">Rate:</span>{" "}
                  {form.pricePerKg} {form.currency}/kg
                </p>
              </div>
              <FormField label="Notes for senders (optional)" htmlFor="notes">
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => patch({ notes: e.target.value })}
                  placeholder="Flight number, pickup preferences, handoff details…"
                  rows={4}
                />
              </FormField>
            </div>
          ) : null}
        </div>

        <DialogFooter className="border-border mt-0 border-t px-4 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0 || submitting}
            onClick={() => setStep((s) => s - 1)}
          >
            <ChevronLeft className="size-4" />
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              disabled={!canContinue()}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button type="button" disabled={submitting} onClick={() => void submit()}>
              {submitting ? "Publishing…" : "Publish journey"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
