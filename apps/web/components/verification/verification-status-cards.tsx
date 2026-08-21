"use client";

import {
  BadgeCheck,
  Clock3,
  FileUp,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import {
  VerificationStatus,
  VERIFICATION_STATUS_LABELS,
} from "@/lib/enums";
import type { UserProfile } from "@/lib/ws/types";
import { cn } from "@workspace/ui/lib/utils";

type StepState = "complete" | "current" | "upcoming" | "error";

function resolveStatus(user: UserProfile): VerificationStatus {
  return (
    (user.verification?.status as VerificationStatus) ??
    VerificationStatus.UNVERIFIED
  );
}

function stepState(
  step: "account" | "submit" | "review" | "verified",
  status: VerificationStatus,
): StepState {
  if (step === "account") return "complete";

  if (status === VerificationStatus.VERIFIED) {
    return step === "verified" ? "complete" : "complete";
  }

  if (status === VerificationStatus.PENDING) {
    if (step === "submit") return "complete";
    if (step === "review") return "current";
    return "upcoming";
  }

  if (status === VerificationStatus.REJECTED) {
    if (step === "submit") return "error";
    if (step === "review") return "error";
    return "upcoming";
  }

  if (step === "submit") return "current";
  return "upcoming";
}

const STEP_META = [
  {
    id: "account" as const,
    title: "Account ready",
    description: "Your profile is set up",
    icon: UserCheck,
  },
  {
    id: "submit" as const,
    title: "Submit documents",
    description: "ID and a quick selfie",
    icon: FileUp,
  },
  {
    id: "review" as const,
    title: "Team review",
    description: "Usually under 24 hours",
    icon: Clock3,
  },
  {
    id: "verified" as const,
    title: "You're verified",
    description: "Full access unlocked",
    icon: BadgeCheck,
  },
];

const stateStyles: Record<StepState, string> = {
  complete:
    "border-primary/20 bg-primary/5 [&_.step-icon]:bg-primary [&_.step-icon]:text-primary-foreground",
  current:
    "border-primary bg-primary/10 ring-primary/20 ring-2 [&_.step-icon]:bg-primary [&_.step-icon]:text-primary-foreground",
  upcoming: "border-border bg-card [&_.step-icon]:bg-muted [&_.step-icon]:text-muted-foreground",
  error:
    "border-destructive/30 bg-destructive/5 [&_.step-icon]:bg-destructive [&_.step-icon]:text-white",
};

export function VerificationStatusCards({ user }: { user: UserProfile }) {
  const status = resolveStatus(user);

  const headline = {
    [VerificationStatus.UNVERIFIED]: {
      icon: ShieldAlert,
      title: "Verification required",
      description: "Submit your ID to unlock deliveries and journeys.",
    },
    [VerificationStatus.PENDING]: {
      icon: Clock3,
      title: "Under review",
      description: "We're checking your documents. We'll notify you when done.",
    },
    [VerificationStatus.VERIFIED]: {
      icon: ShieldCheck,
      title: "You're verified",
      description: "Your identity is confirmed. You're good to go.",
    },
    [VerificationStatus.REJECTED]: {
      icon: ShieldAlert,
      title: "Action needed",
      description:
        user.verification?.rejectionReason ??
        "Your submission couldn't be approved. Please try again.",
    },
  }[status];

  const HeadlineIcon = headline.icon;

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "rounded-2xl border p-6 sm:p-8",
          status === VerificationStatus.VERIFIED
            ? "border-primary/20 bg-primary/5"
            : status === VerificationStatus.REJECTED
              ? "border-destructive/20 bg-destructive/5"
              : "border-border bg-card",
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl",
              status === VerificationStatus.VERIFIED
                ? "bg-primary text-primary-foreground"
                : status === VerificationStatus.REJECTED
                  ? "bg-destructive text-white"
                  : "bg-muted text-foreground",
            )}
          >
            <HeadlineIcon className="size-6" />
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              {VERIFICATION_STATUS_LABELS[status]}
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">{headline.title}</h2>
            <p className="text-muted-foreground max-w-xl text-sm leading-relaxed sm:text-base">
              {headline.description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEP_META.map((step) => {
          const state = stepState(step.id, status);
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                stateStyles[state],
              )}
            >
              <div className="step-icon mb-3 flex size-9 items-center justify-center rounded-lg">
                <Icon className="size-4" />
              </div>
              <p className="text-sm font-medium">{step.title}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">{step.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
