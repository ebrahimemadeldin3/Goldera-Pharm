"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { SaleApiResponse, DateFilter } from "../lib/types";
import {
  formatDateOnly,
  formatSaudiDateDisplay,
  getSaudiWeekdayIndex,
  getSaudiYear,
  getSaudiYearMonthKey,
  isSameCalendarDate,
  parseDateValue,
} from "@/lib/utils";

interface SalesTableProps {
  sales: SaleApiResponse[];
  page?: number;
  limit?: number;
  totalCount?: number;
}

const DATE_FILTERS: { label: string; value: DateFilter }[] = [
  { label: "All Time", value: "all" },
  { label: "This Year", value: "year" },
  { label: "This Month", value: "month" },
  { label: "This Week", value: "week" },
  { label: "Today", value: "day" },
];

const COMPACT_COLUMNS = new Set([
  "id",
  "externalId",
  "externalID",
  "productId",
  "productID",
]);

const DATE_COLUMNS = new Set([
  "date",
  "saleDate",
  "soldAt",
  "orderDate",
  "createdAt",
  "updatedAt",
]);

function isWithinRange(
  dateStr: string | undefined,
  filter: DateFilter,
): boolean {
  if (filter === "all" || !dateStr) return true;
  const date = parseDateValue(dateStr);
  if (isNaN(date.getTime())) return true;
  const now = new Date();

  if (filter === "day") {
    return isSameCalendarDate(date, now);
  }
  if (filter === "week") {
    const todayKey = formatDateOnly(now);
    const todaySaudi = parseDateValue(todayKey);
    const weekDay = getSaudiWeekdayIndex(now);
    const startOfWeek = new Date(todaySaudi.getTime() - weekDay * 86400000);
    const endOfWeek = new Date(startOfWeek.getTime() + 6 * 86400000);

    const dateKey = formatDateOnly(date);
    const startKey = formatDateOnly(startOfWeek);
    const endKey = formatDateOnly(endOfWeek);

    return dateKey >= startKey && dateKey <= endKey;
  }
  if (filter === "month") {
    return getSaudiYearMonthKey(date) === getSaudiYearMonthKey(now);
  }
  if (filter === "year") {
    return getSaudiYear(date) === getSaudiYear(now);
  }
  return true;
}

function getColumns(sales: SaleApiResponse[]): string[] {
  if (sales.length === 0) return [];
  return Object.keys(sales[0]).filter((k) => k !== "__v");
}

function formatColumnHeader(column: string): string {
  if (column === "sheetName") return "Sheet";
  if (column === "externalId" || column === "externalID") return "External ID";
  if (column === "qtyOrdered") return "Qty";
  if (column === "untaxedTotal") return "Untaxed";
  if (column === "orderDate") return "Order Date";
  if (column === "productId" || column === "productID") return "Product ID";
  if (column === "updatedAt") return "Updated At";
  return column.replace(/([A-Z])/g, " $1").trim();
}

function formatCellValue(value: unknown, column?: string): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.name === "string") {
      const internalRef =
        typeof obj.internalRef === "string" && obj.internalRef
          ? ` (${obj.internalRef})`
          : "";
      return `${obj.name}${internalRef}`;
    }
    return JSON.stringify(value);
  }

  const str = String(value);
  if (column && DATE_COLUMNS.has(column) && /^\d{4}-\d{2}-\d{2}T?/.test(str)) {
    try {
      return formatSaudiDateDisplay(parseDateValue(str));
    } catch {
      return str;
    }
  }
  return str;
}

function getPaginationItems(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages]);

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page >= 1 && page <= totalPages) pages.add(page);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];

  sorted.forEach((pageNumber, index) => {
    const previous = sorted[index - 1];
    if (previous && pageNumber - previous > 1) {
      items.push("ellipsis");
    }
    items.push(pageNumber);
  });

  return items;
}

