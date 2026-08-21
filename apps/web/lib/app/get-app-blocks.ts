import type { AppBlock, AppBlockType } from "./types";
import type { UserProfile } from "@/lib/ws/types";
import {
  getBlockTypesForTab,
  type AdminSectionId,
  type AppTabId,
} from "./navigation";

const ALL_BLOCKS: AppBlock[] = [
  {
    id: "welcome",
    type: "welcome",
    for: ["SENDER", "TRAVELER", "BOTH"],
  },
  {
    id: "verification-review",
    type: "verification-review",
    title: "Verification review queue",
    description: "Review identity submissions and approve or reject applicants.",
    permission: "verification:review",
  },
  {
    id: "admin-users",
    type: "admin-users",
    title: "User management",
    description: "Browse platform accounts and roles.",
    permission: "users:manage",
  },
  {
    id: "cities-management",
    type: "cities-management",
    title: "Supported cities",
    description: "Manage airport cities available for journeys.",
    permission: "cities:manage",
  },
  {
    id: "publish-journey-cta",
    type: "publish-journey-cta",
    for: ["TRAVELER", "BOTH"],
  },
  {
    id: "verification-cta",
    type: "verification-cta",
    for: ["SENDER", "TRAVELER", "BOTH"],
    hideForAdmin: true,
  },
  {
    id: "verification",
    type: "verification",
    title: "Identity verification",
    description: "Verify your account to unlock full platform features.",
    for: ["SENDER", "TRAVELER", "BOTH"],
    hideForAdmin: true,
  },
  {
    id: "recent-journeys",
    type: "recent-journeys",
    for: ["SENDER", "BOTH"],
  },
  {
    id: "journeys-search",
    type: "journeys-search",
    title: "Find a journey",
    description: "Search upcoming routes and send a delivery request.",
    for: ["SENDER", "BOTH"],
  },
  {
    id: "browse-journeys-button",
    type: "browse-journeys-button",
    for: ["SENDER", "BOTH"],
  },
  {
    id: "my-requests",
    type: "my-requests",
    title: "My delivery requests",
    description: "Track packages you have sent with travelers.",
    for: ["SENDER", "BOTH"],
  },
  {
    id: "create-journey",
    type: "create-journey",
    title: "Publish a journey",
    description: "Share your route and available luggage space.",
    for: ["TRAVELER", "BOTH"],
  },
  {
    id: "my-journeys",
    type: "my-journeys",
    title: "My journeys",
    description: "Manage your published routes.",
    for: ["TRAVELER", "BOTH"],
  },
  {
    id: "incoming-requests",
    type: "incoming-requests",
    title: "Incoming requests",
    description: "Review and respond to sender delivery requests.",
    for: ["TRAVELER", "BOTH"],
  },
];

export function getAppBlocks(user: UserProfile) {
  const permissions = new Set(user.permissions ?? []);
  const admin = isAdminUser(user);

  return ALL_BLOCKS.filter((block) => {
    if (block.hideForAdmin && admin) return false;
    if (block.permission) {
      return permissions.has(block.permission);
    }
    return block.for?.includes(user.profileType) ?? false;
  });
}

export function getAppBlocksForTab(
  user: UserProfile,
  tab: AppTabId,
  adminSection: AdminSectionId = "verifications",
) {
  const allowedTypes = new Set(getBlockTypesForTab(tab, adminSection));
  return getAppBlocks(user).filter((block) => allowedTypes.has(block.type));
}

export function getAppBlockByType(
  user: UserProfile,
  type: AppBlockType,
): AppBlock | undefined {
  return getAppBlocks(user).find((block) => block.type === type);
}

export function isAdminUser(user: UserProfile) {
  return (
    user.roles?.includes("admin") ||
    user.permissions?.includes("verification:review") === true
  );
}

export function isVerifiedForTravel(user: UserProfile) {
  if (isAdminUser(user)) return true;
  return user.verification?.status === "VERIFIED";
}
