import { VisitStatus } from "@/lib/types";

/**
 * Available 15-minute time slots for visit scheduling (00:00 through 23:45)
 */
export const HOURS: string[] = Array.from({ length: 24 * 4 }, (_, index) => {
  const hour = String(Math.floor(index / 4)).padStart(2, "0");
  const minute = String((index % 4) * 15).padStart(2, "0");
  return `${hour}:${minute}`;
});

/**
 * Standard 15-minute increment duration options (15 min through 8 hours)
 */
export const VISIT_DURATION_OPTIONS: string[] = [
  15, 30, 45, 60, 75, 90, 105, 120, 150, 180, 240, 300, 360, 420, 480,
].map((mins) => `${mins} min`);

export const VISIT_COMPANION_LABELS = {
  SINGLE: "Single Visit",
  WITH_MANAGER: "Joint Visit",
  UNKNOWN: "Unknown",
} as const;

export const VISIT_CREATION_SOURCE_LABELS = {
  SCHEDULED: "Scheduled",
  MANUAL_HISTORY: "Historical Entry",
} as const;

/**
 * Visit status label mappings for UI display
 */
export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
} as const;

/**
 * Visit status colors for UI styling
 */
export const VISIT_STATUS_COLORS = {
  COMPLETED: {
    bg: "bg-light-green-gradiant border-green-stroke",
    badge: "bg-dashboard-green",
    text: "text-green-900",
  },
  SCHEDULED: {
    bg: "bg-light-orange-gradiant border-orange-stroke",
    badge: "bg-gold",
    text: "text-yellow-900",
  },
  CANCELLED: {
    bg: "bg-light-red-gradiant border-red-stroke",
    badge: "bg-dashboard-red",
    text: "text-red-900",
  },
  IN_PROGRESS: {
    bg: "bg-light-blue-gradiant border-blue-stroke",
    badge: "bg-dashboard-blue",
    text: "text-blue-900",
  },
} as const;

/**
 * Default placeholder values for missing data
 */
export const VISIT_DEFAULTS = {
  PLACE: "",
  DURATION: "",
  BADGE: undefined,
} as const;
