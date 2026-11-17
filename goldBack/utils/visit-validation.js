import { ApiError } from "./apiError.js";
import {
  getCurrentSaudiDateTime,
  getSaudiDateKey,
  getSaudiDayBounds,
  toSaudiDateTime,
} from "./working-week.js";

export const VISIT_TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
export const MIN_VISIT_DURATION_MINUTES = 15;
export const MAX_VISIT_DURATION_MINUTES = 480;
export const VISIT_DURATION_STEP_MINUTES = 15;

export function validateVisitTime(time, { required = false } = {}) {
  if (time === undefined || time === null || time === "") {
    if (required) throw new ApiError("Visit time is required", 400);
    return null;
  }
  const normalized = String(time).trim();
  if (!VISIT_TIME_REGEX.test(normalized)) {
    throw new ApiError("Time must use HH:mm between 00:00 and 23:59", 400);
  }
  return normalized;
}

export function validateVisitDuration(duration, { required = false } = {}) {
  if (duration === undefined || duration === null || duration === "") {
    if (required) throw new ApiError("Visit duration is required", 400);
    return null;
  }

  let minutes;
  if (typeof duration === "number") {
    minutes = duration;
  } else {
    const raw = String(duration).trim();
    const match = /^(\d+)(?:\s*(?:min|mins|minute|minutes|m))?$/i.exec(raw);
    if (!match) {
      throw new ApiError(
        "Duration must be in 15-minute increments (e.g. 15 min, 30 min, 45 min)",
        400,
      );
    }
    minutes = Number(match[1]);
  }

  if (
    !Number.isInteger(minutes) ||
    minutes < MIN_VISIT_DURATION_MINUTES ||
    minutes > MAX_VISIT_DURATION_MINUTES ||
    minutes % VISIT_DURATION_STEP_MINUTES !== 0
  ) {
    throw new ApiError(
      `Duration must be a multiple of ${VISIT_DURATION_STEP_MINUTES} minutes between ${MIN_VISIT_DURATION_MINUTES} and ${MAX_VISIT_DURATION_MINUTES}`,
      400,
    );
  }

  return `${minutes} min`;
}

export function validateCompanionSelection(companionType, accompanyingManagerId) {
  const normalizedType = companionType
    ? String(companionType).trim().toUpperCase()
    : "SINGLE";

  if (!["SINGLE", "WITH_MANAGER"].includes(normalizedType)) {
    throw new ApiError("Invalid visit companion type", 400);
  }

  if (normalizedType === "WITH_MANAGER") {
    if (
      typeof accompanyingManagerId !== "string" ||
      !accompanyingManagerId.trim()
    ) {
      throw new ApiError(
        "Accompanying manager is required for a Joint Visit",
        400,
      );
    }
    return {
      companionType: "WITH_MANAGER",
      accompanyingManagerId: accompanyingManagerId.trim(),
    };
  }

  return {
    companionType: "SINGLE",
    accompanyingManagerId: null,
  };
}

export function assertPastOrCurrentSaudiDateTime(
  dateInput,
  timeStr,
  now = new Date(),
) {
  const dateKey = getSaudiDateKey(dateInput);
  if (!dateKey) {
    throw new ApiError("Visit date must be a valid date", 400);
  }

  const normalizedTime = validateVisitTime(timeStr, { required: true });
  const visitDateTime = toSaudiDateTime(dateKey, normalizedTime);
  if (!visitDateTime) {
    throw new ApiError("Visit date and time are invalid", 400);
  }

  const currentSaudi = getCurrentSaudiDateTime(now);
  const currentSaudiDt = toSaudiDateTime(
    currentSaudi.dateKey,
    currentSaudi.time,
  );

  if (visitDateTime.getTime() > currentSaudiDt.getTime()) {
    throw new ApiError(
      "Historical visits cannot be recorded for a future date or time",
      400,
    );
  }

  return {
    dateKey,
    time: normalizedTime,
    visitDateTime,
  };
}

export function buildVisitReportDateFilter(query = {}) {
  const { fromDate, toDate, date } = query;

  if (date && !fromDate && !toDate) {
    const bounds = getSaudiDayBounds(date);
    if (!bounds) throw new ApiError("Invalid date filter", 400);
    return { gte: bounds.start, lte: bounds.end };
  }

  if (!fromDate && !toDate) return undefined;

  const fromBounds = fromDate ? getSaudiDayBounds(fromDate) : null;
  const toBounds = toDate ? getSaudiDayBounds(toDate) : null;

  if (fromDate && !fromBounds) {
    throw new ApiError("Invalid fromDate filter", 400);
  }
  if (toDate && !toBounds) {
    throw new ApiError("Invalid toDate filter", 400);
  }
  if (fromBounds && toBounds && fromBounds.key > toBounds.key) {
    throw new ApiError("fromDate cannot be after toDate", 400);
  }

  return {
    ...(fromBounds ? { gte: fromBounds.start } : {}),
    ...(toBounds ? { lte: toBounds.end } : {}),
  };
}
