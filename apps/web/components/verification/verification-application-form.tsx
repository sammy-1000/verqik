"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { DocumentUploadField } from "@/components/forms/document-upload-field";
import { IdDocumentTypeSelect } from "@/components/forms/id-document-type-select";
import { IdDocumentType, VerificationStatus } from "@/lib/enums";
import { wsClient } from "@/lib/ws/client";
import { WsEvents } from "@/lib/ws/events";
import type { UserProfile } from "@/lib/ws/types";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export function VerificationApplicationForm({ user }: { user: UserProfile }) {
  const { refreshProfile } = useAuth();
  const status =
    (user.verification?.status as VerificationStatus) ??
    VerificationStatus.UNVERIFIED;
  const canSubmit =
    status === VerificationStatus.UNVERIFIED ||
    status === VerificationStatus.REJECTED;

  const [docType, setDocType] = useState(IdDocumentType.PASSPORT);
  const [docFileId, setDocFileId] = useState<string | null>(null);
  const [selfieFileId, setSelfieFileId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!canSubmit) {
    return null;
  }

  async function submit() {
    if (!docFileId || !selfieFileId) {
      toast.error("Please upload your ID document and selfie");
      return;
    }
    setSubmitting(true);
    try {
      await wsClient.rpc(WsEvents.VERIFICATION_SUBMIT, {
        idDocumentType: docType,
        idDocumentFileId: docFileId,
        selfieFileId,
      });
      await refreshProfile();
      toast.success("Verification submitted for review");
      setDocFileId(null);
      setSelfieFileId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="overflow-hidden border-border/80 shadow-sm">
      <CardHeader className="border-border/60 border-b bg-muted/20">
        <CardTitle className="text-xl">Verification application</CardTitle>
        <CardDescription>
          Upload a valid ID and a selfie. We keep your documents secure and only use
          them to confirm your identity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <IdDocumentTypeSelect value={docType} onValueChange={setDocType} />

        <div className="grid gap-6 lg:grid-cols-2">
          <DocumentUploadField
            id="idDocument"
            label="Government ID"
            hint="Passport, national ID, or driver's license"
            required
            module="verification"
            entityType="id_document"
            accept="image/*,application/pdf"
            value={docFileId}
            onValueChange={setDocFileId}
            dropLabel="Upload your ID"
            dropHint="Drag & drop or browse · JPG, PNG, or PDF"
          />
          <DocumentUploadField
            id="selfie"
            label="Selfie with ID"
            hint="Hold your ID next to your face — good lighting helps"
            required
            module="verification"
            entityType="selfie"
            accept="image/*"
            value={selfieFileId}
            onValueChange={setSelfieFileId}
            dropLabel="Upload your selfie"
            dropHint="Drag & drop or browse · JPG or PNG"
          />
        </div>

        <div className="flex flex-col gap-3 border-t pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs sm:max-w-md">
            By submitting, you confirm these documents are yours and accurate.
          </p>
          <Button
            size="lg"
            className="gap-2 sm:shrink-0"
            onClick={() => void submit()}
            disabled={submitting || !docFileId || !selfieFileId}
          >
            <Send className="size-4" />
            {submitting ? "Submitting…" : "Submit for review"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
