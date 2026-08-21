"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { CountryPicker } from "@/components/forms/country-picker";
import { FormField } from "@/components/forms/form-field";
import { ProfileAvatarPicker } from "@/components/user/profile-avatar-picker";
import { UserDisplay } from "@/components/user/user-display";
import { APP_HOME_PATH } from "@/lib/app/routes";
import { wsClient } from "@/lib/ws/client";
import { WsEvents } from "@/lib/ws/events";
import type { UserProfile } from "@/lib/ws/types";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [profilePhotoFileId, setProfilePhotoFileId] = useState<string | null>(null);
  const [profilePhotoPreviewUrl, setProfilePhotoPreviewUrl] = useState<string | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setCountryCode(user.countryCode ?? null);
  }, [user]);

  if (!user) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  async function save() {
    setSaving(true);
    try {
      await wsClient.rpc<UserProfile>(WsEvents.USERS_ME_UPDATE, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        countryCode: countryCode ?? undefined,
        ...(profilePhotoFileId ? { profilePhotoFileId } : {}),
      });
      toast.success("Profile updated");
      router.push(APP_HOME_PATH);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  const previewUser = {
    ...user,
    firstName: firstName || user.firstName,
    lastName: lastName || user.lastName,
    profilePhotoUrl: profilePhotoPreviewUrl ?? user.profilePhotoUrl,
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Edit profile
        </h1>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <ProfileAvatarPicker
            firstName={firstName || user.firstName}
            lastName={lastName || user.lastName}
            photoUrl={user.profilePhotoUrl}
            onPhotoChange={(fileId, previewUrl) => {
              setProfilePhotoFileId(fileId);
              setProfilePhotoPreviewUrl(previewUrl);
            }}
          />
          <UserDisplay
            user={previewUser}
            showAvatar={false}
            showName
            showEmail
            showVerification
            size="md"
            layout="vertical"
            className="items-center text-center"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="First name" htmlFor="profileFirstName" required>
              <Input
                id="profileFirstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </FormField>
            <FormField label="Last name" htmlFor="profileLastName" required>
              <Input
                id="profileLastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </FormField>
          </div>
          <CountryPicker
            value={countryCode ?? ""}
            onValueChange={(code) => setCountryCode(code || null)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="button" disabled={saving} onClick={() => void save()}>
          <Save className="size-4" />
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
