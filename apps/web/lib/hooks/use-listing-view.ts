"use client";

import { useMemo, useState } from "react";

export type ListingViewMode = "grid" | "list";

export function useListingView(pageSize = 9) {
  const [viewMode, setViewMode] = useState<ListingViewMode>("grid");
  const [page, setPage] = useState(1);

  return {
    viewMode,
    setViewMode,
    page,
    setPage,
    pageSize,
  };
}

export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    total: items.length,
  };
}

export function usePaginatedItems<T>(
  items: T[],
  page: number,
  pageSize: number,
) {
  return useMemo(
    () => paginateItems(items, page, pageSize),
    [items, page, pageSize],
  );
}
