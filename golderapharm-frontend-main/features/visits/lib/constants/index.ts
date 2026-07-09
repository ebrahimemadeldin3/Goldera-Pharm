import { VisitStatus } from "@/lib/types";

/**
 * Available time slots for visit scheduling
 */
export const HOURS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
] as const;

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
