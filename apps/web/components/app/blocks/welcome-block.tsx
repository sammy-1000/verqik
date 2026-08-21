"use client";

import { isAdminUser } from "@/lib/app/get-app-blocks";
import type { UserProfile } from "@/lib/ws/types";

function welcomeSubtitle(user: UserProfile) {
  if (isAdminUser(user)) {
    return "Manage the platform or jump into your next delivery.";
  }
  switch (user.profileType) {
    case "SENDER":
      return "Ready to ship something today?";
    case "TRAVELER":
      return "Ready to share your route today?";
    case "BOTH":
      return "Ready to ship something or share your route today?";
    default:
      return "Welcome back.";
  }
}

export function WelcomeBlock({ user }: { user: UserProfile }) {
  return (
    <div className="space-y-2 py-2">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Welcome, {user.firstName}
      </h1>
      <p className="text-muted-foreground text-lg sm:text-xl">
        {welcomeSubtitle(user)}
      </p>
    </div>
  );
}
