"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import type { AppBlock } from "@/lib/app/types";

export function AdminUsersBlock({ block }: { block: AppBlock }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{block.title}</CardTitle>
        <CardDescription>{block.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="border-border flex items-center gap-3 rounded-lg border p-3"
            >
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
        <p className="text-muted-foreground text-sm">
          Full user directory (search, roles, suspend) is planned next. Verification
          and cities management are available in the other admin sections.
        </p>
      </CardContent>
    </Card>
  );
}
