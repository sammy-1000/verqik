"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  PROFILE_TYPE_OPTIONS,
  UserProfileType,
  isUserProfileType,
} from "@/lib/enums";
import { FormField } from "./form-field";

interface ProfileTypeSelectProps {
  value: UserProfileType;
  onValueChange: (value: UserProfileType) => void;
}

export function ProfileTypeSelect({
  value,
  onValueChange,
}: ProfileTypeSelectProps) {
  return (
    <FormField
      label="I am a…"
      htmlFor="profileType"
      required
      hint="Choose how you will use Verqik"
    >
      <Select
        value={value}
        onValueChange={(v) => {
          if (v && isUserProfileType(v)) onValueChange(v);
        }}
      >
        <SelectTrigger id="profileType" className="w-full">
          <SelectValue placeholder="Choose role" />
        </SelectTrigger>
        <SelectContent>
          {PROFILE_TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label} — {option.description}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
