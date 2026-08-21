"use client";

import { useState } from "react";
import { FileUploadField } from "@/components/forms/file-upload-field";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";

export type DeliveryActionConfig = {
  status: string;
  title: string;
  description?: string;
  confirmLabel: string;
  requirePhoto?: "pickup" | "delivery";
  showRendezvous?: boolean;
  rendezvousLabel?: string;
  showNote?: boolean;
};

export function DeliveryActionDialog({
  open,
  config,
  requestId,
  onClose,
  onSubmit,
}: {
  open: boolean;
  config: DeliveryActionConfig | null;
  requestId: string;
  onClose: () => void;
  onSubmit: (payload: {
    requestId: string;
    status: string;
    note?: string;
    pickupPhotoFileId?: string;
    deliveryPhotoFileId?: string;
    rendezvousAddress?: string;
  }) => Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [rendezvousAddress, setRendezvousAddress] = useState("");
  const [pickupPhotoFileId, setPickupPhotoFileId] = useState<string | null>(null);
  const [deliveryPhotoFileId, setDeliveryPhotoFileId] = useState<string | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setNote("");
    setRendezvousAddress("");
    setPickupPhotoFileId(null);
    setDeliveryPhotoFileId(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!config) return;
    setSubmitting(true);
    try {
      await onSubmit({
        requestId,
        status: config.status,
        note: note.trim() || undefined,
        pickupPhotoFileId: pickupPhotoFileId ?? undefined,
        deliveryPhotoFileId: deliveryPhotoFileId ?? undefined,
        rendezvousAddress: rendezvousAddress.trim() || undefined,
      });
      handleClose();
    } finally {
      setSubmitting(false);
    }
  }

  const photoReady =
    config?.requirePhoto === "pickup"
      ? Boolean(pickupPhotoFileId)
      : config?.requirePhoto === "delivery"
        ? Boolean(deliveryPhotoFileId)
        : true;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        {config ? (
          <>
            <DialogHeader>
              <DialogTitle>{config.title}</DialogTitle>
              {config.description ? (
                <p className="text-muted-foreground text-sm">{config.description}</p>
              ) : null}
            </DialogHeader>

            <div className="space-y-4">
              {config.showRendezvous ? (
                <FormField
                  label={config.rendezvousLabel ?? "Rendezvous address"}
                  htmlFor="rendezvousAddress"
                >
                  <Input
                    id="rendezvousAddress"
                    value={rendezvousAddress}
                    onChange={(e) => setRendezvousAddress(e.target.value)}
                    placeholder="Terminal, gate, café, hotel lobby…"
                  />
                </FormField>
              ) : null}

              {config.requirePhoto === "pickup" ? (
                <FileUploadField
                  id="pickupPhoto"
                  label="Pickup evidence photo"
                  hint="Photo of the package at handover"
                  required
                  accept="image/*"
                  module="delivery/pickup"
                  entityType="delivery_request"
                  value={pickupPhotoFileId}
                  onValueChange={setPickupPhotoFileId}
                />
              ) : null}

              {config.requirePhoto === "delivery" ? (
                <FileUploadField
                  id="deliveryPhoto"
                  label="Delivery evidence photo"
                  hint="Photo confirming handover to recipient"
                  required
                  accept="image/*"
                  module="delivery/delivery"
                  entityType="delivery_request"
                  value={deliveryPhotoFileId}
                  onValueChange={setDeliveryPhotoFileId}
                />
              ) : null}

              {config.showNote !== false ? (
                <FormField label="Note" htmlFor="actionNote">
                  <Textarea
                    id="actionNote"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Optional message for the sender"
                  />
                </FormField>
              ) : null}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={submitting || !photoReady}
                onClick={() => void handleSubmit()}
              >
                {submitting ? "Saving…" : config.confirmLabel}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export const TRAVELER_ACTION_CONFIG: Record<string, DeliveryActionConfig> = {
  ACCEPTED: {
    status: "ACCEPTED",
    title: "Accept delivery request",
    description: "Confirm you can carry this package on your journey.",
    confirmLabel: "Accept request",
    showRendezvous: true,
    rendezvousLabel: "Suggested pickup rendezvous",
  },
  REJECTED: {
    status: "REJECTED",
    title: "Reject request",
    confirmLabel: "Reject",
    showNote: true,
  },
  PICKED_UP: {
    status: "PICKED_UP",
    title: "Confirm pickup",
    description: "Upload a photo as proof you received the package.",
    confirmLabel: "Confirm pickup",
    requirePhoto: "pickup",
    showRendezvous: true,
    rendezvousLabel: "Actual pickup location",
  },
  IN_TRANSIT: {
    status: "IN_TRANSIT",
    title: "Mark in transit",
    description: "Package is with you and en route to destination.",
    confirmLabel: "Start transit",
  },
  DELIVERED: {
    status: "DELIVERED",
    title: "Confirm delivery",
    description: "Upload proof the package was handed over.",
    confirmLabel: "Confirm delivery",
    requirePhoto: "delivery",
    showRendezvous: true,
    rendezvousLabel: "Delivery rendezvous location",
  },
};
