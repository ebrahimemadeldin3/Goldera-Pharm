"use client";

import { useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  tone?: "gold" | "navy";
}

const defaultPageSizeOptions = [10, 20, 50];
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
  pageNavAriaLabel = "Sales records pages",
  pageSizeOptions = defaultPageSizeOptions,
  onPageChangeStart,
  onPageChange,
  onPageSizeChange,
  tone = "navy",
}: TablePaginationFooterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startPageTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
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

    if (onPageChange || onPageSizeChange) {
      startPageTransition(() => {
        if (nextLimit !== limit) {
          onPageSizeChange?.(nextLimit);
        }

        onPageChange?.(clampedPage);
      });
      return;
    }

    startPageTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(totalCount, currentPage * limit);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;
  const usesNavyTone = tone === "navy";
  const arrowButtonClassName =
    `sales-pagination-button group inline-flex size-10 shrink-0 items-center justify-center rounded-[11px] border border-[#E5E8EF] bg-white transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-[170ms] ease-out hover:-translate-y-px hover:shadow-[0_6px_14px_rgba(16,29,54,0.07)] focus-visible:ring-3 focus-visible:ring-[#C9A44C]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:border-[#E5E8EF] disabled:hover:bg-white disabled:hover:shadow-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
      usesNavyTone
        ? "text-gp-navy-900 hover:border-gp-navy-900/20 hover:bg-gp-navy-900/5 hover:text-gp-navy-900 disabled:hover:text-gp-navy-900"
        : "text-[#667085] hover:border-[#E9DDB8] hover:bg-[#FFFCF4] hover:text-[#8A6515] disabled:hover:text-[#667085]"
    }`;
  const pageButtonClassName =
    "sales-pagination-button relative inline-flex size-10 shrink-0 items-center justify-center rounded-[11px] border text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-[170ms] ease-out focus-visible:ring-3 focus-visible:ring-[#C9A44C]/25 focus-visible:outline-none disabled:cursor-wait motion-reduce:transition-none motion-reduce:hover:translate-y-0";

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
          className={`${pageButtonClassName} ${
            isMobile ? "size-9 rounded-[10px] text-xs" : ""
          } ${
            item === currentPage
              ? usesNavyTone
                ? "sales-pagination-active-page bg-gp-navy-900 border-transparent text-white shadow-[0_6px_16px_rgba(16,29,54,0.24)]"
                : "sales-pagination-active-page border-transparent bg-[linear-gradient(135deg,#D8B85A_0%,#C9A44C_55%,#B18732_100%)] text-white shadow-[0_6px_16px_rgba(185,139,50,0.24)]"
              : usesNavyTone
                ? "text-gp-navy-900 border-[#E5E8EF] bg-white hover:-translate-y-px hover:border-gp-navy-900/20 hover:bg-gp-navy-900/5 hover:text-gp-navy-900 hover:shadow-[0_6px_14px_rgba(16,29,54,0.07)]"
                : "border-[#E5E8EF] bg-white text-[#182033] hover:-translate-y-px hover:border-[#E9DDB8] hover:bg-[#FFFCF4] hover:text-[#8A6515] hover:shadow-[0_6px_14px_rgba(16,27,51,0.07)]"
          }`}
        >
          {item}
          {item === currentPage && (
            <span
              className="sales-pagination-active-dot bg-gp-gold-500 absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full"
              aria-hidden="true"
            />
          )}
        </button>
      ) : (
        <span
          key={`${isMobile ? "mobile" : "desktop"}-${item}`}
          className={`flex shrink-0 items-center justify-center font-semibold text-[#A1A8B5] ${
            isMobile ? "size-7 text-xs" : "size-10 text-sm"
          }`}
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
      className="sales-pagination-footer grid gap-4 border-t border-[#EEF1F6] bg-[#FBFCFE]/75 px-4 py-4 sm:px-5 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center"
    >
      <div
        key={`${startItem}-${endItem}-${totalCount}`}
        className="sales-record-count-refresh min-w-0 justify-self-center text-center md:justify-self-start md:text-left"
      >
        <p className="text-sm font-medium text-[#667085]">
          Showing{" "}
          <span
            className={`font-semibold ${usesNavyTone ? "text-gp-navy-900" : "text-[#182033]"}`}
          >
            {startItem}-{endItem}
          </span>{" "}
          of{" "}
          <span
            className={`font-semibold ${usesNavyTone ? "text-gp-navy-900" : "text-[#182033]"}`}
          >
            {totalCount}
          </span>{" "}
          {itemLabel}
        </p>
        <p className="mt-1 text-xs font-medium text-[#8A94A6]">
          Page {currentPage} of {totalPages}
        </p>
      </div>

      <nav
        aria-label={pageNavAriaLabel}
        className="justify-self-center"
      >
        <div className="sales-pagination-control-cluster hidden items-center gap-1.5 rounded-[16px] border border-[#E5E8EF] bg-white/95 p-1.5 shadow-[0_4px_16px_rgba(16,27,51,0.05)] sm:inline-flex">
          <button
            type="button"
            onClick={() => pushPagination(currentPage - 1)}
            disabled={isPending || isFirstPage}
            aria-label="Previous page"
            className={arrowButtonClassName}
          >
            <ChevronLeft
              className="sales-pagination-chevron size-4 transition-transform duration-[170ms] group-hover:-translate-x-0.5 group-disabled:translate-x-0 motion-reduce:transition-none"
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
              className="sales-pagination-chevron size-4 transition-transform duration-[170ms] group-hover:translate-x-0.5 group-disabled:translate-x-0 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="sales-pagination-control-cluster inline-flex max-w-full items-center gap-1 rounded-[15px] border border-[#E5E8EF] bg-white/95 p-1 shadow-[0_4px_16px_rgba(16,27,51,0.05)] sm:hidden">
          <button
            type="button"
            onClick={() => pushPagination(currentPage - 1)}
            disabled={isPending || isFirstPage}
            aria-label="Previous page"
            className={`${arrowButtonClassName} size-9 rounded-[10px]`}
          >
            <ChevronLeft
              className="sales-pagination-chevron size-4 transition-transform duration-[170ms] group-hover:-translate-x-0.5 group-disabled:translate-x-0 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </button>

          {renderPageItems(mobilePaginationItems, true)}

          <button
            type="button"
            onClick={() => pushPagination(currentPage + 1)}
            disabled={isPending || isLastPage}
            aria-label="Next page"
            className={`${arrowButtonClassName} size-9 rounded-[10px]`}
          >
            <ChevronRight
              className="sales-pagination-chevron size-4 transition-transform duration-[170ms] group-hover:translate-x-0.5 group-disabled:translate-x-0 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </button>
        </div>
      </nav>

      <div className="flex items-center gap-2 justify-self-center md:justify-self-end">
        <span className="shrink-0 text-xs font-medium text-[#667085]">
          Rows
        </span>
        <Select
          value={String(limit)}
          onValueChange={(value) => pushPagination(1, Number(value))}
        >
          <SelectTrigger
            aria-label="Rows per page"
            className={`sales-page-size-trigger h-10 w-[74px] cursor-pointer rounded-[10px] border-[#E5E8EF] bg-white px-2.5 text-sm font-semibold shadow-none transition-[border-color,background-color,color,box-shadow] duration-[170ms] focus-visible:border-[#C9A44C] focus-visible:ring-3 focus-visible:ring-[#C9A44C]/15 data-[state=open]:border-[#C9A44C] [&_svg]:size-3.5 ${
              usesNavyTone
                ? "text-gp-navy-900 hover:border-gp-navy-900/20 hover:bg-gp-navy-900/5 [&_svg]:text-gp-navy-900"
                : "text-[#182033] hover:border-[#E9DDB8] hover:bg-[#FFFCF4] [&_svg]:text-[#667085]"
            }`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="sales-page-size-content w-[76px] min-w-[76px] max-h-[116px] overflow-y-auto rounded-lg border-[#E5E8EF] bg-white p-0 shadow-[0_10px_24px_rgba(15,23,42,0.12)] [&>div:not([data-slot])]:h-auto [&>div:not([data-slot])]:min-w-0 [&>div:not([data-slot])]:p-1 [&_[data-slot=select-scroll-down-button]]:hidden [&_[data-slot=select-scroll-up-button]]:hidden">
            {pageSizeOptions.map((option) => (
              <SelectItem
                key={option}
                value={String(option)}
                className={`h-8 cursor-pointer rounded-md py-0 pr-2 pl-7 text-sm font-semibold transition-[background-color,color] duration-[140ms] ${
                  usesNavyTone
                    ? "text-gp-navy-900 focus:bg-gp-navy-900/5 focus:text-gp-navy-900 data-[state=checked]:text-gp-navy-900"
                    : "text-[#182033] focus:bg-[#FBF7EA] focus:text-[#8A6515] data-[state=checked]:text-[#8A6515]"
                }`}
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </footer>
  );
}
