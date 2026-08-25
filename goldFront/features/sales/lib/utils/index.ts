import {
  formatDateOnly,
  getSaudiWeekdayIndex,
  getSaudiYear,
  getSaudiYearMonthKey,
  isSameCalendarDate,
  parseDateValue,
} from "@/lib/utils";
import type {
  DateFilter,
  SaleApiResponse,
  SalesDateRangeFilter,
} from "../types";

/**
 * Extract sales array from API response (handles different response shapes)
 */
export function extractSales(raw: unknown): SaleApiResponse[] {
  if (!raw || typeof raw !== "object") return [];
  const r = raw as Record<string, unknown>;

  if (
    r.data &&
    typeof r.data === "object" &&
    Array.isArray((r.data as Record<string, unknown>).sales)
  ) {
    return (r.data as { sales: SaleApiResponse[] }).sales;
  }

  if (
    r.data &&
    typeof r.data === "object" &&
    Array.isArray((r.data as Record<string, unknown>).data)
  ) {
    return (r.data as { data: SaleApiResponse[] }).data;
  }

  if (Array.isArray(r.data)) return r.data as SaleApiResponse[];
  if (Array.isArray(r.sales)) return r.sales as SaleApiResponse[];
  if (Array.isArray(raw)) return raw as SaleApiResponse[];
  return [];
}

export function getSalesTotalCount(raw: unknown, fallback = 0): number {
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Record<string, unknown>;
  const data = r.data as Record<string, unknown> | undefined;
  const candidates = [r.results, r.length, data?.results, data?.length];

  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }
  }

  return fallback;
}

export function normalizeSalesDateFilter(value?: string): DateFilter {
  if (
    value === "all" ||
    value === "day" ||
    value === "week" ||
    value === "month" ||
    value === "year"
  ) {
    return value;
  }

  return "all";
}

export function getSaleDateValue(sale: SaleApiResponse): string | undefined {
  return (
    sale.orderDate ??
    sale.date ??
    sale.saleDate ??
    sale.soldAt ??
    sale.createdAt ??
    sale.updatedAt ??
    undefined
  );
}

export function isSaleWithinDateFilter(
  sale: SaleApiResponse,
  filter: DateFilter,
): boolean {
  if (filter === "all") return true;

  const dateStr = getSaleDateValue(sale);
  if (!dateStr) return false;

  const date = parseDateValue(dateStr);
  if (Number.isNaN(date.getTime())) return false;

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

function getDateRangeKey(value?: string | Date | null): string | null {
  if (!value) return null;

  const date = parseDateValue(value);
  if (Number.isNaN(date.getTime())) return null;

  return formatDateOnly(date);
}

export function isSaleWithinDateRangeFilter(
  sale: SaleApiResponse,
  dateRange?: SalesDateRangeFilter,
): boolean {
  if (!dateRange?.from && !dateRange?.to) return true;

  const fromKey = getDateRangeKey(dateRange.from);
  const toKey = getDateRangeKey(dateRange.to) ?? fromKey;
  if (!fromKey || !toKey) return true;

  const startKey = fromKey <= toKey ? fromKey : toKey;
  const endKey = fromKey <= toKey ? toKey : fromKey;
  const dateStr = getSaleDateValue(sale);
  if (!dateStr) return false;

  const saleDate = parseDateValue(dateStr);
  if (Number.isNaN(saleDate.getTime())) return false;

  const saleDateKey = formatDateOnly(saleDate);
  return saleDateKey >= startKey && saleDateKey <= endKey;
}

function stringifySearchValue(value: unknown): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return Object.values(obj).map(stringifySearchValue).join(" ");
  }

  return String(value);
}

export function filterSales(
  sales: SaleApiResponse[],
  filters: {
    dateFilter?: DateFilter;
    dateRange?: SalesDateRangeFilter;
    query?: string;
  },
): SaleApiResponse[] {
  const dateFilter = filters.dateFilter ?? "all";
  const term = filters.query?.trim().toLowerCase() ?? "";

  return sales.filter((sale) => {
    if (!isSaleWithinDateRangeFilter(sale, filters.dateRange)) return false;
    if (!isSaleWithinDateFilter(sale, dateFilter)) return false;
    if (!term) return true;

    return Object.values(sale).some((value) =>
      stringifySearchValue(value).toLowerCase().includes(term),
    );
  });
}
