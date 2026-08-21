"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { isAdminUser } from "@/lib/app/get-app-blocks";
import { APP_VERIFICATION_PATH } from "@/lib/app/routes";
import { VerificationStatus } from "@/lib/enums";
import type { UserProfile } from "@/lib/ws/types";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

function ctaCopy(status: VerificationStatus) {
  switch (status) {
    case VerificationStatus.PENDING:
      return {
        title: "We're reviewing your ID",
        description: "Hang tight — most reviews finish within a day.",
        label: "View status",
      };
    case VerificationStatus.REJECTED:
      return {
        title: "One more step to get verified",
        description: "Update your documents and we'll take another look.",
        label: "Resubmit now",
      };
    default:
      return {
        title: "Get verified. Start shipping.",
        description:
          "Verify your identity in minutes and unlock the full Verqik experience.",
        label: "Get verified",
      };
  }
}

export function VerificationCtaBlock({ user }: { user: UserProfile }) {
  const status =
    (user.verification?.status as VerificationStatus) ??
    VerificationStatus.UNVERIFIED;

  if (isAdminUser(user) || status === VerificationStatus.VERIFIED) {
    return null;
  }

  const copy = ctaCopy(status);

  return (
    <section
      className={cn(
        "bg-primary text-primary-foreground mx-auto w-full max-w-6xl rounded-2xl px-6 py-8 sm:px-10 sm:py-10",
      )}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {copy.title}
        </h2>
        <p className="text-primary-foreground/85 text-sm leading-relaxed text-pretty sm:text-base">
          {copy.description}
        </p>
        <Button
          size="lg"
          variant="secondary"
          className="gap-2"
          nativeButton={false}
          render={<Link href={APP_VERIFICATION_PATH} />}
        >
          {copy.label}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </section>
  );
}
