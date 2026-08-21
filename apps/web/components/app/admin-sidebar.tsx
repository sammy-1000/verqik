"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  getVisibleAdminSections,
  type AdminSectionId,
} from "@/lib/app/navigation";
import type { UserProfile } from "@/lib/ws/types";
import { cn } from "@workspace/ui/lib/utils";
import {
  Building2,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

const SECTION_ICONS: Record<AdminSectionId, LucideIcon> = {
  users: Users,
  verifications: ShieldCheck,
  cities: Building2,
};

export function AdminSidebar({
  user,
  active,
}: {
  user: UserProfile;
  active: AdminSectionId;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sections = getVisibleAdminSections(user);

  function navigate(section: AdminSectionId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "admin");
    params.set("section", section);
    router.replace(`/app?${params.toString()}`, { scroll: false });
  }

  return (
    <aside className="w-full shrink-0 lg:w-56">
      <nav className="space-y-1">
        {sections.map((section) => {
          const Icon = SECTION_ICONS[section.id];
          const selected = active === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => navigate(section.id)}
              className={cn(
                "flex w-full flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                selected
                  ? "border-primary/30 bg-primary/5 text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Icon className="size-4 shrink-0" />
                {section.label}
              </span>
              <span className="text-muted-foreground pl-6 text-xs">
                {section.description}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
