"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { AppHeader } from "@/components/app/app-header";
import { ShellFooter } from "@/components/app/shell-footer";
import { Skeleton } from "@workspace/ui/components/skeleton";

function AuthGuardSkeleton() {
  return (
    <div className="bg-background flex min-h-svh flex-col">
      <div className="border-border/60 h-16 shrink-0 border-b" />
      <div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8 sm:px-6">
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
      <ShellFooter />
    </div>
  );
}

function AppAuthGuardContent({
  children,
  showTabNav,
}: {
  children: React.ReactNode;
  showTabNav?: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <AuthGuardSkeleton />;
  }

  return (
    <div className="bg-background flex min-h-svh flex-col">
      <AppHeader user={user} />
      {showTabNav}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
      <ShellFooter />
    </div>
  );
}

export function AppAuthGuard({
  children,
  showTabNav,
}: {
  children: React.ReactNode;
  showTabNav?: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AuthGuardSkeleton />}>
      <AppAuthGuardContent showTabNav={showTabNav}>{children}</AppAuthGuardContent>
    </Suspense>
  );
}
