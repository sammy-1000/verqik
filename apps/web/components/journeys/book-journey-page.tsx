"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Package,
  Plane,
  Send,
  User,
} from "lucide-react";
import { CurrencySelect } from "@/components/forms/currency-select";
import { FormField } from "@/components/forms/form-field";
import { ItemCategorySelect } from "@/components/forms/item-category-select";
import { MultiImageUploadField, type UploadedImage } from "@/components/forms/multi-image-upload-field";
import { UserDisplay } from "@/components/user/user-display";
import { APP_BROWSE_PATH, APP_HOME_PATH } from "@/lib/app/routes";
import { CurrencyCode, isCurrencyCode } from "@/lib/enums";
import { useCities } from "@/lib/hooks/use-cities";
import {
  formatJourneyDate,
  formatPricePerKg,
  journeyRouteLabel,
  resolveAirportCode,
} from "@/lib/journeys/format";
import { wsClient } from "@/lib/ws/client";
import { WsEvents } from "@/lib/ws/events";
import type { JourneyForBooking, PublicUserProfile } from "@/lib/ws/types";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";

const STEPS = [
  { id: "traveler", label: "Traveler", icon: User },
  { id: "package", label: "Package", icon: Package },
  { id: "photos", label: "Photos", icon: Camera },
  { id: "review", label: "Review", icon: Check },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export function BookJourneyPage({ journeyId }: { journeyId: string }) {
  const router = useRouter();
  const { cities } = useCities();
  const [loading, setLoading] = useState(true);
  const [journey, setJourney] = useState<JourneyForBooking | null>(null);
  const [step, setStep] = useState<StepId>("traveler");
  const [submitting, setSubmitting] = useState(false);

  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [weight, setWeight] = useState("1");
  const [price, setPrice] = useState("25");
  const [currency, setCurrency] = useState<CurrencyCode>(CurrencyCode.USD);
  const [photos, setPhotos] = useState<UploadedImage[]>([]);
  const [photosUploading, setPhotosUploading] = useState(false);

  const loadJourney = useCallback(async () => {
    setLoading(true);
    try {
      const data = await wsClient.rpc<JourneyForBooking>(WsEvents.JOURNEYS_GET, {
        journeyId,
      });
      setJourney(data);
      setWeight("1");
      setPrice(String(Number(data.pricePerKg ?? 25) * 1));
      setCurrency(
        isCurrencyCode(data.currency) ? data.currency : CurrencyCode.USD,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Journey not found");
      router.replace(APP_BROWSE_PATH);
    } finally {
      setLoading(false);
    }
  }, [journeyId, router]);

  useEffect(() => {
    void loadJourney();
  }, [loadJourney]);

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  function goNext() {
    if (step === "traveler") setStep("package");
    else if (step === "package") {
      if (!description.trim()) {
        toast.error("Describe what you are sending");
        return;
      }
      setStep("photos");
    } else if (step === "photos") {
      if (photosUploading) {
        toast.error("Wait for photos to finish uploading");
        return;
      }
      setStep("review");
    }
  }

  function goBack() {
    if (stepIndex <= 0) {
      router.back();
      return;
    }
    setStep(STEPS[stepIndex - 1]!.id);
  }

  async function submit() {
    if (!journey) return;
    setSubmitting(true);
    try {
      await wsClient.rpc(WsEvents.DELIVERY_REQUESTS_CREATE, {
        journeyId: journey.id,
        itemDescription: description,
        itemCategoryId: categoryId ?? undefined,
        itemWeightKg: Number(weight),
        agreedPrice: Number(price),
        currency,
        itemPhotoFileIds: photos.map((p) => p.fileId),
      });
      toast.success("Delivery request sent!");
      router.push(`${APP_HOME_PATH}?tab=shipments`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !journey) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const traveler = journey.traveler as PublicUserProfile;
  const originCode = resolveAirportCode(journey.originCity, cities);
  const destinationCode = resolveAirportCode(journey.destinationCity, cities);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon-sm" onClick={goBack}>
          <ArrowLeft className="size-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Book journey
          </h1>
          <p className="text-muted-foreground text-sm">{journeyRouteLabel(journey)}</p>
        </div>
      </div>

      {/* Step indicator */}
      <nav className="flex flex-wrap gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = s.id === step;
          const done = i < stepIndex;
          return (
            <div
              key={s.id}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm",
                active && "bg-primary text-primary-foreground",
                !active && done && "bg-muted text-foreground",
                !active && !done && "text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
              {s.label}
            </div>
          );
        })}
      </nav>

      {step === "traveler" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your traveler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <UserDisplay
                user={traveler}
                showAvatar
                showName
                showVerification
                showRating
                size="lg"
                layout="horizontal"
              />
              <p className="text-muted-foreground text-sm">
                This person will carry your package on their trip. Verified travelers
                have completed identity checks.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trip details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-lg font-bold">{originCode}</p>
                  <p className="text-muted-foreground text-xs">{journey.originCity}</p>
                </div>
                <Plane className="text-muted-foreground size-5" />
                <div className="text-right">
                  <p className="text-lg font-bold">{destinationCode}</p>
                  <p className="text-muted-foreground text-xs">
                    {journey.destinationCity}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  {formatJourneyDate(journey.departureDate)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Package className="size-4" />
                  {Number(journey.availableWeightKg)} kg available
                </span>
              </div>
              <Badge variant="outline" className="text-sm font-semibold">
                {formatPricePerKg(journey)}
              </Badge>
              {journey.notes ? (
                <p className="text-muted-foreground text-sm">{journey.notes}</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {step === "package" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Package details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ItemCategorySelect value={categoryId} onValueChange={setCategoryId} />
            <FormField label="Item description" htmlFor="bookItemDescription" required>
              <Textarea
                id="bookItemDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are you sending? Include size, fragility, and any special handling."
                rows={4}
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Weight (kg)" htmlFor="bookItemWeight" required>
                <Input
                  id="bookItemWeight"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={weight}
                  onChange={(e) => {
                    setWeight(e.target.value);
                    const kg = Number(e.target.value);
                    if (!Number.isNaN(kg) && journey.pricePerKg) {
                      setPrice(String(Number(journey.pricePerKg) * kg));
                    }
                  }}
                />
              </FormField>
              <FormField label="Agreed price" htmlFor="bookAgreedPrice" required>
                <Input
                  id="bookAgreedPrice"
                  type="number"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </FormField>
            </div>
            <CurrencySelect value={currency} onValueChange={setCurrency} />
          </CardContent>
        </Card>
      ) : null}

      {step === "photos" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Package photos</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiImageUploadField
              id="itemPhotos"
              label="Photos for your traveler"
              hint="Help the traveler recognize your package at pickup"
              module="delivery"
              entityType="delivery_request_item"
              value={photos}
              onValueChange={setPhotos}
              onUploadingChange={setPhotosUploading}
            />
          </CardContent>
        </Card>
      ) : null}

      {step === "review" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review & send</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start justify-between gap-4">
              <UserDisplay user={traveler} showAvatar showName showVerification size="sm" />
              <span className="text-muted-foreground">{journeyRouteLabel(journey)}</span>
            </div>
            <Separator />
            <dl className="grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Description</dt>
                <dd>{description}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Weight</dt>
                <dd>{weight} kg</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Price</dt>
                <dd>
                  {price} {currency}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground mb-2">Photos</dt>
                <dd>
                  {photos.length === 0 ? (
                    <span className="text-muted-foreground">None attached</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {photos.map((photo) => (
                        <div
                          key={photo.fileId}
                          className="border-border size-16 overflow-hidden rounded-md border"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.previewUrl}
                            alt={photo.fileName}
                            className="size-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={goBack}>
          <ChevronLeft className="size-4" />
          {stepIndex === 0 ? "Cancel" : "Back"}
        </Button>
        {step === "review" ? (
          <Button type="button" disabled={submitting} onClick={() => void submit()}>
            <Send className="size-4" />
            {submitting ? "Sending…" : "Send request"}
          </Button>
        ) : (
          <Button type="button" onClick={goNext}>
            Continue
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
