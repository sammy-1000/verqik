"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { VerificationApplicationForm } from "@/components/verification/verification-application-form";
import { VerificationStatusCards } from "@/components/verification/verification-status-cards";
import { APP_HOME_PATH } from "@/lib/app/routes";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function VerificationPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground -ml-2 mb-2 gap-1.5"
            nativeButton={false}
            render={<Link href={APP_HOME_PATH} />}
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">Verification</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Confirm your identity to ship and travel with confidence.
          </p>
        </div>
      </div>

      <VerificationStatusCards user={user} />
      <VerificationApplicationForm user={user} />
    </div>
  );
}
