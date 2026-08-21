import type { UserProfile } from "@/lib/ws/types";

export type AppBlockType =
  | "welcome"
  | "verification-cta"
  | "publish-journey-cta"
  | "my-travels-preview"
  | "verification"
  | "verification-review"
  | "admin-users"
  | "cities-management"
  | "journeys-search"
  | "recent-journeys"
  | "browse-journeys-button"
  | "my-requests"
  | "create-journey"
  | "my-journeys"
  | "incoming-requests";

export interface AppBlock {
  id: string;
  type: AppBlockType;
  title?: string;
  description?: string;
  /** Which profile types see this block */
  for?: Array<"SENDER" | "TRAVELER" | "BOTH">;
  /** RBAC permission required to see this block */
  permission?: string;
  /** Hide for system admins (e.g. identity submission not required) */
  hideForAdmin?: boolean;
}

export interface AppBlockContext {
  user: UserProfile;
}
