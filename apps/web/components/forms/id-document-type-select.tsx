"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  ID_DOCUMENT_TYPE_OPTIONS,
  IdDocumentType,
  isIdDocumentType,
} from "@/lib/enums";
import { FormField } from "./form-field";

interface IdDocumentTypeSelectProps {
  value: IdDocumentType;
  onValueChange: (value: IdDocumentType) => void;
}

export function IdDocumentTypeSelect({
  value,
  onValueChange,
}: IdDocumentTypeSelectProps) {
  return (
    <FormField label="Document type" htmlFor="docType" required>
      <Select
        value={value}
        onValueChange={(v) => {
          if (v && isIdDocumentType(v)) onValueChange(v);
        }}
      >
        <SelectTrigger id="docType" className="w-full">
          <SelectValue placeholder="Select document type" />
        </SelectTrigger>
        <SelectContent>
          {ID_DOCUMENT_TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