function SalesPagination({
  page = 1,
  limit = 10,
  totalCount = 0,
}: Required<PaginationProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const startItem = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(totalCount, page * limit);
  const pageItems = getPaginationItems(page, totalPages);

  function pushPage(newPage: number) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", String(newPage));
    params.set("limit", String(limit));
    router.push(`${window.location.pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 border-t border-[#EEF1F6] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-xs font-medium text-[#667085]">
        Showing {startItem}-{endItem} of {totalCount} records
      </p>

      <nav
        aria-label="Sales pagination"
        className="flex flex-wrap items-center gap-1.5"
      >
        <button
          type="button"
          onClick={() => pushPage(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-[#E5E8EF] bg-white px-3 text-xs font-semibold text-[#344054] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </button>

        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-8 min-w-8 items-center justify-center text-xs text-[#98A2B3]"
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === page ? "page" : undefined}
              onClick={() => pushPage(item)}
              className={`h-8 min-w-8 rounded-md px-2 text-xs font-semibold transition-colors ${
                item === page
                  ? "bg-[#C9A44C] text-white"
                  : "border border-[#E5E8EF] bg-white text-[#344054] hover:bg-[#F9FAFB]"
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => pushPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-[#E5E8EF] bg-white px-3 text-xs font-semibold text-[#344054] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </nav>
    </div>
  );
}

type PaginationProps = {
  page?: number;
  limit?: number;
  totalCount?: number;
};

function renderCell(sale: SaleApiResponse, column: string) {
  const value = sale[column];
  const text = formatCellValue(value, column);

  if (column === "sheetName") {
    return (
      <span
        title={text}
        className="inline-flex max-w-[130px] items-center rounded-md bg-[#F2F4F7] px-2 py-1 text-[11px] font-semibold text-[#475467]"
      >
        <span className="truncate">{text}</span>
      </span>
    );
  }

  if (COMPACT_COLUMNS.has(column)) {
    return (
      <span
        dir="ltr"
        title={text}
        className="block max-w-[150px] truncate font-mono text-[12px] text-[#344054]"
      >
        {text}
      </span>
    );
  }

  if (column === "customer" || column === "product") {
    return (
      <span
        dir="auto"
        title={text}
        className="block max-w-[260px] truncate text-[#344054]"
      >
        {text}
      </span>
    );
  }

  return (
    <span dir="auto" title={text} className="text-[#344054]">
      {text}
    </span>
  );
}

export default function SalesTable({
  sales,
  page = 1,
  limit = 10,
  totalCount,
}: SalesTableProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return sales.filter((sale) => {
      const dateField =
        sale.date ??
        sale.createdAt ??
        sale.saleDate ??
        sale.soldAt ??
        undefined;
      if (!isWithinRange(dateField, dateFilter)) return false;
      if (!term) return true;
      return Object.values(sale).some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(term),
      );
    });
  }, [sales, dateFilter, q]);

  const columns = useMemo(() => getColumns(sales), [sales]);
  const count = totalCount ?? sales.length;
  const startRecord = count === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(count, page * limit);

  return (
    <section className="sales-page-enter sales-page-enter-delay-2 overflow-hidden rounded-2xl border border-[#E5E8EF] bg-white shadow-none">
      <div className="flex flex-col gap-4 px-4 py-5 sm:px-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-[#182033]">
            Sales Records
          </h2>
          <p className="mt-1 text-xs font-medium text-[#667085]">
            Viewing records {startRecord}-{endRecord} of {count}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <div className="relative min-w-0 sm:w-[280px]">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search sales..."
              className="h-10 w-full rounded-[10px] border border-[#DDE3EE] bg-[#F9FAFB] pr-3 pl-9 text-sm font-medium text-[#182033] transition-colors outline-none placeholder:text-[#98A2B3] focus:border-[#C9A44C] focus:ring-[3px] focus:ring-[#C9A44C]/10"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-[#EEF1F6] px-4 py-3 sm:px-5">
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-[10px] bg-[#F6F8FB] p-1">
          {DATE_FILTERS.map((f) => (
            <button
              type="button"
              key={f.value}
              onClick={() => setDateFilter(f.value)}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                dateFilter === f.value
                  ? "bg-[#C9A44C] text-white"
                  : "text-[#344054] hover:bg-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {sales.length === 0 ? (
        <div className="mx-4 mb-5 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#DDE3EE] bg-[#F9FAFB] p-12 text-center sm:mx-5">
          <Calendar size={36} className="mb-3 text-[#667085]" />
          <p className="text-sm font-semibold text-[#344054]">
            No sales data yet
          </p>
          <p className="mt-1 text-xs text-[#667085]">
            Upload an Excel file to import sales records
          </p>
        </div>
      ) : columns.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-[#EEF1F6] text-left text-sm">
            <thead className="bg-[#F9FAFB]">
              <tr>
                <th className="border-b border-[#EEF1F6] px-4 py-3 text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-[#667085] uppercase">
                  #
                </th>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="border-b border-[#EEF1F6] px-4 py-3 text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-[#667085] uppercase"
                  >
                    {formatColumnHeader(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((sale, idx) => (
                <tr
                  key={sale.id ?? idx}
                  className="border-b border-[#EEF1F6] transition-colors last:border-0 hover:bg-[#F9FAFB]"
                >
                  <td className="px-4 py-3 text-xs font-medium whitespace-nowrap text-[#667085]">
                    {(page - 1) * limit + idx + 1}
                  </td>
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-3 align-middle">
                      {renderCell(sale, col)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="border-t border-[#EEF1F6] bg-white p-8 text-center text-sm text-[#667085]">
              No records match the selected filter.
            </div>
          )}
        </div>
      ) : null}

      <SalesPagination page={page} limit={limit} totalCount={count} />
    </section>
  );
}
