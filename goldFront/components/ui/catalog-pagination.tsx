"use client";

import { useTransition, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPaginationItems } from "./pagination-items";

interface CatalogPaginationProps {
  page?: number;
  limit?: number;
  totalCount?: number;
  itemLabel: string;
  ariaLabel?: string;
}

export function CatalogPagination({
  page = 1,
  limit = 10,
  totalCount = 0,
  itemLabel,
  ariaLabel = "Catalog pagination",
}: CatalogPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startPageTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const activePageIndex = Math.max(
    0,
    paginationItems.findIndex((item) => item === currentPage),
  );

  function pushPage(newPage: number) {
    const clampedPage = Math.min(Math.max(newPage, 1), totalPages);
    if (isPending || clampedPage === currentPage) {
      return;
    }

    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", String(clampedPage));
    params.set("limit", String(limit));
    startPageTransition(() => {
      router.push(`${window.location.pathname}?${params.toString()}`);
    });
  }

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(totalCount, currentPage * limit);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;
  const progressWidth = `${(currentPage / totalPages) * 100}%`;
  const arrowButtonClassName =
    "inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] text-[#667085] transition-[background-color,color,transform,opacity] duration-[160ms] ease-out focus-visible:ring-4 focus-visible:ring-[#C9A44C]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-x-0 disabled:hover:bg-transparent disabled:hover:text-[#667085] motion-reduce:transition-none motion-reduce:hover:translate-x-0";
  const pageButtonClassName =
    "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-[10px] text-sm font-semibold transition-[background-color,color,transform] duration-[160ms] ease-out focus-visible:ring-4 focus-visible:ring-[#C9A44C]/25 focus-visible:outline-none disabled:cursor-wait motion-reduce:transition-none motion-reduce:hover:translate-y-0";

  return (
    <nav
      aria-label={ariaLabel}
      aria-busy={isPending}
      className="border-t border-[#E5E8EF] bg-[#FBFCFE]/80 px-4 py-3 sm:px-5"
    >
      <div className="hidden items-center justify-between gap-4 md:flex">
        <div
          key={`${startItem}-${endItem}-${totalCount}`}
          className="products-pagination-count-enter min-w-0"
        >
          <p className="text-sm font-semibold text-[#182033]">
            Showing{" "}
            <span className="font-semibold text-[#182033]">
              {startItem}-{endItem}
            </span>{" "}
            <span className="font-medium text-[#7B8498]">of</span>{" "}
            <span className="font-semibold text-[#182033]">{totalCount}</span>
            <span className="font-medium text-[#7B8498]"> {itemLabel}</span>
          </p>
          <p className="mt-1 text-xs font-medium text-[#8A94A6]">
            Page {currentPage} of {totalPages}
          </p>
        </div>

        <div className="inline-flex flex-col gap-2">
          <div className="inline-flex items-center gap-1 rounded-[16px] border border-[#E5E8EF] bg-white/90 p-1.5 shadow-[0_4px_16px_rgba(16,27,51,0.05)] backdrop-blur-sm">
            <button
              type="button"
              onClick={() => pushPage(currentPage - 1)}
              disabled={isPending || isFirstPage}
              aria-label="Previous page"
              className={`${arrowButtonClassName} hover:-translate-x-0.5 hover:bg-[#F8F1DC] hover:text-[#B18732]`}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>

            <div
              className="relative flex items-center gap-1"
              style={
                {
                  "--products-active-page-index": activePageIndex,
                } as CSSProperties
              }
            >
              <span
                className="pointer-events-none absolute top-0 left-0 z-0 size-9 rounded-[10px] bg-[linear-gradient(135deg,#D9B95B_0%,#C9A44C_55%,#B98B32_100%)] opacity-100 shadow-[0_5px_14px_rgba(185,139,50,0.22)] transition-transform duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                style={{
                  transform: `translateX(calc(var(--products-active-page-index) * 40px))`,
                }}
                aria-hidden="true"
              />

              {paginationItems.map((item) =>
                typeof item === "number" ? (
                  <button
                    key={item}
                    type="button"
                    onClick={() => pushPage(item)}
                    disabled={isPending}
                    aria-label={`Go to page ${item}`}
                    aria-current={item === currentPage ? "page" : undefined}
                    className={`${pageButtonClassName} ${
                      item === currentPage
                        ? "text-white"
                        : "text-[#667085] hover:-translate-y-px hover:bg-[#F8F1DC] hover:text-[#A67C2D]"
                    }`}
                  >
                    {item}
                  </button>
                ) : (
                  <span
                    key={item}
                    className="relative z-10 flex size-9 shrink-0 items-center justify-center text-sm font-semibold text-[#A1A8B5]"
                    aria-hidden="true"
                  >
                    &hellip;
                  </span>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={() => pushPage(currentPage + 1)}
              disabled={isPending || isLastPage}
              aria-label="Next page"
              className={`${arrowButtonClassName} hover:translate-x-0.5 hover:bg-[#F8F1DC] hover:text-[#B18732]`}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
          {totalPages > 1 && (
            <div className="h-0.5 overflow-hidden rounded-full bg-[#EEF1F5]">
              <span
                className="block h-full rounded-full bg-[linear-gradient(90deg,#D9B95B,#B98B32)] transition-[width] duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                style={{ width: progressWidth }}
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden">
        <div
          key={`${startItem}-${endItem}-${totalCount}-mobile`}
          className="products-pagination-count-enter text-center text-sm font-medium text-[#7B8498]"
        >
          <span className="font-semibold text-[#182033]">
            {startItem}-{endItem}
          </span>{" "}
          of <span className="font-semibold text-[#182033]">{totalCount}</span>{" "}
          {itemLabel}
        </div>
        <div className="mt-3 grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-3 rounded-[16px] border border-[#E5E8EF] bg-white/90 p-2 shadow-[0_4px_16px_rgba(16,27,51,0.05)] backdrop-blur-sm">
          <button
            type="button"
            onClick={() => pushPage(currentPage - 1)}
            disabled={isPending || isFirstPage}
            aria-label="Previous page"
            className={`${arrowButtonClassName} size-10 hover:-translate-x-0.5 hover:bg-[#F8F1DC] hover:text-[#B18732]`}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>

          <p className="mx-auto inline-flex h-9 min-w-[120px] items-center justify-center rounded-[11px] bg-[#F8F1DC] px-4 text-sm font-semibold text-[#8A6515]">
            Page {currentPage} / {totalPages}
          </p>

          <button
            type="button"
            onClick={() => pushPage(currentPage + 1)}
            disabled={isPending || isLastPage}
            aria-label="Next page"
            className={`${arrowButtonClassName} size-10 hover:translate-x-0.5 hover:bg-[#F8F1DC] hover:text-[#B18732]`}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
        {totalPages > 1 && (
          <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-[#EEF1F5]">
            <span
              className="block h-full rounded-full bg-[linear-gradient(90deg,#D9B95B,#B98B32)] transition-[width] duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{ width: progressWidth }}
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    </nav>
  );
}
