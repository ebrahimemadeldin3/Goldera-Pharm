import type { OverviewQuery } from "./types";
export type OverviewPeriod =
  "today" | "week" | "month" | "quarter" | "year" | "custom";
export const PERIOD_OPTIONS: { value: OverviewPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "quarter", label: "This quarter" },
  { value: "year", label: "This year" },
  { value: "custom", label: "Custom range" },
];
export const number = (value: number) =>
  new Intl.NumberFormat("en-SA").format(value);
export const money = (value: number, compact = false) =>
  new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: compact && Math.abs(value) >= 1000000 ? 1 : 2,
    ...(compact && Math.abs(value) >= 1000000
      ? { notation: "compact" as const }
      : {}),
  }).format(value);
export const percentage = (value: number | null) =>
  value === null ? "—" : `${value.toFixed(1)}%`;
export function displayDay(value: string, short = false) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    day: "numeric",
    month: "short",
    ...(short ? {} : { year: "numeric" }),
  }).format(new Date(value.length === 10 ? `${value}T00:00:00+03:00` : value));
}
export function periodDates(
  period: OverviewPeriod,
  now: string,
): Pick<OverviewQuery, "from" | "to"> {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(now));
  const [year, month] = today.split("-").map(Number);
  const key = (date: Date) => date.toISOString().slice(0, 10);
  if (period === "today") return { from: today, to: today };
  if (period === "week") {
    const date = new Date(`${today}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() - date.getUTCDay());
    return {
      from: key(date),
      to: key(new Date(date.getTime() + 6 * 86400000)),
    };
  }
  if (period === "year") return { from: `${year}-01-01`, to: `${year}-12-31` };
  const startMonth =
    period === "quarter" ? Math.floor((month - 1) / 3) * 3 : month - 1;
  return {
    from: key(new Date(Date.UTC(year, startMonth, 1))),
    to: key(
      new Date(Date.UTC(year, startMonth + (period === "quarter" ? 3 : 1), 0)),
    ),
  };
}
export function defaultQuery(now: string): OverviewQuery {
  return {
    ...periodDates("month", now),
    repId: "all",
    district: "all",
    regionId: "all",
    territoryId: "all",
  };
}
export const EMPTY_OPTIONS = { districts: [], regions: [], reps: [] };
