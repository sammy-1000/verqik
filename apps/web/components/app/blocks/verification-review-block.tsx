"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import type { AppBlock } from "@/lib/app/types";
import { ID_DOCUMENT_TYPE_OPTIONS } from "@/lib/enums";
import { wsClient } from "@/lib/ws/client";
import { WsEvents } from "@/lib/ws/events";
import type {
  AdminVerificationDetail,
  AdminVerificationRecord,
} from "@/lib/ws/types";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Textarea } from "@workspace/ui/components/textarea";

function documentTypeLabel(value?: string | null) {
  return (
    ID_DOCUMENT_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
    value ??
    "Unknown"
  );
}

export function VerificationReviewBlock({ block }: { block: AppBlock }) {
  const [queue, setQueue] = useState<AdminVerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminVerificationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [acting, setActing] = useState(false);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const items = await wsClient.rpc<AdminVerificationRecord[]>(
        WsEvents.ADMIN_VERIFICATIONS_LIST,
      );
      setQueue(items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  async function openDetail(verificationId: string) {
    setSelectedId(verificationId);
    setDetail(null);
    setDetailLoading(true);
    try {
      const data = await wsClient.rpc<AdminVerificationDetail>(
        WsEvents.ADMIN_VERIFICATIONS_GET,
        { verificationId },
      );
      setDetail(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load application");
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setSelectedId(null);
    setDetail(null);
    setRejectOpen(false);
    setRejectReason("");
  }

  async function approve(verificationId: string) {
    setActing(true);
    try {
      await wsClient.rpc(WsEvents.ADMIN_VERIFICATIONS_APPROVE, { verificationId });
      toast.success("Applicant verified");
      closeDetail();
      await loadQueue();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setActing(false);
    }
  }

  async function reject(verificationId: string) {
    if (rejectReason.trim().length < 3) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setActing(true);
    try {
      await wsClient.rpc(WsEvents.ADMIN_VERIFICATIONS_REJECT, {
        verificationId,
        rejectionReason: rejectReason.trim(),
      });
      toast.success("Application rejected");
      closeDetail();
      await loadQueue();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rejection failed");
    } finally {
      setActing(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{block.title}</CardTitle>
            <Badge variant="secondary">{queue.length} pending</Badge>
          </div>
          <CardDescription>{block.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading queue…</p>
          ) : queue.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No pending verification applications.
            </p>
          ) : (
            <div className="divide-border divide-y rounded-lg border">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {item.user.firstName} {item.user.lastName}
                    </p>
                    <p className="text-muted-foreground text-sm">{item.user.email}</p>
                    <p className="text-muted-foreground text-xs">
                      {documentTypeLabel(item.idDocumentType)} · submitted{" "}
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => void openDetail(item.id)}
                  >
                    Review
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={selectedId != null} onOpenChange={(open) => !open && closeDetail()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review verification</DialogTitle>
            <DialogDescription>
              Inspect uploaded documents and approve or reject this application.
            </DialogDescription>
          </DialogHeader>

          {detailLoading || !detail ? (
            <p className="text-muted-foreground text-sm">Loading application…</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="font-medium">
                  {detail.user.firstName} {detail.user.lastName}
                </p>
                <p className="text-muted-foreground text-sm">{detail.user.email}</p>
                <p className="text-muted-foreground text-sm">
                  Document type: {documentTypeLabel(detail.idDocumentType)}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DocumentPreview
                  label="ID document"
                  url={detail.documents.idDocument.url}
                  mimeType={detail.documents.idDocument.mimeType}
                  fileName={detail.documents.idDocument.originalName}
                />
                <DocumentPreview
                  label="Selfie"
                  url={detail.documents.selfie.url}
                  mimeType={detail.documents.selfie.mimeType}
                  fileName={detail.documents.selfie.originalName}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="outline" onClick={closeDetail} disabled={acting}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                disabled={acting || !detail}
                onClick={() => setRejectOpen(true)}
              >
                Reject
              </Button>
              <Button
                disabled={acting || !detail}
                onClick={() => detail && void approve(detail.id)}
              >
                Approve
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject application</DialogTitle>
            <DialogDescription>
              Provide a reason the applicant will see so they can resubmit.
            </DialogDescription>
          </DialogHeader>
          <FormField label="Rejection reason" htmlFor="rejectReason" required>
            <Textarea
              id="rejectReason"
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Document is blurry, name does not match, etc."
            />
          </FormField>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={acting || !detail}
              onClick={() => detail && void reject(detail.id)}
            >
              Confirm rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DocumentPreview({
  label,
  url,
  mimeType,
  fileName,
}: {
  label: string;
  url: string;
  mimeType: string;
  fileName: string;
}) {
  const isImage = mimeType.startsWith("image/");

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="bg-muted/40 overflow-hidden rounded-lg border">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={fileName} className="max-h-64 w-full object-contain" />
        ) : (
          <div className="text-muted-foreground flex h-40 flex-col items-center justify-center gap-2 p-4 text-sm">
            <span>{fileName}</span>
            <a href={url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              Open document
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
