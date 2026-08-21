"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { AppHeader } from "@/components/app/app-header";
import { AppTabNav } from "@/components/app/app-tab-nav";
import { ShellFooter } from "@/components/app/shell-footer";
import { AdminSidebar } from "@/components/app/admin-sidebar";
import { AppBlockRenderer } from "@/components/app/app-block-renderer";
import { getAppBlocksForTab } from "@/lib/app/get-app-blocks";
import {
  parseAdminSection,
  parseTab,
  type AdminSectionId,
} from "@/lib/app/navigation";
import { Skeleton } from "@workspace/ui/components/skeleton";

function AppShellSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

function AppShellContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="bg-background flex min-h-svh flex-col">
        <div className="border-border/60 h-16 shrink-0 border-b" />
        <div className="border-border/60 h-12 shrink-0 border-b" />
        <div className="flex-1">
          <AppShellSkeleton />
        </div>
        <ShellFooter />
      </div>
    );
  }

  const activeTab = parseTab(searchParams.get("tab"), user);
  const adminSection = parseAdminSection(searchParams.get("section"), user);
  const blocks = getAppBlocksForTab(user, activeTab, adminSection);

  return (
    <div className="bg-background flex min-h-svh flex-col">
      <AppHeader user={user} />
      <AppTabNav user={user} activeTab={activeTab} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {activeTab === "admin" ? (
          <AdminTabLayout
            user={user}
            section={adminSection}
            blocks={blocks}
          />
        ) : (
          <TabPanel blocks={blocks} user={user} />
        )}
      </main>
      <ShellFooter />
    </div>
  );
}

function TabPanel({
  blocks,
  user,
}: {
  blocks: ReturnType<typeof getAppBlocksForTab>;
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
}) {
  if (blocks.length === 0) {
    return (
      <div className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
        Nothing to show in this section for your account type.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {blocks.map((block) => (
        <AppBlockRenderer key={block.id} block={block} user={user} />
      ))}
    </div>
  );
}

function AdminTabLayout({
  user,
  section,
  blocks,
}: {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  section: AdminSectionId;
  blocks: ReturnType<typeof getAppBlocksForTab>;
}) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <AdminSidebar user={user} active={section} />
      <div className="min-w-0 flex-1 space-y-6">
        {blocks.length === 0 ? (
          <div className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
            You don&apos;t have permission to view this admin section.
          </div>
        ) : (
          blocks.map((block) => (
            <AppBlockRenderer key={block.id} block={block} user={user} />
          ))
        )}
      </div>
    </div>
  );
}

export function AppShell() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex min-h-svh flex-col">
          <div className="flex-1">
            <AppShellSkeleton />
          </div>
          <ShellFooter />
        </div>
      }
    >
      <AppShellContent />
    </Suspense>
  );
}
