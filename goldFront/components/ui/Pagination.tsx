"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef } from "react";

interface PaginationProps {
  page?: number;
  limit?: number;
  totalCount?: number;
}

export default function Pagination({ page = 1, limit = 10, totalCount = 0 }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rootRef = useRef<HTMLDivElement | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  function pushPage(newPage: number) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", String(newPage));
    params.set("limit", String(limit));
    router.push(`${window.location.pathname}?${params.toString()}`);
  }

  // Always render a minimal pagination UI so it's visible for testing.
  // Controls will be disabled when there's only one page.

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);
  // Ensure unique and sorted pages to avoid duplicate buttons
  const uniquePages = Array.from(new Set(pages)).sort((a, b) => a - b);

  // Debugging: log pagination internals to help diagnose duplicate renders
  // Remove or guard this in production if noisy
  
  // If multiple Pagination instances are accidentally rendered for the same
  // list (e.g. hydration mismatch or duplicate mounting), remove extras
  // within the same nearest section to avoid showing duplicated buttons.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const container = (root.closest && root.closest('section')) || document.body;
    const nodes = Array.from(container.querySelectorAll('[data-pagination-root]'));
    if (nodes.length > 1) {
      // Keep first node only
      const first = nodes[0];
      nodes.forEach((n) => {
        if (n !== first) n.remove();
      });
    }
  }, []);

  const startItem = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(totalCount, page * limit);

  return (
    <>
    <div ref={rootRef} data-pagination-root className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-center">
      <div className="text-sm text-secondary-dark">
        Page {page} of {totalPages} • Showing {startItem}-{endItem} of {totalCount}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
      <button
        className="rounded-md px-3 py-1 text-sm"
        onClick={() => pushPage(Math.max(1, page - 1))}
        disabled={page <= 1}
      >
        Prev
      </button>
        {uniquePages.map((p) => (
          <button
            key={p}
            data-page={p}
            className={`rounded-md px-3 py-1 text-sm ${p === page ? "bg-system-primary text-white" : "bg-white"}`}
            onClick={() => pushPage(p)}
          >
            {p}
          </button>
        ))}

        <button
          className="rounded-md px-3 py-1 text-sm"
          onClick={() => pushPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>

    </>
  );
}
