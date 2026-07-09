import { UserRole } from "@/lib/types";

export const roleThemeMap: Record<
  UserRole,
  {
    "system-primary": string;
    "system-gradient-from": string;
    "system-gradient-to": string;
    "system-primary-stroke": string;
    "system-primary-light": string;
  }
> = {
  MANAGER: {
    "system-primary": "#c9a961", // Gold for manager
    "system-gradient-from": "#C9A961",
    "system-gradient-to": "#987B3B",
    "system-primary-stroke": "#f9e9b8",
    "system-primary-light": "#fef9e7",
  },
  SUPERVISOR: {
    "system-primary": "#2563eb", // Blue for supervisor
    "system-gradient-from": "#2563EB",
    "system-gradient-to": "#1E3A8A",
    "system-primary-stroke": "#dbeafe",
    "system-primary-light": "#ebf1ff",
  },
  MEDICAL_REP: {
    "system-primary": "#10B981", // Green for medical rep
    "system-gradient-from": "#10B981",
    "system-gradient-to": "#1E8A35",
    "system-primary-stroke": "#bbf7d0",
    "system-primary-light": "#e7fff7",
  },
};
