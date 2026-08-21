import type { AppBlockType } from "./types";
import type { UserProfile } from "@/lib/ws/types";
import { isAdminUser } from "./get-app-blocks";

export type AppTabId = "home" | "travels" | "shipments" | "admin";
export type AdminSectionId = "users" | "verifications" | "cities";

export type AppTabDef = {
  id: AppTabId;
  label: string;
  shortLabel: string;
};

export const APP_TABS: AppTabDef[] = [
  { id: "home", label: "Home", shortLabel: "Home" },
  { id: "travels", label: "My Travels", shortLabel: "Travels" },
  { id: "shipments", label: "My Shipments", shortLabel: "Shipments" },
  { id: "admin", label: "Admin", shortLabel: "Admin" },
];

export const ADMIN_SECTIONS: Array<{
  id: AdminSectionId;
  label: string;
  description: string;
}> = [
  {
    id: "users",
    label: "User management",
    description: "Browse accounts, roles, and activity.",
  },
  {
    id: "verifications",
    label: "Verification management",
    description: "Review identity submissions.",
  },
  {
    id: "cities",
    label: "Supported cities",
    description: "Manage airport cities and images.",
  },
];

const HOME_BLOCKS: AppBlockType[] = [
  "welcome",
  "verification-cta",
  "publish-journey-cta",
  "recent-journeys",
];
const TRAVELS_BLOCKS: AppBlockType[] = [
  "create-journey",
  "my-journeys",
  "incoming-requests",
];
const SHIPMENTS_BLOCKS: AppBlockType[] = ["browse-journeys-button", "my-requests"];

const ADMIN_BLOCKS: Record<AdminSectionId, AppBlockType[]> = {
  users: ["admin-users"],
  verifications: ["verification-review"],
  cities: ["cities-management"],
};

export function canSeeTravelsTab(user: UserProfile) {
  return user.profileType === "TRAVELER" || user.profileType === "BOTH";
}

export function canSeeShipmentsTab(user: UserProfile) {
  return user.profileType === "SENDER" || user.profileType === "BOTH";
}

export function getVisibleTabs(user: UserProfile): AppTabDef[] {
  return APP_TABS.filter((tab) => {
    if (tab.id === "travels") return canSeeTravelsTab(user);
    if (tab.id === "shipments") return canSeeShipmentsTab(user);
    if (tab.id === "admin") return isAdminUser(user);
    return true;
  });
}

export function getBlockTypesForTab(
  tab: AppTabId,
  adminSection: AdminSectionId,
): AppBlockType[] {
  if (tab === "home") return HOME_BLOCKS;
  if (tab === "travels") return TRAVELS_BLOCKS;
  if (tab === "shipments") return SHIPMENTS_BLOCKS;
  if (tab === "admin") return ADMIN_BLOCKS[adminSection] ?? [];
  return [];
}

export function defaultTab(user: UserProfile): AppTabId {
  return "home";
}

export function defaultAdminSection(): AdminSectionId {
  return "verifications";
}

export function parseTab(value: string | null, user: UserProfile): AppTabId {
  const visible = new Set(getVisibleTabs(user).map((t) => t.id));
  if (value && visible.has(value as AppTabId)) return value as AppTabId;
  return defaultTab(user);
}

const ADMIN_SECTION_PERMISSIONS: Record<AdminSectionId, string> = {
  users: "users:manage",
  verifications: "verification:review",
  cities: "cities:manage",
};

export function getVisibleAdminSections(user: UserProfile) {
  const permissions = new Set(user.permissions ?? []);
  const adminRole = user.roles?.includes("admin") === true;
  return ADMIN_SECTIONS.filter((section) => {
    const perm = ADMIN_SECTION_PERMISSIONS[section.id];
    return adminRole || permissions.has(perm);
  });
}

export function parseAdminSection(
  value: string | null,
  user: UserProfile,
): AdminSectionId {
  const visible = getVisibleAdminSections(user);
  const ids = new Set(visible.map((s) => s.id));
  if (value && ids.has(value as AdminSectionId)) return value as AdminSectionId;
  return visible[0]?.id ?? defaultAdminSection();
}
