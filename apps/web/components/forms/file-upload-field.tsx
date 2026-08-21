"use client";

import { useRef, useState } from "react";
import { uploadFile } from "@/lib/files/upload-file";
import { FormField } from "./form-field";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

interface FileUploadFieldProps {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  accept?: string;
  module: string;
  entityType?: string;
  value: string | null;
  onValueChange: (fileId: string | null, fileName?: string) => void;
  className?: string;
}

export function FileUploadField({
  id,
  label,
  hint,
  required,
  accept = "image/*,application/pdf",
  module,
  entityType,
  value,
  onValueChange,
  className,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setFileName(file.name);

    try {
      const result = await uploadFile(file, { module, entityType });
      onValueChange(result.fileId, result.fileName);
    } catch (err) {
      setFileName(null);
      onValueChange(null);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function clear() {
    setFileName(null);
    setError(null);
    onValueChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const displayName = fileName ?? (value ? "Uploaded" : null);

  return (
    <FormField
      label={label}
      htmlFor={id}
      required={required}
      hint={hint}
      className={className}
    >
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          disabled={uploading}
          onChange={(e) => void handleFileChange(e)}
          className="flex-1"
        />
        {value ? (
          <Button type="button" variant="outline" onClick={clear} disabled={uploading}>
            Clear
          </Button>
        ) : null}
      </div>
      {uploading ? (
        <p className="text-muted-foreground text-xs">Uploading…</p>
      ) : displayName ? (
        <p className="text-muted-foreground text-xs">{displayName} ready</p>
      ) : null}
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </FormField>
  );
}
