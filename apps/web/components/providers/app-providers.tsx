"use client";

import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@workspace/ui/components/sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster richColors closeButton position="top-right" />
    </AuthProvider>
  );
}
