"use client";

import { useMemo, useState } from "react";
import Pagination from "@/components/ui/Pagination";
import { Search, Calendar } from "lucide-react";
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

// Derive column headers from the first record
function getColumns(sales: SaleApiResponse[]): string[] {
  if (sales.length === 0) return [];
  return Object.keys(sales[0]).filter((k) => k !== "__v");
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
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
  // Try to format ISO date strings
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
    try {
      return formatSaudiDateDisplay(parseDateValue(str));
    } catch {
      return str;
    }
  }
  return str;
}

export default function SalesTable({ sales, page, limit, totalCount }: SalesTableProps) {
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

  return (
    <section className="border-secondary-light mt-6 rounded-[14px] border-[.8px] bg-white p-6">
      
            <div className="mt-4">
        <Pagination page={page} limit={limit} totalCount={totalCount ?? sales.length} />
      </div>
      
      {/* Filters */}
      <header className="mb-6 flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold">Sales Records</h2>

        {/* Date filter tabs */}
        <div className="flex items-center gap-1 rounded-full bg-[#EBF1FF] p-1 *:cursor-pointer">
          {DATE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setDateFilter(f.value)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                dateFilter === f.value
                  ? "bg-dashboard-blue text-white"
                  : "text-[#334155] hover:bg-white/60"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative ml-auto w-full sm:w-auto">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#717182]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sales..."
            className="h-9 w-full rounded-md border bg-white pl-10 text-sm sm:w-60"
          />
        </div>
      </header>

      {/* Table */}
      {sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-white/60 p-12 text-center">
          <Calendar size={36} className="text-secondary-dark mb-3" />
          <p className="text-sm font-medium text-[#334155]">
            No sales data yet
          </p>
          <p className="text-secondary-dark mt-1 text-xs">
            Upload an Excel file to import sales records
          </p>
        </div>
      ) : columns.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-secondary-light border-b text-left">
                <th className="text-secondary-dark pr-4 pb-3 font-medium">#</th>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="text-secondary-dark pr-4 pb-3 font-medium capitalize"
                  >
                    {col === "qtyOrdered"
                      ? "Qty Ordered"
                      : col === "untaxedTotal"
                        ? "Untaxed Total"
                        : col === "orderDate"
                          ? "Order Date"
                          : col.replace(/([A-Z])/g, " $1").trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((sale, idx) => (
                <tr
                  key={sale.id ?? idx}
                  className="border-secondary-light hover:bg-secondary-very-light border-b last:border-0"
                >
                  <td className="py-3 pr-4 text-[#717182]">{idx + 1}</td>
                  {columns.map((col) => (
                    <td key={col} className="py-3 pr-4 text-[#334155]">
                      {formatCellValue(sale[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="border-secondary-light rounded-md border border-dashed bg-white/60 p-8 text-center text-sm text-slate-500">
              No records match the selected filter.
            </div>
          )}
        </div>
      ) : null}

      <p className="text-secondary-dark mt-4 text-xs">
        Showing {filtered.length} of {sales.length} records
      </p>


    </section>
  );
}
