export const SAUDI_TIME_ZONE = "Asia/Riyadh";
export const WORKING_WEEK_DAYS = 6;
export const WEEK_START_WEEKDAY = 6; // Saturday (0=Sun..6=Sat)
export const EXCLUDED_WEEKDAYS = Object.freeze([5]); // Friday

const saudiDatePartsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SAUDI_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const saudiDateTimePartsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SAUDI_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function partsMap(formatter, date) {
  const map = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  return map;
}

/**
 * Parse a YYYY-MM-DD string or Date into a canonical Saudi YYYY-MM-DD key.
 * Plain YYYY-MM-DD strings are preserved as-is (after calendar validation)
 * so timezone offsets never shift a date-only value.
 */
export function getSaudiDateKey(value) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (match) {
      const y = Number(match[1]);
      const m = Number(match[2]);
      const d = Number(match[3]);
      const utc = new Date(Date.UTC(y, m - 1, d));
      if (
        utc.getUTCFullYear() !== y ||
        utc.getUTCMonth() !== m - 1 ||
        utc.getUTCDate() !== d
      ) {
        return null;
      }
      return trimmed;
    }
  }
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const parts = partsMap(saudiDatePartsFormatter, parsed);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function addSaudiDays(dateInput, deltaDays) {
  const key = getSaudiDateKey(dateInput);
  if (!key) return null;
  const [y, m, d] = key.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + deltaDays));
  return utc.toISOString().slice(0, 10);
}

export function getSaudiWeekdayIndex(dateInput) {
  const key = getSaudiDateKey(dateInput);
  if (!key) return null;
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function isSaudiFriday(dateInput) {
  const weekday = getSaudiWeekdayIndex(dateInput);
  return weekday !== null && EXCLUDED_WEEKDAYS.includes(weekday);
}

export function isWorkingDay(dateInput) {
  const weekday = getSaudiWeekdayIndex(dateInput);
  return weekday !== null && !EXCLUDED_WEEKDAYS.includes(weekday);
}

/**
 * Generates WORKING_WEEK_DAYS (6) working-day keys starting from startDateInput,
 * excluding Friday. If startDateInput is a Friday, starts on Saturday.
 */
export function getWeeklyWorkingDayKeys(startDateInput) {
  let cursor = getSaudiDateKey(startDateInput);
  if (!cursor) return [];
  if (isSaudiFriday(cursor)) {
    cursor = addSaudiDays(cursor, 1);
  }
  const days = [];
  let safety = 0;
  while (days.length < WORKING_WEEK_DAYS && safety < 14) {
    if (isWorkingDay(cursor)) {
      days.push(cursor);
    }
    cursor = addSaudiDays(cursor, 1);
    safety += 1;
  }
  return days;
}

/**
 * Returns UTC Date bounds corresponding to [00:00:00.000, 23:59:59.999] in Asia/Riyadh (+03:00).
 */
export function getSaudiDayBounds(dateInput) {
  const key = getSaudiDateKey(dateInput);
  if (!key) return null;
  return {
    key,
    start: new Date(`${key}T00:00:00.000+03:00`),
    end: new Date(`${key}T23:59:59.999+03:00`),
  };
}

export function getCurrentSaudiDateTime(now = new Date()) {
  const parts = partsMap(saudiDateTimePartsFormatter, now);
  const hour = parts.hour === "24" ? "00" : parts.hour;
  return {
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${hour}:${parts.minute}`,
    timestamp: now.getTime(),
  };
}

/**
 * Converts a Saudi date (YYYY-MM-DD or Date) and optional HH:mm time into a UTC Date.
 */
export function toSaudiDateTime(dateInput, timeStr = "00:00") {
  const key = getSaudiDateKey(dateInput);
  if (!key) return null;
  const normalizedTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(timeStr || "")
    ? timeStr
    : "00:00";
  const d = new Date(`${key}T${normalizedTime}:00.000+03:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}
