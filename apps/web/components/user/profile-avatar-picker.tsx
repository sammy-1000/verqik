"use client";

import { useRef, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { uploadFile } from "@/lib/files/upload-file";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

interface ProfileAvatarPickerProps {
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  onPhotoChange: (fileId: string | null, previewUrl: string | null) => void;
  size?: "md" | "lg";
  className?: string;
}

export function ProfileAvatarPicker({
  firstName,
  lastName,
  photoUrl,
  onPhotoChange,
  size = "lg",
  className,
}: ProfileAvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initials =
    `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
  const displayUrl = previewUrl ?? photoUrl ?? null;
  const avatarClass = size === "lg" ? "size-24" : "size-16";

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const result = await uploadFile(file, {
        module: "users",
        entityType: "profile",
      });
      onPhotoChange(result.fileId, localPreview);
    } catch (err) {
      setPreviewUrl(null);
      onPhotoChange(null, null);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative inline-flex pt-3">
        <Avatar className={avatarClass}>
          {displayUrl ? (
            <AvatarImage src={displayUrl} alt={`${firstName} ${lastName}`} />
          ) : null}
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>

        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          disabled={uploading}
          className="border-background absolute top-0 left-1/2 size-8 -translate-x-1/2 rounded-full border-2 shadow-sm"
          onClick={() => inputRef.current?.click()}
          aria-label={uploading ? "Uploading profile photo" : "Change profile photo"}
        >
          {uploading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Pencil className="size-3.5" />
          )}
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => void handleFileChange(e)}
        />
      </div>

      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
