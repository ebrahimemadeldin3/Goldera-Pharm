import { VisitApiResponse } from "@/features/visits/lib/types/api";
import { Visit } from "@/features/visits/lib/types/ui";
import { VisitStatus } from "@/lib/types";
import { isSameCalendarDate, parseDateValue } from "@/lib/utils";
import {
  VISIT_STATUS_LABELS,
  VISIT_DEFAULTS,
} from "@/features/visits/lib/constants";

/**
 * Transform API visit response to UI Visit type
 * @param apiVisit - Visit data from API
 * @returns Transformed visit for UI display
 */
export function transformVisitApiResponse(apiVisit: VisitApiResponse): Visit {
  const visitDate = parseDateValue(apiVisit.date);
  const doctorName =
    apiVisit.doctor.nameEN ||
    apiVisit.doctor.nameAR ||
    apiVisit.doctor.name ||
    "Unknown Doctor";
  const normalizedSamples = (apiVisit.samples || []).map((sample) => {
    if (typeof sample === "string") {
      return sample;
    }

    return sample.name || sample.title || sample.id || "Unnamed sample";
  });

  return {
    id: apiVisit.id,
    date: visitDate,
    person: doctorName,
    place: VISIT_DEFAULTS.PLACE,
    timeLabel: apiVisit.time,
    duration: VISIT_DEFAULTS.DURATION,
    status: apiVisit.status,
    statusLabel: VISIT_STATUS_LABELS[apiVisit.status] || apiVisit.status,
    badge: VISIT_DEFAULTS.BADGE,
    notes: apiVisit.notes || undefined,
    createdBy: apiVisit.createdBy.name,
    samples: normalizedSamples,
    visitType: apiVisit.visitType,
    doctorId: apiVisit.doctorId,
    userId: apiVisit.userId,
    doctorNameEN: apiVisit.doctor.nameEN,
    doctorNameAR: apiVisit.doctor.nameAR,
    createdById: apiVisit.createdBy.id,
    createdAt: apiVisit.createdAt,
    updatedAt: apiVisit.updatedAt,
  };
}

/**
 * Get status label for a given visit status
 * @param status - Visit status enum value
 * @returns Human-readable status label
 */
export function getStatusLabel(status: VisitStatus): string {
  return VISIT_STATUS_LABELS[status] || status;
}

/**
 * Format visit time for display
 * @param time - Time string (e.g., "11:00")
 * @returns Formatted time string
 */
export function formatVisitTime(time: string): string {
  // For now, return as-is. Can be enhanced to convert to 12-hour format with AM/PM
  return time;
}

/**
 * Check if a visit is upcoming
 * @param visit - Visit object
 * @returns True if visit is in the future
 */
export function isUpcomingVisit(visit: Visit): boolean {
  const now = new Date();
  return visit.date > now && visit.status === "SCHEDULED";
}

/**
 * Check if a visit is today
 * @param visit - Visit object
 * @returns True if visit is today
 */
export function isVisitToday(visit: Visit): boolean {
  const today = new Date();
  return isSameCalendarDate(visit.date, today);
}
