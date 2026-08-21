"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FileText, Loader2, Upload, X, ZoomIn } from "lucide-react";
import { uploadFile } from "@/lib/files/upload-file";
import { FormField } from "./form-field";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { cn } from "@workspace/ui/lib/utils";

interface DocumentUploadFieldProps {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  accept?: string;
  module: string;
  entityType?: string;
  value: string | null;
  onValueChange: (fileId: string | null, fileName?: string) => void;
  dropLabel?: string;
  dropHint?: string;
  className?: string;
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

export function DocumentUploadField({
  id,
  label,
  hint,
  required,
  accept = "image/*,application/pdf",
  module,
  entityType,
  value,
  onValueChange,
  dropLabel = "Drag & drop your file here",
  dropHint = "or click to browse · JPG, PNG, or PDF",
  className,
}: DocumentUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropId = useId();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isPdf, setIsPdf] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function clear() {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setFileName(null);
    setPreviewUrl(null);
    setIsPdf(false);
    setError(null);
    onValueChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    setFileName(file.name);
    setIsPdf(file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    if (isImageFile(file)) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }

    try {
      const result = await uploadFile(file, { module, entityType });
      onValueChange(result.fileId, result.fileName);
    } catch (err) {
      clear();
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    void handleFile(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  const hasFile = Boolean(value);

  return (
    <>
      <FormField
        label={label}
        htmlFor={id}
        required={required}
        hint={hint}
        className={className}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={uploading}
          onChange={handleInputChange}
        />

        {!hasFile ? (
          <div
            role="button"
            tabIndex={0}
            aria-labelledby={dropId}
            aria-disabled={uploading}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !uploading) {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              if (!uploading) setDragActive(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (!uploading) setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragActive(false);
              }
            }}
            onDrop={handleDrop}
            onClick={() => !uploading && inputRef.current?.click()}
            className={cn(
              "border-border bg-muted/20 relative rounded-xl border-2 border-dashed p-5 transition-colors sm:p-6",
              !uploading && "hover:bg-muted/35 cursor-pointer",
              dragActive && "border-primary bg-primary/5 ring-primary/20 ring-2",
              uploading && "opacity-80",
            )}
          >
            <div
              id={dropId}
              className="pointer-events-none flex flex-col items-center gap-2 text-center"
            >
              <div className="bg-background flex size-11 items-center justify-center rounded-full border shadow-sm">
                {uploading ? (
                  <Loader2 className="text-muted-foreground size-5 animate-spin" />
                ) : dragActive ? (
                  <Upload className="text-primary size-5" />
                ) : (
                  <Upload className="text-muted-foreground size-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {uploading ? "Uploading…" : dragActive ? "Drop file here" : dropLabel}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">{dropHint}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-border bg-muted/20 relative overflow-hidden rounded-xl border">
            <div className="flex items-stretch gap-0 sm:gap-4">
              <button
                type="button"
                className="bg-muted/40 relative flex aspect-[4/3] w-full max-w-[140px] shrink-0 items-center justify-center sm:max-w-[160px]"
                onClick={() => previewUrl && setPreviewOpen(true)}
                disabled={!previewUrl}
              >
                {previewUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt={fileName ?? "Uploaded document"}
                      className="size-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity hover:bg-black/25 hover:opacity-100">
                      <ZoomIn className="size-5 text-white drop-shadow" />
                    </span>
                  </>
                ) : (
                  <FileText className="text-muted-foreground size-10" />
                )}
              </button>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-4">
                <p className="truncate text-sm font-medium">{fileName ?? "Uploaded"}</p>
                <p className="text-muted-foreground text-xs">
                  {isPdf ? "PDF document" : "Image"} · Ready to submit
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 w-fit"
                  onClick={clear}
                  disabled={uploading}
                >
                  Replace file
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-2 right-2"
                onClick={clear}
                disabled={uploading}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {error ? <p className="text-destructive mt-2 text-xs">{error}</p> : null}
      </FormField>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl gap-3 p-3 sm:p-4" showCloseButton>
          <DialogHeader className="sr-only">
            <DialogTitle>{fileName ?? "Document preview"}</DialogTitle>
            <DialogDescription>Uploaded document preview</DialogDescription>
          </DialogHeader>
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={fileName ?? "Document"}
              className="max-h-[70vh] w-full rounded-lg object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
