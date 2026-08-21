"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Loader2, Upload, X, ZoomIn } from "lucide-react";
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

export interface UploadedImage {
  fileId: string;
  fileName: string;
  previewUrl: string;
}

interface MultiImageUploadFieldProps {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  maxFiles?: number;
  module: string;
  entityType?: string;
  value: UploadedImage[];
  onValueChange: (files: UploadedImage[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  className?: string;
}

type LocalImage = {
  localKey: string;
  fileId: string;
  fileName: string;
  previewUrl: string;
  uploading?: boolean;
  error?: string;
};

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function toUploaded(item: LocalImage): UploadedImage {
  return {
    fileId: item.fileId,
    fileName: item.fileName,
    previewUrl: item.previewUrl,
  };
}

function completedItems(items: LocalImage[]) {
  return items
    .filter((item) => item.fileId && !item.uploading && !item.error)
    .map(toUploaded);
}

export function MultiImageUploadField({
  id,
  label,
  hint,
  required,
  maxFiles = 5,
  module,
  entityType,
  value,
  onValueChange,
  onUploadingChange,
  className,
}: MultiImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropId = useId();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<UploadedImage | null>(null);
  const [items, setItems] = useState<LocalImage[]>(() =>
    value.map((item) => ({ ...item, localKey: item.fileId })),
  );

  const revokePreview = (previewUrl: string) => {
    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  const completedCount = items.filter(
    (item) => item.fileId && !item.uploading && !item.error,
  ).length;
  const isUploading = items.some((item) => item.uploading);
  const canAddMore = completedCount < maxFiles && !isUploading;

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  const onValueChangeRef = useRef(onValueChange);
  onValueChangeRef.current = onValueChange;

  useEffect(() => {
    onValueChangeRef.current(completedItems(items));
  }, [items]);

  async function uploadOne(file: File, localKey: string, previewUrl: string) {
    try {
      const result = await uploadFile(file, { module, entityType });

      setItems((current) =>
        current.map((item) =>
          item.localKey === localKey
            ? {
                localKey,
                fileId: result.fileId,
                fileName: result.fileName,
                previewUrl,
                uploading: false,
              }
            : item,
        ),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setItems((current) =>
        current.map((item) =>
          item.localKey === localKey
            ? { ...item, uploading: false, error: message }
            : item,
        ),
      );
      setError(message);
    }
  }

  function queueFiles(selected: File[]) {
    const remaining = maxFiles - completedCount;
    if (remaining <= 0) {
      setError(`Maximum ${maxFiles} photos`);
      return;
    }

    const imageFiles = selected.filter(isImageFile);
    if (imageFiles.length === 0) {
      setError("Please choose image files only");
      return;
    }

    if (imageFiles.length < selected.length) {
      setError("Some files were skipped — only images are allowed");
    } else {
      setError(null);
    }

    const files = imageFiles.slice(0, remaining);
    const queued: LocalImage[] = files.map((file) => ({
      localKey: crypto.randomUUID(),
      fileId: "",
      fileName: file.name,
      previewUrl: URL.createObjectURL(file),
      uploading: true,
    }));

    setItems((current) => [...current, ...queued]);
    files.forEach((file, index) => {
      const entry = queued[index]!;
      void uploadOne(file, entry.localKey, entry.previewUrl);
    });
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    queueFiles(Array.from(e.target.files));
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!canAddMore) return;
    queueFiles(Array.from(e.dataTransfer.files));
  }

  function removeAt(index: number) {
    const target = items[index];
    if (!target) return;

    revokePreview(target.previewUrl);
    setItems((current) => current.filter((_, i) => i !== index));
  }

  return (
    <>
      <FormField
        label={label}
        htmlFor={id}
        required={required}
        hint={hint ?? `Drag and drop up to ${maxFiles} photos, or click to browse`}
        className={className}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={!canAddMore}
          onChange={handleInputChange}
        />

        <div
          role="button"
          tabIndex={0}
          aria-labelledby={dropId}
          aria-disabled={!canAddMore}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && canAddMore) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            if (canAddMore) setDragActive(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (canAddMore) setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setDragActive(false);
            }
          }}
          onDrop={handleDrop}
          onClick={() => canAddMore && inputRef.current?.click()}
          className={cn(
            "border-border bg-muted/20 relative rounded-xl border-2 border-dashed p-4 transition-colors sm:p-6",
            canAddMore && "hover:bg-muted/35 cursor-pointer",
            dragActive && "border-primary bg-primary/5 ring-primary/20 ring-2",
            !canAddMore && "opacity-70",
          )}
        >
          <div
            id={dropId}
            className="pointer-events-none flex flex-col items-center gap-2 text-center"
          >
            <div className="bg-background flex size-11 items-center justify-center rounded-full border shadow-sm">
              {isUploading ? (
                <Loader2 className="text-muted-foreground size-5 animate-spin" />
              ) : dragActive ? (
                <Upload className="text-primary size-5" />
              ) : (
                <ImagePlus className="text-muted-foreground size-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {dragActive ? "Drop photos here" : "Drag & drop package photos"}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                or click to browse · {completedCount}/{maxFiles} added
              </p>
            </div>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item, index) => (
              <div
                key={item.localKey}
                className="group border-border bg-muted/30 relative aspect-square overflow-hidden rounded-lg border"
              >
                <button
                  type="button"
                  className="relative size-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!item.uploading && !item.error) {
                      setPreviewImage(toUploaded(item));
                    }
                  }}
                  disabled={Boolean(item.uploading || item.error)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt={item.fileName}
                    className="size-full object-cover transition-transform group-hover:scale-105"
                  />
                  {!item.uploading && !item.error ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/25 group-hover:opacity-100">
                      <ZoomIn className="size-6 text-white drop-shadow" />
                    </span>
                  ) : null}
                  {item.uploading ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 className="size-6 animate-spin text-white" />
                    </span>
                  ) : null}
                  {item.error ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-destructive/80 p-2 text-center text-[10px] text-white">
                      Failed
                    </span>
                  ) : null}
                </button>

                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  className="absolute top-1.5 right-1.5 size-7 rounded-full opacity-100 shadow-sm sm:opacity-0 sm:group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAt(index);
                  }}
                >
                  <X className="size-3.5" />
                </Button>

                <p className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 text-[10px] text-white">
                  {item.fileName}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {error ? <p className="text-destructive mt-2 text-xs">{error}</p> : null}
      </FormField>

      <Dialog
        open={previewImage !== null}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent className="max-w-3xl gap-3 p-3 sm:p-4" showCloseButton>
          <DialogHeader className="sr-only">
            <DialogTitle>{previewImage?.fileName ?? "Photo preview"}</DialogTitle>
            <DialogDescription>Full-size package photo preview</DialogDescription>
          </DialogHeader>
          {previewImage ? (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage.previewUrl}
                alt={previewImage.fileName}
                className="max-h-[70vh] w-full rounded-lg object-contain"
              />
              <p className="text-muted-foreground truncate text-center text-sm">
                {previewImage.fileName}
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
