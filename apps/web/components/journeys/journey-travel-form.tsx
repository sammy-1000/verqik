"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { TRAVEL_PHASE_LABELS } from "@/lib/delivery/status-labels";
import type { JourneyRecord } from "@/lib/ws/types";
import { wsClient } from "@/lib/ws/client";
import { WsEvents } from "@/lib/ws/events";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";

const TRAVEL_PHASES = [
  "SCHEDULED",
  "DEPARTED",
  "EN_ROUTE",
  "LANDED",
  "AT_RENDEZVOUS",
] as const;

export function JourneyTravelForm({
  journey,
  onUpdated,
}: {
  journey: JourneyRecord;
  onUpdated?: () => void;
}) {
  const [travelPhase, setTravelPhase] = useState(journey.travelPhase ?? "SCHEDULED");
  const [expectedLandingAt, setExpectedLandingAt] = useState(
    journey.expectedLandingAt
      ? new Date(journey.expectedLandingAt).toISOString().slice(0, 16)
      : "",
  );
  const [rendezvousAddress, setRendezvousAddress] = useState(
    journey.rendezvousAddress ?? "",
  );
  const [rendezvousNotes, setRendezvousNotes] = useState(
    journey.rendezvousNotes ?? "",
  );
  const [travelUpdateNote, setTravelUpdateNote] = useState(
    journey.travelUpdateNote ?? "",
  );
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await wsClient.rpc(WsEvents.JOURNEYS_UPDATE_TRAVEL, {
        journeyId: journey.id,
        travelPhase,
        expectedLandingAt: expectedLandingAt
          ? new Date(expectedLandingAt).toISOString()
          : undefined,
        rendezvousAddress: rendezvousAddress.trim() || undefined,
        rendezvousNotes: rendezvousNotes.trim() || undefined,
        travelUpdateNote: travelUpdateNote.trim() || undefined,
      });
      toast.success("Travel status updated");
      onUpdated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-muted/40 space-y-3 rounded-lg border p-4">
      <p className="text-sm font-medium">Journey travel status</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Travel phase" htmlFor={`phase-${journey.id}`}>
          <Select
            value={travelPhase}
            onValueChange={(value) => value && setTravelPhase(value)}
          >
            <SelectTrigger id={`phase-${journey.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRAVEL_PHASES.map((phase) => (
                <SelectItem key={phase} value={phase}>
                  {TRAVEL_PHASE_LABELS[phase]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Expected landing" htmlFor={`eta-${journey.id}`}>
          <Input
            id={`eta-${journey.id}`}
            type="datetime-local"
            value={expectedLandingAt}
            onChange={(e) => setExpectedLandingAt(e.target.value)}
          />
        </FormField>
        <FormField
          label="Rendezvous address"
          htmlFor={`rendezvous-${journey.id}`}
          className="sm:col-span-2"
        >
          <Input
            id={`rendezvous-${journey.id}`}
            value={rendezvousAddress}
            onChange={(e) => setRendezvousAddress(e.target.value)}
            placeholder="Where senders/recipients should meet you"
          />
        </FormField>
        <FormField
          label="Rendezvous notes"
          htmlFor={`rendezvous-notes-${journey.id}`}
          className="sm:col-span-2"
        >
          <Textarea
            id={`rendezvous-notes-${journey.id}`}
            value={rendezvousNotes}
            onChange={(e) => setRendezvousNotes(e.target.value)}
            placeholder="Terminal, landmark, contact instructions…"
          />
        </FormField>
        <FormField
          label="Update for senders"
          htmlFor={`travel-note-${journey.id}`}
          className="sm:col-span-2"
        >
          <Textarea
            id={`travel-note-${journey.id}`}
            value={travelUpdateNote}
            onChange={(e) => setTravelUpdateNote(e.target.value)}
            placeholder="Brief status message visible to senders"
          />
        </FormField>
      </div>
      <Button type="button" size="sm" disabled={saving} onClick={() => void save()}>
        {saving ? "Saving…" : "Update travel status"}
      </Button>
    </div>
  );
}

export function JourneyTravelSummary({
  journey,
}: {
  journey: {
    travelPhase?: string | null;
    expectedLandingAt?: string | null;
    actualLandingAt?: string | null;
    rendezvousAddress?: string | null;
    rendezvousNotes?: string | null;
    travelUpdateNote?: string | null;
  };
}) {
  if (!journey.travelPhase && !journey.expectedLandingAt && !journey.rendezvousAddress) {
    return null;
  }

  return (
    <div className="bg-muted/30 space-y-1 rounded-md border p-3 text-sm">
      <p className="font-medium">Traveler status</p>
      {journey.travelPhase ? (
        <p className="text-muted-foreground">
          Phase: {TRAVEL_PHASE_LABELS[journey.travelPhase] ?? journey.travelPhase}
        </p>
      ) : null}
      {journey.expectedLandingAt ? (
        <p className="text-muted-foreground">
          Expected landing:{" "}
          {new Date(journey.expectedLandingAt).toLocaleString()}
        </p>
      ) : null}
      {journey.actualLandingAt ? (
        <p className="text-muted-foreground">
          Landed: {new Date(journey.actualLandingAt).toLocaleString()}
        </p>
      ) : null}
      {journey.rendezvousAddress ? (
        <p className="text-muted-foreground">
          Rendezvous: {journey.rendezvousAddress}
        </p>
      ) : null}
      {journey.rendezvousNotes ? (
        <p className="text-muted-foreground">{journey.rendezvousNotes}</p>
      ) : null}
      {journey.travelUpdateNote ? (
        <p className="text-muted-foreground italic">{journey.travelUpdateNote}</p>
      ) : null}
    </div>
  );
}
