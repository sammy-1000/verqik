"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { FileUploadField } from "@/components/forms/file-upload-field";
import { IdDocumentTypeSelect } from "@/components/forms/id-document-type-select";
import {
  IdDocumentType,
  VerificationStatus,
  VERIFICATION_STATUS_LABELS,
} from "@/lib/enums";
import type { AppBlock } from "@/lib/app/types";
import type { UserProfile } from "@/lib/ws/types";
import { wsClient } from "@/lib/ws/client";
import { WsEvents } from "@/lib/ws/events";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

const STATUS_VARIANT: Record<
  VerificationStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  [VerificationStatus.UNVERIFIED]: "outline",
  [VerificationStatus.PENDING]: "secondary",
  [VerificationStatus.VERIFIED]: "default",
  [VerificationStatus.REJECTED]: "destructive",
};

export function VerificationBlock({
  user,
  block,
}: {
  user: UserProfile;
  block: AppBlock;
}) {
  const { refreshProfile } = useAuth();
  const status =
    (user.verification?.status as VerificationStatus) ??
    VerificationStatus.UNVERIFIED;
  const [docType, setDocType] = useState(IdDocumentType.PASSPORT);
  const [docFileId, setDocFileId] = useState<string | null>(null);
  const [selfieFileId, setSelfieFileId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{block.title}</CardTitle>
          <Badge variant={STATUS_VARIANT[status] ?? "outline"}>
            {VERIFICATION_STATUS_LABELS[status]}
          </Badge>
        </div>
        <CardDescription>{block.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === VerificationStatus.VERIFIED ? (
          <Alert>
            <AlertDescription>
              Your identity is verified. You have full access to delivery workflows.
            </AlertDescription>
          </Alert>
        ) : status === VerificationStatus.PENDING ? (
          <Alert>
            <AlertDescription>
              Your documents are under review. You will be notified when complete.
            </AlertDescription>
          </Alert>
        ) : status === VerificationStatus.REJECTED ? (
          <Alert variant="destructive">
            <AlertDescription>
              {user.verification?.rejectionReason ??
                "Verification was rejected. Please resubmit."}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <IdDocumentTypeSelect value={docType} onValueChange={setDocType} />
            <FileUploadField
              id="idDocument"
              label="ID document"
              hint="Passport, national ID, or driver's license (PDF or image)"
              required
              module="verification"
              entityType="id_document"
              accept="image/*,application/pdf"
              value={docFileId}
              onValueChange={setDocFileId}
              className="sm:col-span-2"
            />
            <FileUploadField
              id="selfie"
              label="Selfie"
              hint="A clear photo of your face holding your ID"
              required
              module="verification"
              entityType="selfie"
              accept="image/*"
              value={selfieFileId}
              onValueChange={setSelfieFileId}
              className="sm:col-span-2"
            />
            <Button
              className="sm:col-span-2"
              onClick={() => void submit()}
              disabled={submitting || !docFileId || !selfieFileId}
            >
              {submitting ? "Submitting…" : "Submit for verification"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
