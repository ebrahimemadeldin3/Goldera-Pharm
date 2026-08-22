"use client";

import React from "react";
import Pagination from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";

interface ResultsFooterProps {
  page: number;
  limit: number;
  totalCount: number;
  className?: string;
}

export function ResultsFooter({
  page,
  limit,
  totalCount,
  className,
}: ResultsFooterProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const startItem = totalCount > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, totalCount);

  return (
    <footer
      className={cn(
        "mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4 text-xs text-slate-500",
        className
      )}
    >
      <div>
        Showing <strong className="font-semibold text-slate-900">{startItem}–{endItem}</strong> of{" "}
        <strong className="font-semibold text-slate-900">{totalCount}</strong> items
      </div>

      {totalPages > 1 && (
        <Pagination
          page={page}
          limit={limit}
          totalCount={totalCount}
        />
      )}
    </footer>
  );
}
