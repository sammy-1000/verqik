"use client";

import { LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";
import type { ListingViewMode } from "@/lib/hooks/use-listing-view";

export function ListingPagination({
  total,
  page,
  totalPages,
  onPageChange,
  className,
}: {
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className,
      )}
    >
      <p className="text-muted-foreground text-sm">
        {total === 0 ? "No results" : `${total} result${total === 1 ? "" : "s"}`}
        {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}
      </p>
      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function ListingToolbar({
  viewMode,
  onViewModeChange,
  total,
  page,
  totalPages,
  onPageChange,
  className,
}: {
  viewMode: ListingViewMode;
  onViewModeChange: (mode: ListingViewMode) => void;
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className,
      )}
    >
      <p className="text-muted-foreground text-sm">
        {total === 0 ? "No results" : `${total} result${total === 1 ? "" : "s"}`}
        {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}
      </p>
      <div className="flex items-center gap-2">
        {totalPages > 1 ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </>
        ) : null}
        <div className="bg-muted flex rounded-lg p-0.5">
          <Button
            type="button"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label="Grid view"
            onClick={() => onViewModeChange("grid")}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            type="button"
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label="List view"
            onClick={() => onViewModeChange("list")}
          >
            <LayoutList className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ListingSkeleton({
  count = 6,
  viewMode = "grid",
}: {
  count?: number;
  viewMode?: ListingViewMode;
}) {
  return (
    <div
      className={
        viewMode === "grid"
          ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          : "space-y-3"
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border-border space-y-3 rounded-xl border p-4"
        >
          <div className="flex gap-3">
            <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
}
