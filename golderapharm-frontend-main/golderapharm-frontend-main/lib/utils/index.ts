import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildPaginationQuery(params?: {
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}) {
  if (!params) return "";

  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });

  return query.toString() ? `?${query.toString()}` : "";
}

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const isActiveRoute = (
  pathname: string,
  href: string,
  allRoutes: Array<{ href: string }>,
): boolean => {
  if (pathname === href) return true;
  if (!pathname.startsWith(href + "/")) return false;

  // Check if there's a more specific route that also matches
  const moreSpecific = allRoutes.some(
    (item) =>
      item.href !== href &&
      item.href.startsWith(href) &&
      (pathname === item.href || pathname.startsWith(item.href + "/")),
  );

  return !moreSpecific;
};

const SAUDI_TIME_ZONE = "Asia/Riyadh";
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function formatDateOnly(date: Date): string {
  const { year, month, day } = getSaudiDateParts(date);
  return `${year}-${month}-${day}`;
}

export function formatSaudiDateDisplay(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: SAUDI_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatSaudiDateTimeDisplay(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: SAUDI_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatSaudiMonthYear(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: SAUDI_TIME_ZONE,
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatSaudiMonthShort(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: SAUDI_TIME_ZONE,
    month: "short",
  }).format(date);
}

export function formatSaudiWeekday(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: SAUDI_TIME_ZONE,
    weekday: "long",
  }).format(date);
}

export function getSaudiDateParts(date: Date): {
  year: string;
  month: string;
  day: string;
} {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SAUDI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return { year, month, day };
}

export function getSaudiYearMonthKey(date: Date): string {
  const { year, month } = getSaudiDateParts(date);
  return `${year}-${month}`;
}

export function getSaudiYear(date: Date): number {
  return Number(getSaudiDateParts(date).year);
}

export function getSaudiWeekdayIndex(date: Date): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: SAUDI_TIME_ZONE,
    weekday: "short",
  }).format(date);

  return WEEKDAY_INDEX[weekday] ?? 0;
}

export function getSaudiCalendarDate(date: Date): Date {
  const { year, month, day } = getSaudiDateParts(date);
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function parseDateValue(value: string | Date): Date {
  if (value instanceof Date) {
    return value;
  }

  if (DATE_ONLY_PATTERN.test(value)) {
    return new Date(`${value}T00:00:00+03:00`);
  }

  return new Date(value);
}

export function isSameCalendarDate(left: Date, right: Date): boolean {
  return formatDateOnly(left) === formatDateOnly(right);
}
