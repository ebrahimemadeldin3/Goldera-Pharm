import {
  Briefcase,
  CalendarDays,
  CircleCheckBig,
  CircleX,
  ClipboardList,
  Clock,
  DollarSign,
  Megaphone,
  PackageSearch,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RequestStatus, RequestType, RequestUrgency } from "@/lib/types";
import { format } from "date-fns";

type StatusTabId = "all" | "PENDING" | "APPROVED" | "REJECTED";

const STATUS_TABS: {
  id: StatusTabId;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "all", label: "All Requests", icon: ClipboardList },
  { id: "PENDING", label: "Pending", icon: Clock },
  { id: "APPROVED", label: "Approved", icon: CircleCheckBig },
  { id: "REJECTED", label: "Rejected", icon: CircleX },
];

const requestTypeMeta: Record<
  RequestType,
  { label: string; description: string; icon: LucideIcon }
> = {
  EXPENSE: { label: "Expense", description: "Expense Request", icon: DollarSign },
  MARKETING: { label: "Marketing", description: "Marketing Request", icon: Megaphone },
  SAMPLE: { label: "Sample", description: "Sample Request", icon: PackageSearch },
  LEAVE: { label: "Leave", description: "Leave Request", icon: CalendarDays },
  PERSONAL_EXPENSE: {
    label: "Personal Expense",
    description: "Personal Expense Request",
    icon: Briefcase,
  },
};

const statusBadgeTone: Record<RequestStatus, string> = {
  PENDING: "text-gp-warning border-gp-warning-border bg-gp-warning-soft",
  APPROVED: "text-gp-success border-gp-success-border bg-gp-success-soft",
  REJECTED: "text-gp-danger border-gp-danger-border bg-gp-danger-soft",
};

const statusDotTone: Record<RequestStatus, string> = {
  PENDING: "bg-gp-warning",
  APPROVED: "bg-gp-success",
  REJECTED: "bg-gp-danger",
};

const statusAccentTone: Record<RequestStatus, string> = {
  PENDING: "bg-gp-warning",
  APPROVED: "bg-gp-success",
  REJECTED: "bg-gp-danger",
};

const urgencyBadgeTone: Record<RequestUrgency, string> = {
  low: "text-gp-text-muted border-gp-border-default bg-gp-surface-subtle",
  medium: "text-gp-warning border-gp-warning-border bg-gp-warning-soft",
  high: "text-gp-danger border-gp-danger-border bg-gp-danger-soft",
  priority: "text-gp-danger border-gp-danger-border bg-gp-danger-soft",
};

const urgencyDotTone: Record<RequestUrgency, string> = {
  low: "bg-gp-text-placeholder",
  medium: "bg-gp-warning",
  high: "bg-gp-danger",
  priority: "bg-gp-danger",
};

const EMPTY_VALUE = "—";

function isBlank(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  return false;
}

function renderValue(value: unknown): string {
  return isBlank(value) ? EMPTY_VALUE : String(value);
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return EMPTY_VALUE;
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch {
    return "Invalid date";
  }
}

function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return EMPTY_VALUE;
  try {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  } catch {
    return "Invalid date";
  }
}

function formatMoney(value: number | null | undefined): string {
  if (isBlank(value)) return EMPTY_VALUE;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function shortId(id: string | undefined): string {
  if (!id) return EMPTY_VALUE;
  return id.length > 16 ? `${id.slice(0, 12)}…${id.slice(-4)}` : id;
}

export {
  EMPTY_VALUE,
  STATUS_TABS,
  requestTypeMeta,
  statusBadgeTone,
  statusDotTone,
  statusAccentTone,
  urgencyBadgeTone,
  urgencyDotTone,
  isBlank,
  renderValue,
  formatDate,
  formatDateTime,
  formatMoney,
  shortId,
};
export type { StatusTabId };
