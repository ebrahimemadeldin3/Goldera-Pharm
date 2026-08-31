"use client";

import { useMemo, useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPaginationItems } from "./pagination-items";

interface TablePaginationFooterProps {
  page?: number;
  limit?: number;
  totalCount?: number;
  itemLabel: string;
  ariaLabel?: string;
  pageNavAriaLabel?: string;
  pageSizeOptions?: number[];
  onPageChangeStart?: () => void;
}

type PaginationDisplayItem = number | "ellipsis-start" | "ellipsis-end";

function getMobilePaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationDisplayItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "ellipsis-end", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis-start", totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis-start", currentPage, "ellipsis-end", totalPages];
}

export function TablePaginationFooter({
  page = 1,
  limit = 10,
  totalCount = 0,
  itemLabel,
  ariaLabel = "Table pagination",
  pageNavAriaLabel = "Page navigation",
  pageSizeOptions,
  onPageChangeStart,
}: TablePaginationFooterProps) {
  const { role } = useRoleUI();
  const isRep = role === "MEDICAL_REP";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startPageTransition] = useTransition();

  // Derive smart dynamic row options if custom pageSizeOptions are not passed
  const effectivePageSizeOptions = useMemo(() => {
    if (pageSizeOptions && pageSizeOptions.length > 0) {
      return pageSizeOptions;
    }
    if (totalCount <= 20) {
      return [10, 20];
    }
    if (totalCount <= 40) {
      return [10, 20, 40];
    }
    return [10, 20, 40];
  }, [pageSizeOptions, totalCount]);

  // Completely hide footer when 0 items
  if (totalCount === 0) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const showPaginationControls = totalPages > 1;
  const showRowsSelector = totalCount > 10;

  const paginationItems = getPaginationItems(currentPage, totalPages);
  const mobilePaginationItems = getMobilePaginationItems(
    currentPage,
    totalPages,
  );

  function pushPagination(nextPage: number, nextLimit = limit) {
    const nextTotalPages = Math.max(1, Math.ceil(totalCount / nextLimit));
    const clampedPage = Math.min(Math.max(nextPage, 1), nextTotalPages);

    if (
      isPending ||
      (clampedPage === currentPage && nextLimit === limit)
    ) {
      return;
    }

    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", String(clampedPage));
    params.set("limit", String(nextLimit));
    onPageChangeStart?.();
    startPageTransition(() => {
      router.push(`${window.location.pathname}?${params.toString()}`);
    });
  }

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(totalCount, currentPage * limit);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  const arrowButtonClassName = cn(
    "group inline-flex size-10 shrink-0 items-center justify-center rounded-[11px] border transition-all duration-170 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:shadow-none",
    isRep
      ? "border-[#E5E8EF] bg-white text-[#667085] hover:-translate-y-px hover:border-gp-rep-primary-border hover:bg-gp-rep-primary-soft hover:text-gp-rep-primary focus-visible:ring-2 focus-visible:ring-gp-rep-primary/30 disabled:hover:border-[#E5E8EF] disabled:hover:bg-white disabled:hover:text-[#667085]"
      : "sales-pagination-button border-[#E5E8EF] bg-white text-[#667085] hover:-translate-y-px hover:border-[#E9DDB8] hover:bg-[#FFFCF4] hover:text-[#8A6515] hover:shadow-[0_6px_14px_rgba(16,27,51,0.07)] focus-visible:ring-3 focus-visible:ring-[#C9A44C]/20 disabled:hover:border-[#E5E8EF] disabled:hover:bg-white disabled:hover:text-[#667085]"
  );

  const pageButtonClassName = cn(
    "relative inline-flex size-10 shrink-0 items-center justify-center rounded-[11px] border text-sm font-semibold transition-all duration-170 focus-visible:outline-none disabled:cursor-wait",
    isRep
      ? "focus-visible:ring-2 focus-visible:ring-gp-rep-primary/30"
      : "sales-pagination-button focus-visible:ring-3 focus-visible:ring-[#C9A44C]/25"
  );

  function renderPageItems(items: PaginationDisplayItem[], isMobile = false) {
    return items.map((item) =>
      typeof item === "number" ? (
        <button
          key={`${isMobile ? "mobile" : "desktop"}-${item}`}
          type="button"
          onClick={() => pushPagination(item)}
          disabled={isPending}
          aria-label={`Go to page ${item}`}
          aria-current={item === currentPage ? "page" : undefined}
          className={cn(
            pageButtonClassName,
            isMobile && "size-9 rounded-[10px] text-xs",
            item === currentPage
              ? isRep
                ? "bg-gp-rep-primary border-gp-rep-primary text-white font-bold shadow-[0_4px_12px_rgba(22,133,87,0.22)]"
                : "sales-pagination-active-page border-transparent bg-[linear-gradient(135deg,#D8B85A_0%,#C9A44C_55%,#B18732_100%)] text-white shadow-[0_6px_16px_rgba(185,139,50,0.24)]"
              : isRep
              ? "border-[#E5E8EF] bg-white text-[#182033] hover:-translate-y-px hover:border-gp-rep-primary-border hover:bg-gp-rep-primary-soft hover:text-gp-rep-primary"
              : "border-[#E5E8EF] bg-white text-[#182033] hover:-translate-y-px hover:border-[#E9DDB8] hover:bg-[#FFFCF4] hover:text-[#8A6515] hover:shadow-[0_6px_14px_rgba(16,27,51,0.07)]"
          )}
        >
          {item}
          {item === currentPage && !isRep && (
            <span
              className="sales-pagination-active-dot absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-[#D8B85A]"
              aria-hidden="true"
            />
          )}
        </button>
      ) : (
        <span
          key={`${isMobile ? "mobile" : "desktop"}-${item}`}
          className={cn(
            "flex shrink-0 items-center justify-center font-semibold text-[#A1A8B5]",
            isMobile ? "size-7 text-xs" : "size-10 text-sm"
          )}
          aria-hidden="true"
        >
          &hellip;
        </span>
      ),
    );
  }

  return (
    <footer
      aria-label={ariaLabel}
      aria-busy={isPending}
      className={cn(
        "grid gap-4 border-t border-[#EEF1F6] bg-[#FBFCFE]/75 px-4 py-4 sm:px-5 md:items-center",
        showPaginationControls && showRowsSelector
          ? "md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"
          : showPaginationControls
          ? "md:grid-cols-[minmax(0,1fr)_auto]"
          : showRowsSelector
          ? "md:grid-cols-[minmax(0,1fr)_auto]"
          : "md:grid-cols-1"
      )}
    >
      {/* Left Summary */}
      <div
        key={`${startItem}-${endItem}-${totalCount}`}
        className="min-w-0 justify-self-center text-center md:justify-self-start md:text-left"
      >
        <p className="text-sm font-medium text-[#667085]">
          Showing{" "}
          <span className="font-semibold text-[#182033]">
            {startItem}–{endItem}
          </span>{" "}
          of <span className="font-semibold text-[#182033]">{totalCount}</span>{" "}
          {itemLabel}
        </p>
        {totalPages > 1 && (
          <p className="mt-0.5 text-xs font-medium text-[#8A94A6]">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>

      {/* Center Pagination Controls (only rendered when totalPages > 1) */}
      {showPaginationControls && (
        <nav aria-label={pageNavAriaLabel} className="justify-self-center">
          {/* Desktop Controls */}
          <div className="hidden items-center gap-1.5 rounded-[16px] border border-[#E5E8EF] bg-white/95 p-1.5 shadow-[0_4px_16px_rgba(16,27,51,0.04)] sm:inline-flex">
            <button
              type="button"
              onClick={() => pushPagination(currentPage - 1)}
              disabled={isPending || isFirstPage}
              aria-label="Previous page"
              className={arrowButtonClassName}
            >
              <ChevronLeft
                className="size-4 transition-transform duration-[170ms] group-hover:-translate-x-0.5 group-disabled:translate-x-0"
                aria-hidden="true"
              />
            </button>

            {renderPageItems(paginationItems)}

            <button
              type="button"
              onClick={() => pushPagination(currentPage + 1)}
              disabled={isPending || isLastPage}
              aria-label="Next page"
              className={arrowButtonClassName}
            >
              <ChevronRight
                className="size-4 transition-transform duration-[170ms] group-hover:translate-x-0.5 group-disabled:translate-x-0"
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="inline-flex max-w-full items-center gap-1 rounded-[15px] border border-[#E5E8EF] bg-white/95 p-1 shadow-[0_4px_16px_rgba(16,27,51,0.04)] sm:hidden">
            <button
              type="button"
              onClick={() => pushPagination(currentPage - 1)}
              disabled={isPending || isFirstPage}
              aria-label="Previous page"
              className={cn(arrowButtonClassName, "size-9 rounded-[10px]")}
            >
              <ChevronLeft
                className="size-4 transition-transform duration-[170ms] group-hover:-translate-x-0.5 group-disabled:translate-x-0"
                aria-hidden="true"
              />
            </button>

            {renderPageItems(mobilePaginationItems, true)}

            <button
              type="button"
              onClick={() => pushPagination(currentPage + 1)}
              disabled={isPending || isLastPage}
              aria-label="Next page"
              className={cn(arrowButtonClassName, "size-9 rounded-[10px]")}
            >
              <ChevronRight
                className="size-4 transition-transform duration-[170ms] group-hover:translate-x-0.5 group-disabled:translate-x-0"
                aria-hidden="true"
              />
            </button>
          </div>
        </nav>
      )}

      {/* Right Rows Selector (only rendered when totalCount > 10) */}
      {showRowsSelector && (
        <div className="flex items-center gap-2 justify-self-center md:justify-self-end">
          <span className="shrink-0 text-xs font-medium text-[#667085]">
            Rows
          </span>
          <Select
            value={String(limit)}
            onValueChange={(value) => pushPagination(1, Number(value))}
          >
            <SelectTrigger
              className={cn(
                "h-10 w-[74px] cursor-pointer rounded-[10px] border border-[#E5E8EF] bg-white px-2.5 text-sm font-semibold text-[#182033] shadow-none transition-colors [&_svg]:size-3.5 [&_svg]:text-[#667085]",
                isRep
                  ? "hover:border-gp-rep-primary-border hover:bg-gp-rep-primary-soft focus-visible:border-gp-rep-primary focus-visible:ring-2 focus-visible:ring-gp-rep-primary/20 data-[state=open]:border-gp-rep-primary"
                  : "sales-page-size-trigger hover:border-[#E9DDB8] hover:bg-[#FFFCF4] focus-visible:border-[#C9A44C] focus-visible:ring-3 focus-visible:ring-[#C9A44C]/15 data-[state=open]:border-[#C9A44C]"
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-[76px] min-w-[76px] max-h-[116px] overflow-y-auto rounded-lg border-[#E5E8EF] bg-white p-0 shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
              {effectivePageSizeOptions.map((option) => (
                <SelectItem
                  key={option}
                  value={String(option)}
                  className={cn(
                    "h-8 cursor-pointer rounded-md py-0 pr-2 pl-7 text-sm font-semibold transition-colors",
                    isRep
                      ? "text-[#182033] focus:bg-gp-rep-primary-soft focus:text-gp-rep-primary data-[state=checked]:text-gp-rep-primary"
                      : "text-[#182033] focus:bg-[#FBF7EA] focus:text-[#8A6515] data-[state=checked]:text-[#8A6515]"
                  )}
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </footer>
  );
}
