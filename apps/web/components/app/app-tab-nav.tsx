"use client";

import {
  Home,
  Luggage,
  Package,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getVisibleTabs,
  type AppTabDef,
  type AppTabId,
} from "@/lib/app/navigation";
import type { UserProfile } from "@/lib/ws/types";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

const TAB_ICONS: Record<AppTabId, LucideIcon> = {
  home: Home,
  travels: Luggage,
  shipments: Package,
  admin: Shield,
};

function TabButton({
  tab,
  active,
  onSelect,
}: {
  tab: AppTabDef;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = TAB_ICONS[tab.id];
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="sm"
      onClick={onSelect}
      className={cn(
        "gap-2 rounded-lg",
        active && "shadow-sm",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="hidden sm:inline">{tab.label}</span>
      <span className="sm:hidden">{tab.shortLabel}</span>
    </Button>
  );
}

export function AppTabNav({
  user,
  activeTab,
}: {
  user: UserProfile;
  activeTab: AppTabId;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabs = getVisibleTabs(user);

  function navigate(tab: AppTabId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    if (tab !== "admin") params.delete("section");
    router.replace(`/app?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="bg-background/95 pt-4 backdrop-blur-sm sm:pt-5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <nav className="flex gap-1 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              onSelect={() => navigate(tab.id)}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}
