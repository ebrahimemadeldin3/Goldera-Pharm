import { UserRole } from "@/lib/types";

export const roleThemeMap: Record<UserRole, Record<string, string>> = {
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
    "system-primary": "#168557", // Rep green
    "system-gradient-from": "#168557",
    "system-gradient-to": "#107349",
    "system-primary-stroke": "#CBEFDD",
    "system-primary-light": "#E9F8F1",
    "nav-border": "#E5E8EF",
    "nav-hover": "rgba(22, 133, 87, 0.08)",
    "nav-active": "#E9F8F1",
    "nav-active-gradient":
      "linear-gradient(90deg, rgba(22, 133, 87, 0.14) 0%, rgba(22, 133, 87, 0.05) 55%, rgba(22, 133, 87, 0) 100%)",
    "nav-active-text": "#168557",
    "nav-active-icon": "#168557",
    "brand-gold": "#168557",
    "brand-gold-dark": "#107349",
    "brand-gold-soft": "#E9F8F1",
    "auth-gold": "#168557",
    "auth-gold-dark": "#107349",
    "auth-gold-soft": "#E9F8F1",
    "gp-gold-50": "#E9F8F1",
    "gp-gold-100": "#E9F8F1",
    "gp-gold-300": "#CBEFDD",
    "gp-gold-500": "#168557",
    "gp-gold-600": "#107349",
    "gp-gold-700": "#0a5233",
    "gp-surface-hover": "#E9F8F1",
    "gp-shadow-gold-action": "0 10px 24px rgba(22, 133, 87, 0.28)",
  },
};
