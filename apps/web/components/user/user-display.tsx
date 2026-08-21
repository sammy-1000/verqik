"use client";

import { ShieldAlert, ShieldQuestion } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

export type UserDisplayData = {
  firstName: string;
  lastName: string;
  email?: string;
  profilePhotoUrl?: string | null;
  ratingAvg?: string | number;
  ratingCount?: number;
  verification?: { status: string } | null;
};

type UserDisplayProps = {
  user: UserDisplayData;
  showAvatar?: boolean;
  showName?: boolean;
  showEmail?: boolean;
  showVerification?: boolean;
  showRating?: boolean;
  size?: "sm" | "md" | "lg";
  layout?: "horizontal" | "vertical";
  className?: string;
};

const avatarSize = {
  sm: "size-7",
  md: "size-9",
  lg: "size-12",
} as const;

const verifiedIconSize = {
  sm: "size-3",
  md: "size-3.5",
  lg: "size-4",
} as const;

function VerifiedBadgeIcon({
  size,
  className,
}: {
  size: keyof typeof verifiedIconSize;
  className?: string;
}) {
  return (
    <img
      src="/icons/badge.svg"
      alt="Verified"
      title="Verified"
      className={cn("shrink-0 dark:invert", verifiedIconSize[size], className)}
    />
  );
}

function verificationBadge(status: string) {
  switch (status) {
    case "VERIFIED":
      return null;
    case "PENDING":
      return (
        <Badge variant="outline" className="gap-1 font-normal">
          <ShieldQuestion className="size-3" />
          Pending
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="destructive" className="gap-1 font-normal">
          <ShieldAlert className="size-3" />
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="gap-1 font-normal">
          <ShieldAlert className="size-3" />
          Unverified
        </Badge>
      );
  }
}

export function UserDisplay({
  user,
  showAvatar = true,
  showName = true,
  showEmail = false,
  showVerification = false,
  showRating = false,
  size = "md",
  layout = "horizontal",
  className,
}: UserDisplayProps) {
  const initials =
    `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const rating =
    user.ratingCount && Number(user.ratingCount) > 0
      ? `${Number(user.ratingAvg).toFixed(1)} (${user.ratingCount})`
      : null;
  const isVerified = user.verification?.status === "VERIFIED";

  return (
    <div
      className={cn(
        "flex gap-3",
        layout === "vertical" ? "flex-col items-start" : "items-center",
        className,
      )}
    >
      {showAvatar ? (
        <Avatar className={avatarSize[size]}>
          {user.profilePhotoUrl ? (
            <AvatarImage src={user.profilePhotoUrl} alt={fullName} />
          ) : null}
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      ) : null}

      {(showName || showEmail || showVerification || showRating) && (
        <div
          className={cn(
            "min-w-0",
            layout === "vertical" ? "space-y-1" : "flex flex-col gap-0.5",
          )}
        >
          {showName ? (
            <div className="flex min-w-0 items-center gap-1">
              <p
                className={cn(
                  "truncate font-medium",
                  size === "sm" && "text-sm",
                  size === "lg" && "text-base",
                )}
              >
                {fullName}
              </p>
              {showVerification && isVerified ? (
                <VerifiedBadgeIcon size={size} />
              ) : null}
            </div>
          ) : null}
          {!showName && showVerification && isVerified ? (
            <VerifiedBadgeIcon size={size} />
          ) : null}
          {showEmail && user.email ? (
            <p className="text-muted-foreground truncate text-xs">{user.email}</p>
          ) : null}
          {showRating && rating ? (
            <p className="text-muted-foreground text-xs">{rating} rating</p>
          ) : null}
          {showVerification && user.verification && !isVerified
            ? verificationBadge(user.verification.status)
            : null}
        </div>
      )}
    </div>
  );
}
