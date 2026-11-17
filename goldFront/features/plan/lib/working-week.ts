import {
  formatDateOnly,
  getSaudiCalendarDate,
  getSaudiWeekdayIndex,
  parseDateValue,
} from "@/lib/utils";

export const WORKING_WEEK_DAYS = 6;
export const WEEK_START_WEEKDAY = 6; // Saturday (0=Sun..6=Sat)
export const EXCLUDED_WEEKDAYS = [5] as const; // Friday

function addCalendarDays(dateKey: string, delta: number): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + delta));
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}

export function isSaudiFriday(dateInput: Date | string): boolean {
  const parsed = parseDateValue(dateInput);
  if (!parsed) return false;
  const weekday = getSaudiWeekdayIndex(parsed);
  return EXCLUDED_WEEKDAYS.includes(weekday as 5);
}

export function isSaudiWorkingDay(dateInput: Date | string): boolean {
  const parsed = parseDateValue(dateInput);
  if (!parsed) return false;
  return !isSaudiFriday(parsed);
}

export function getNextWorkingDay(dateInput: Date | string): Date {
  const parsed = parseDateValue(dateInput) ?? new Date();
  const base = getSaudiCalendarDate(parsed);
  let key = formatDateOnly(base);
  let cursor = addCalendarDays(key, 0);
  let safety = 0;
  while (isSaudiFriday(cursor) && safety < 7) {
    key = formatDateOnly(cursor);
    cursor = addCalendarDays(key, 1);
    safety += 1;
  }
  return cursor;
}

/**
 * Generates exactly WORKING_WEEK_DAYS (6) working-day Date objects
 * starting from startDate (advancing to Saturday if startDate is Friday),
 * skipping Friday across month, year, and leap-year boundaries.
 */
export function getWeeklyPlanWorkingDays(startDate: Date | string): Date[] {
  const firstWorking = getNextWorkingDay(startDate);
  let cursorKey = formatDateOnly(firstWorking);
  const days: Date[] = [];
  let safety = 0;

  while (days.length < WORKING_WEEK_DAYS && safety < 14) {
    const candidate = addCalendarDays(cursorKey, 0);
    if (isSaudiWorkingDay(candidate)) {
      days.push(candidate);
    }
    cursorKey = formatDateOnly(addCalendarDays(cursorKey, 1));
    safety += 1;
  }

  return days;
}

export function getWeeklyPlanEndDate(startDate: Date | string): Date {
  const days = getWeeklyPlanWorkingDays(startDate);
  return days[days.length - 1] ?? getNextWorkingDay(startDate);
}

export function getPlanWorkingDaysInRange(
  startDate: Date | string,
  endDate: Date | string,
  planType: "WEEKLY" | "MONTHLY" = "WEEKLY",
): Date[] {
  const parsedStart = parseDateValue(startDate);
  const parsedEnd = parseDateValue(endDate);
  if (!parsedStart || !parsedEnd) return [];
  const start = getSaudiCalendarDate(parsedStart);
  const end = getSaudiCalendarDate(parsedEnd);

  const startKey = formatDateOnly(start);
  const endKey = formatDateOnly(end);
  if (startKey > endKey) return [];

  const days: Date[] = [];
  let cursorKey = startKey;
  let safety = 0;
  while (cursorKey <= endKey && safety < 62) {
    const candidate = addCalendarDays(cursorKey, 0);
    if (planType !== "WEEKLY" || isSaudiWorkingDay(candidate)) {
      days.push(candidate);
    }
    cursorKey = formatDateOnly(addCalendarDays(cursorKey, 1));
    safety += 1;
  }
  return days;
}
