"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { DateRange } from "react-day-picker";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileClock,
  Package,
  Search,
  SlidersHorizontal,
  Stethoscope,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Warehouse,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChartContainer } from "@/components/ui/chart";
import { cn, formatDateOnly, getInitials, parseDateValue } from "@/lib/utils";
import { getSaleDateValue } from "@/features/sales/lib/utils";
import type { SaleApiResponse } from "@/features/sales/lib/types";
import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import type { PharmacyApiResponse } from "@/features/pharmacies/lib/types";
import type { TRequest } from "@/features/requests/lib/types";
import type { User } from "@/features/team/lib/types";
import type { VisitPlan } from "@/features/plan/api/get";
import type { VisitReport } from "@/features/reports/lib/types";
import type { ForecastManagement } from "@/features/forecast/lib/types/management";
import type { Review } from "@/features/appraisal/lib/types";
import type { ManagerDashboardData } from "../../lib/types";

type DashboardVisit = {
  id: string;
  date: string;
  status: string;
  doctorId: string;
  userId: string;
  createdBy: string;
  createdById: string;
};

type DashboardRangePreset =
  | "today"
  | "week"
  | "month"
  | "lastMonth"
  | "last3"
  | "last6"
  | "year"
  | "custom";

type DateRangeValue = {
  from: Date;
  to: Date;
};

type DashboardStatusFilter = "all" | "pending" | "completed" | "approved";
type TeamSort = "sales" | "visits" | "name";
type SalesGranularity = "auto" | "daily" | "monthly";

type ManagerDashboardProps = {
  userName: string;
  dashboardData: ManagerDashboardData | null;
  sales: SaleApiResponse[];
  visits: DashboardVisit[];
  doctors: DoctorApiResponse[];
  pharmacies: PharmacyApiResponse[];
  requests: TRequest[];
  teamMembers: User[];
  plans: VisitPlan[];
  reports: VisitReport[];
  forecasts: ForecastManagement[];
  appraisals: Review[];
  errors: string[];
};

const SAR_FORMATTER = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const COMPACT_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const NAVY = "#101D36";
const NAVY_MUTED = "#344054";
const GOLD = "#C9A44C";
const GOLD_DARK = "#B18732";
const GOLD_SOFT = "#E9DDB8";
const GRID = "#EEF1F6";
const SUCCESS = "#168557";
const DANGER = "#B42318";
const WARNING = "#F59E0B";

const quickActions = [
  {
    title: "Add Team Member",
    desc: "Register a new representative",
    icon: Users,
    href: "/manager/team?openDialog=true",
  },
  {
    title: "Schedule Visit",
    desc: "Plan a field visit",
    icon: CalendarClock,
    href: "/manager/visits/add",
  },
  {
    title: "View Reports",
    desc: "Review visit quality",
    icon: ClipboardCheck,
    href: "/manager/reports",
  },
  {
    title: "Manage Forecast",
    desc: "Review forecast submissions",
    icon: Target,
    href: "/manager/forecast",
  },
];

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function monthStart(date: Date) {
  return startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
}

function monthEnd(date: Date) {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function getPresetRange(preset: DashboardRangePreset): DateRangeValue {
  const today = startOfDay(new Date());

  if (preset === "today") {
    return { from: today, to: endOfDay(today) };
  }

  if (preset === "week") {
    const from = addDays(today, -today.getDay());
    return { from, to: endOfDay(addDays(from, 6)) };
  }

  if (preset === "lastMonth") {
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    return { from: monthStart(lastMonth), to: monthEnd(lastMonth) };
  }

  if (preset === "last3") {
    return {
      from: monthStart(new Date(today.getFullYear(), today.getMonth() - 2, 1)),
      to: endOfDay(today),
    };
  }

  if (preset === "last6") {
    return {
      from: monthStart(new Date(today.getFullYear(), today.getMonth() - 5, 1)),
      to: endOfDay(today),
    };
  }

  if (preset === "year") {
    return {
      from: startOfDay(new Date(today.getFullYear(), 0, 1)),
      to: endOfDay(new Date(today.getFullYear(), 11, 31)),
    };
  }

  return { from: monthStart(today), to: monthEnd(today) };
}

function parseMaybeDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  const parsed = value instanceof Date ? value : parseDateValue(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isWithinRange(value: string | Date | null | undefined, range: DateRangeValue) {
  const parsed = parseMaybeDate(value);
  if (!parsed) return false;
  return parsed >= range.from && parsed <= range.to;
}

function overlapsRange(
  start: string | Date | undefined,
  end: string | Date | undefined,
  range: DateRangeValue,
) {
  const parsedStart = parseMaybeDate(start);
  const parsedEnd = parseMaybeDate(end) ?? parsedStart;
  if (!parsedStart || !parsedEnd) return false;
  return parsedStart <= range.to && parsedEnd >= range.from;
}

function previousRange(range: DateRangeValue): DateRangeValue {
  const days =
    Math.max(1, Math.round((range.to.getTime() - range.from.getTime()) / 86400000)) +
    1;
  const to = endOfDay(addDays(range.from, -1));
  return {
    from: startOfDay(addDays(to, -days + 1)),
    to,
  };
}

function formatCurrency(value: number) {
  return `${SAR_FORMATTER.format(value || 0)} SAR`;
}

function formatCompactCurrency(value: number) {
  if (!value) return "0 SAR";
  return `${COMPACT_FORMATTER.format(value)} SAR`;
}

function selectedSalesRecordLabel(count: number) {
  return `${count.toLocaleString()} ${count === 1 ? "record" : "records"}`;
}

function formatDateLabel(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function formatMonthLabel(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(value);
}

function matchesSearch(values: unknown[], query: string) {
  const term = query.trim().toLowerCase();
  if (!term) return true;

  return values.some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(term),
  );
}

function normalizeRating(value: string) {
  const rating = Number.parseFloat(value);
  return Number.isFinite(rating) ? rating : 0;
}

function sumSales(sales: SaleApiResponse[]) {
  return sales.reduce((sum, sale) => sum + (Number(sale.untaxedTotal) || 0), 0);
}

function getSalesInRange(sales: SaleApiResponse[], range: DateRangeValue) {
  return sales.filter((sale) => isWithinRange(getSaleDateValue(sale), range));
}

function getPeriodDays(range: DateRangeValue) {
  return Math.max(1, Math.round((range.to.getTime() - range.from.getTime()) / 86400000));
}

function buildTimeSeries<T>(
  items: T[],
  range: DateRangeValue,
  getDate: (item: T) => string | Date | null | undefined,
  getValue: (item: T) => number,
  granularity: SalesGranularity = "auto",
) {
  const byMonth =
    granularity === "monthly" ||
    (granularity === "auto" && getPeriodDays(range) > 62);
  const grouped = new Map<string, { label: string; value: number; date: Date }>();

  items.forEach((item) => {
    const date = parseMaybeDate(getDate(item));
    if (!date) return;

    const key = byMonth
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      : formatDateOnly(date);
    const label = byMonth ? formatMonthLabel(date) : formatDateLabel(date);
    const current = grouped.get(key) ?? { label, value: 0, date };

    current.value += getValue(item);
    grouped.set(key, current);
  });

  return Array.from(grouped.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ label, value }) => ({ label, value }));
}

function buildSalesTimeSeries(
  sales: SaleApiResponse[],
  range: DateRangeValue,
  granularity: SalesGranularity = "auto",
) {
  const byMonth =
    granularity === "monthly" ||
    (granularity === "auto" && getPeriodDays(range) > 62);
  const grouped = new Map<
    string,
    {
      label: string;
      value: number;
      date: Date;
      orders: Set<string>;
      products: Map<string, number>;
    }
  >();

  sales.forEach((sale) => {
    const date = parseMaybeDate(getSaleDateValue(sale));
    if (!date) return;

    const key = byMonth
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      : formatDateOnly(date);
    const label = byMonth ? formatMonthLabel(date) : formatDateLabel(date);
    const current =
      grouped.get(key) ??
      {
        label,
        value: 0,
        date,
        orders: new Set<string>(),
        products: new Map<string, number>(),
      };
    const value = Number(sale.untaxedTotal) || 0;
    const productName =
      sale.product?.name ||
      (typeof sale.productVariant === "string" ? sale.productVariant : "") ||
      "Unmapped product";

    current.value += value;
    if (sale.order) current.orders.add(String(sale.order));
    current.products.set(productName, (current.products.get(productName) ?? 0) + value);
    grouped.set(key, current);
  });

  return Array.from(grouped.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ label, value, orders, products }) => {
      const topProduct =
        Array.from(products.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";

      return {
        label,
        value,
        orders: orders.size,
        topProduct,
      };
    });
}

function statusBadgeClass(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("approved") || normalized.includes("completed")) {
    return "border-gp-success-border bg-gp-success-soft text-gp-success";
  }

  if (normalized.includes("rejected") || normalized.includes("cancelled")) {
    return "border-gp-danger-border bg-gp-danger-soft text-gp-danger";
  }

  return "border-gp-warning-border bg-gp-warning-soft text-gp-warning";
}

function CountUp({
  value,
  formatter = (next) => COMPACT_FORMATTER.format(next),
}: {
  value: number;
  formatter?: (value: number) => string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    if (reduceMotion.matches) {
      frame = window.requestAnimationFrame(() => setDisplayValue(value));
      return;
    }

    const duration = 760;
    const startedAt = performance.now();

    const tick = (time: number) => {
      const progress = Math.min(1, (time - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * eased);

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  return <>{formatter(displayValue)}</>;
}

function DashboardCard({
  children,
  className,
  interactive = false,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  delay?: number;
}) {
  return (
    <section
      className={cn(
        "manager-dashboard-card border-gp-border-default bg-gp-surface-card shadow-gp-card rounded-[16px] border",
        interactive && "manager-dashboard-interactive",
        className,
      )}
      style={{ "--manager-dashboard-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </section>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  eyebrow,
  action,
}: {
  icon: LucideIcon;
  title: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex min-w-0 items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="bg-gp-gold-50 text-gp-gold-700 border-gp-gold-300 flex size-10 shrink-0 items-center justify-center rounded-[10px] border">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-gp-text-muted text-[11px] leading-4 font-semibold tracking-[0.04em] uppercase">
              {eyebrow}
            </p>
          )}
          <h2 className="text-gp-navy-900 truncate text-lg leading-6 font-semibold">
            {title}
          </h2>
        </div>
      </div>
      {action}
    </header>
  );
}

function EmptyState({ title, icon: Icon = AlertCircle }: { title: string; icon?: LucideIcon }) {
  return (
    <div className="border-gp-border-subtle bg-gp-surface-subtle flex min-h-32 flex-col items-center justify-center rounded-[14px] border border-dashed px-4 py-6 text-center">
      <Icon className="text-gp-gold-600 size-5" aria-hidden="true" />
      <p className="text-gp-text-muted mt-2 text-sm font-medium">{title}</p>
    </div>
  );
}

type DashboardTooltipPayload = {
  name?: string | number;
  dataKey?: string | number;
  value?: unknown;
  color?: string;
  payload?: Record<string, unknown>;
};

function DashboardTooltip({
  active,
  payload,
  label,
  valueFormatter = (value) => String(value),
  details,
}: {
  active?: boolean;
  payload?: DashboardTooltipPayload[];
  label?: string | number;
  valueFormatter?: (value: number, name?: string) => string;
  details?: (payload: Record<string, unknown>) => [string, ReactNode][];
}) {
  if (!active || !payload?.length) return null;

  const firstPayload = payload[0]?.payload ?? {};

  return (
    <div className="manager-dashboard-tooltip rounded-[12px] border border-white/10 bg-gp-navy-900 px-3 py-2.5 text-white shadow-[0_18px_38px_rgba(16,29,54,0.26)]">
      {label && (
        <p className="mb-2 border-b border-white/10 pb-2 text-sm font-semibold text-gp-gold-300">
          {label}
        </p>
      )}
      <div className="space-y-1.5">
        {payload.map((entry) => (
          <div
            key={`${entry.dataKey ?? entry.name}-${entry.value}`}
            className="flex min-w-[180px] items-center justify-between gap-4 text-xs"
          >
            <span className="inline-flex items-center gap-2 font-medium text-white/70">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: entry.color || GOLD }}
              />
              {String(entry.name ?? entry.dataKey ?? "Value")}
            </span>
            <span className="font-semibold tabular-nums text-white">
              {valueFormatter(
                Number(entry.value) || 0,
                entry.name === undefined ? undefined : String(entry.name),
              )}
            </span>
          </div>
        ))}
        {details?.(firstPayload).map(([name, value]) => (
          <div
            key={name}
            className="flex min-w-[180px] items-center justify-between gap-4 text-xs"
          >
            <span className="font-medium text-white/70">{name}</span>
            <span className="text-right font-semibold text-white">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardFilters({
  query,
  status,
  onQueryChange,
  onStatusChange,
}: {
  query: string;
  status: DashboardStatusFilter;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: DashboardStatusFilter) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
      <label className="relative min-w-0 flex-1 lg:w-72 lg:flex-none">
        <span className="sr-only">Search dashboard</span>
        <Search
          className="text-gp-text-placeholder pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search dashboard..."
          className="border-gp-border-control bg-gp-surface-card text-gp-navy-900 placeholder:text-gp-text-placeholder focus:border-gp-gold-500 focus:ring-gp-gold-500/10 h-11 w-full rounded-[10px] border pr-3 pl-9 text-sm font-medium shadow-none outline-none transition-[border-color,box-shadow,background-color] duration-[180ms] focus:ring-3"
        />
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="manager-date-trigger border-gp-border-control bg-gp-surface-card text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-surface-hover focus-visible:ring-gp-gold-500/20 inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border px-3 text-sm font-semibold shadow-none focus-visible:ring-3 focus-visible:outline-none"
          >
            <SlidersHorizontal className="text-gp-gold-600 size-4" />
            Filters
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-[min(calc(100vw-24px),280px)] rounded-[16px] border-gp-border-default bg-white p-3 shadow-gp-popover"
        >
          <p className="text-gp-navy-900 text-sm font-semibold">
            Status Focus
          </p>
          <div className="mt-3 grid gap-2">
            {[
              ["all", "All activity"],
              ["pending", "Pending attention"],
              ["completed", "Completed visits"],
              ["approved", "Approved work"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onStatusChange(value as DashboardStatusFilter)}
                className={cn(
                  "focus-visible:ring-gp-gold-500/20 h-9 rounded-[10px] px-3 text-left text-sm font-semibold transition-[background-color,color] duration-[170ms] focus-visible:ring-2 focus-visible:outline-none",
                  status === value
                    ? "bg-gp-navy-900 text-white"
                    : "text-gp-text-secondary hover:bg-gp-gold-50 hover:text-gp-gold-700",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function DashboardDateFilter({
  preset,
  range,
  onChange,
}: {
  preset: DashboardRangePreset;
  range: DateRangeValue;
  onChange: (preset: DashboardRangePreset, range: DateRangeValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>({
    from: range.from,
    to: range.to,
  });

  const options: { id: DashboardRangePreset; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "lastMonth", label: "Last Month" },
    { id: "last3", label: "Last 3 Months" },
    { id: "last6", label: "Last 6 Months" },
    { id: "year", label: "This Year" },
  ];

  const label =
    preset === "custom"
      ? `${formatDateLabel(range.from)} - ${formatDateLabel(range.to)}`
      : (options.find((option) => option.id === preset)?.label ?? "This Month");

  function applyPreset(nextPreset: DashboardRangePreset) {
    const nextRange = getPresetRange(nextPreset);
    setDraft({ from: nextRange.from, to: nextRange.to });
    onChange(nextPreset, nextRange);
    setOpen(false);
  }

  function applyCustom() {
    if (!draft?.from) return;
    const from = startOfDay(draft.from);
    const to = endOfDay(draft.to ?? draft.from);
    onChange("custom", from <= to ? { from, to } : { from: to, to: from });
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="manager-date-trigger border-gp-border-control bg-gp-surface-card text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-surface-hover focus-visible:ring-gp-gold-500/20 inline-flex h-11 w-full items-center justify-between gap-3 rounded-[10px] border px-3 text-sm font-semibold shadow-none transition-[border-color,background-color,box-shadow] duration-[180ms] focus-visible:ring-3 focus-visible:outline-none sm:w-auto"
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <CalendarClock
              className="text-gp-gold-600 size-4 shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">{label}</span>
          </span>
          <ChevronRight
            className={cn(
              "text-gp-text-muted size-4 rotate-90 transition-transform duration-[180ms]",
              open && "-rotate-90",
            )}
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(calc(100vw-24px),430px)] overflow-hidden rounded-[16px] border-gp-border-default bg-white p-0 shadow-gp-popover">
        <div className="grid gap-2 p-3 sm:grid-cols-2">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => applyPreset(option.id)}
              className={cn(
                "focus-visible:ring-gp-gold-500/20 h-10 rounded-[10px] px-3 text-left text-sm font-semibold transition-[background-color,color,transform] duration-[170ms] focus-visible:ring-2 focus-visible:outline-none",
                preset === option.id
                  ? "bg-gp-navy-900 text-white"
                  : "text-gp-text-secondary hover:bg-gp-gold-50 hover:text-gp-gold-700",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="border-gp-border-subtle border-t p-4">
          <p className="text-gp-navy-900 text-sm font-semibold">
            Custom Range
          </p>
          <Calendar
            mode="range"
            selected={draft}
            onSelect={setDraft}
            className="mt-3 p-0"
          />
          <button
            type="button"
            onClick={applyCustom}
            disabled={!draft?.from}
            className="bg-gp-gold-500 hover:bg-gp-gold-600 focus-visible:ring-gp-gold-500/25 mt-3 h-10 w-full rounded-[10px] px-3 text-sm font-semibold text-white transition-[background-color,transform] duration-[170ms] hover:-translate-y-px focus-visible:ring-3 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            Apply Custom Range
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  helper,
  formatter,
  href,
  delay,
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  helper: string;
  formatter?: (value: number) => string;
  href?: string;
  delay: number;
  trend?: { value: number; direction: "up" | "down" };
}) {
  const valueLabel = formatter ? formatter(value) : COMPACT_FORMATTER.format(value);
  const card = (
    <DashboardCard
      interactive={Boolean(href)}
      delay={delay}
      className="manager-kpi-card group relative p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-gp-text-muted text-[11px] leading-4 font-semibold tracking-[0.04em] uppercase">
            {label}
          </p>
          <p className="text-gp-navy-900 mt-2 text-[24px] leading-7 font-semibold tabular-nums">
            <CountUp value={value} formatter={formatter} />
          </p>
          <p className="text-gp-text-muted mt-2 text-xs font-medium">
            {helper}
          </p>
        </div>
        <span className="manager-kpi-icon border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-11 shrink-0 items-center justify-center rounded-[12px] border">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold",
              trend.direction === "up"
                ? "border-gp-success-border bg-gp-success-soft text-gp-success"
                : "border-gp-danger-border bg-gp-danger-soft text-gp-danger",
            )}
          >
            {trend.direction === "up" ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {Math.abs(trend.value).toFixed(1)}%
          </span>
          <span className="text-gp-text-placeholder text-xs font-medium">
            vs previous period
          </span>
        </div>
      )}
      <div className="manager-kpi-popover border-gp-border-default pointer-events-none absolute top-full right-3 left-3 z-20 mt-2 rounded-[12px] border bg-white px-3 py-2.5 opacity-0 shadow-[0_12px_28px_rgba(16,29,54,0.12)]">
        <p className="text-gp-navy-900 text-sm font-semibold">{label}</p>
        <div className="mt-2 space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="text-gp-text-muted font-medium">Current</span>
            <span className="text-gp-navy-900 font-semibold">{valueLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-gp-text-muted font-medium">Context</span>
            <span className="text-gp-navy-900 text-right font-semibold">
              {helper}
            </span>
          </div>
          {trend && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-gp-text-muted font-medium">Trend</span>
              <span
                className={cn(
                  "font-semibold",
                  trend.direction === "up" ? "text-gp-success" : "text-gp-danger",
                )}
              >
                {trend.direction === "up" ? "+" : "-"}
                {Math.abs(trend.value).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </DashboardCard>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}

function SalesPerformance({
  sales,
  previousSales,
  range,
}: {
  sales: SaleApiResponse[];
  previousSales: SaleApiResponse[];
  range: DateRangeValue;
}) {
  const [granularity, setGranularity] = useState<SalesGranularity>("auto");
  const currentSeries = buildSalesTimeSeries(sales, range, granularity);
  const previousSeries = buildSalesTimeSeries(
    previousSales,
    previousRange(range),
    granularity,
  );
  const chartData = currentSeries.map((point, index) => ({
    ...point,
    previousLabel: previousSeries[index]?.label ?? "Previous period",
    previousValue: previousSeries[index]?.value ?? 0,
  }));
  const currentTotal = sumSales(sales);
  const previousTotal = sumSales(previousSales);
  const delta =
    previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : null;

  return (
    <DashboardCard className="p-5 lg:col-span-8" delay={280}>
      <SectionHeader
        icon={BarChart3}
        title="Sales Performance"
        eyebrow="Commercial"
        action={
          <div className="flex items-center gap-2">
            <select
              value={granularity}
              onChange={(event) =>
                setGranularity(event.target.value as SalesGranularity)
              }
              aria-label="Sales chart aggregation"
              className="border-gp-border-control bg-gp-surface-card text-gp-navy-900 focus:border-gp-gold-500 focus:ring-gp-gold-500/10 h-9 rounded-[10px] border px-2 text-xs font-semibold outline-none focus:ring-2"
            >
              <option value="auto">Auto</option>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
            <Link
              href="/manager/sales"
              className="manager-link text-gp-gold-700 inline-flex items-center gap-1 text-sm font-semibold"
            >
              View Sales
              <ChevronRight className="size-4" />
            </Link>
          </div>
        }
      />

      {chartData.length === 0 ? (
        <div className="mt-5">
          <EmptyState title="No sales data for the selected period" icon={BarChart3} />
        </div>
      ) : (
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_180px]">
          <ChartContainer
            config={{
              value: { label: "Sales", color: NAVY },
              previousValue: { label: "Previous", color: GOLD },
            }}
            className="h-[310px] w-full"
          >
            <BarChart data={chartData} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="4 4" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={12} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={58}
                tickFormatter={(value) => `${Math.round(Number(value) / 1000)}K`}
              />
              <Tooltip
                cursor={{ fill: "rgba(201,164,76,0.10)" }}
                content={(props) => (
                  <DashboardTooltip
                    {...props}
                    valueFormatter={(value) => formatCurrency(value)}
                    details={(entry) => [
                      ["Orders", Number(entry.orders ?? 0).toLocaleString()],
                      ["Top Product", String(entry.topProduct ?? "N/A")],
                      [
                        "Previous",
                        Number(entry.previousValue ?? 0) > 0
                          ? formatCompactCurrency(Number(entry.previousValue))
                          : "No data",
                      ],
                      [
                        "Variance",
                        Number(entry.previousValue ?? 0) > 0
                          ? `${(
                              ((Number(entry.value ?? 0) -
                                Number(entry.previousValue ?? 0)) /
                                Number(entry.previousValue)) *
                              100
                            ).toFixed(1)}%`
                          : "N/A",
                      ],
                    ]}
                  />
                )}
              />
              {previousTotal > 0 && (
                <Bar
                  name="Previous"
                  dataKey="previousValue"
                  fill={GOLD}
                  opacity={0.42}
                  radius={[8, 8, 0, 0]}
                  animationDuration={620}
                />
              )}
              <Bar
                name="Sales"
                dataKey="value"
                fill={NAVY}
                radius={[8, 8, 0, 0]}
                animationDuration={720}
              />
            </BarChart>
          </ChartContainer>

          <div className="border-gp-border-subtle bg-gp-surface-subtle rounded-[14px] border p-4">
            <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.04em] uppercase">
              Current Period
            </p>
            <p className="text-gp-navy-900 mt-2 text-2xl leading-7 font-semibold">
              {formatCompactCurrency(currentTotal)}
            </p>
            <div className="border-gp-border-subtle mt-4 border-t pt-4">
              <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.04em] uppercase">
                Previous Period
              </p>
              <p className="text-gp-text-secondary mt-2 text-lg font-semibold">
                {formatCompactCurrency(previousTotal)}
              </p>
              {delta !== null && (
                <span
                  className={cn(
                    "mt-3 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold",
                    delta >= 0
                      ? "border-gp-success-border bg-gp-success-soft text-gp-success"
                      : "border-gp-danger-border bg-gp-danger-soft text-gp-danger",
                  )}
                >
                  {delta >= 0 ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {Math.abs(delta).toFixed(1)}%
                </span>
              )}
            </div>
            <div className="border-gp-border-subtle mt-4 border-t pt-4">
              <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.04em] uppercase">
                Orders
              </p>
              <p className="text-gp-text-secondary mt-2 text-lg font-semibold">
                {selectedSalesRecordLabel(sales.length)}
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}

function SalesByRegion({
  sales,
  pharmacies,
}: {
  sales: SaleApiResponse[];
  pharmacies: PharmacyApiResponse[];
}) {
  const regionByPharmacy = new Map(
    pharmacies.map((pharmacy) => [pharmacy.name, pharmacy.region || "Unknown"]),
  );
  const grouped = new Map<
    string,
    { value: number; orders: Set<string>; products: Map<string, number> }
  >();

  sales.forEach((sale) => {
    const region = regionByPharmacy.get(String(sale.customer ?? "")) ?? "Unknown";
    const current =
      grouped.get(region) ?? {
        value: 0,
        orders: new Set<string>(),
        products: new Map<string, number>(),
      };
    const value = Number(sale.untaxedTotal) || 0;
    const productName =
      sale.product?.name ||
      (typeof sale.productVariant === "string" ? sale.productVariant : "") ||
      "Unmapped product";

    current.value += value;
    if (sale.order) current.orders.add(String(sale.order));
    current.products.set(productName, (current.products.get(productName) ?? 0) + value);
    grouped.set(region, current);
  });

  const total = Array.from(grouped.values()).reduce(
    (sum, summary) => sum + summary.value,
    0,
  );
  const colors = [NAVY, GOLD, NAVY_MUTED, GOLD_SOFT, "#98A2B3"];
  const data = Array.from(grouped.entries())
    .map(([region, summary], index) => ({
      region,
      value: summary.value,
      orders: summary.orders.size,
      topProduct:
        Array.from(summary.products.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ??
        "N/A",
      percent: total > 0 ? (summary.value / total) * 100 : 0,
      fill: colors[index % colors.length],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((item, index) => ({ ...item, fill: colors[index % colors.length] }));

  return (
    <DashboardCard className="p-5 lg:col-span-4" delay={320}>
      <SectionHeader icon={Target} title="Sales By Region" eyebrow="Regional mix" />
      {data.length === 0 ? (
        <div className="mt-5">
          <EmptyState title="No regional sales data for this period" icon={Target} />
        </div>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-[190px_minmax(0,1fr)] lg:grid-cols-1 xl:grid-cols-[180px_minmax(0,1fr)]">
          <ChartContainer
            config={{ value: { label: "Sales", color: NAVY } }}
            className="h-[190px] w-full"
          >
            <PieChart margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
              <Tooltip
                content={(props) => (
                  <DashboardTooltip
                    {...props}
                    label={String(props.payload?.[0]?.payload?.region ?? "")}
                    valueFormatter={(value) => formatCurrency(value)}
                    details={(entry) => [
                      [
                        "Contribution",
                        typeof entry.percent === "number"
                          ? `${entry.percent.toFixed(1)}%`
                          : "N/A",
                      ],
                      ["Orders", Number(entry.orders ?? 0).toLocaleString()],
                      ["Top Product", String(entry.topProduct ?? "N/A")],
                    ]}
                  />
                )}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="region"
                innerRadius={58}
                outerRadius={82}
                paddingAngle={2}
                stroke="#FFFFFF"
                strokeWidth={3}
                animationDuration={700}
              >
                {data.map((entry) => (
                  <Cell key={entry.region} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="space-y-3">
            <div className="border-gp-border-subtle bg-gp-surface-subtle rounded-[12px] border px-3 py-2.5">
              <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.04em] uppercase">
                Total Sales
              </p>
              <p className="text-gp-navy-900 mt-1 text-xl font-semibold">
                {formatCompactCurrency(total)}
              </p>
            </div>
            {data.map((entry) => (
              <div key={entry.region} className="flex items-center gap-3">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.fill }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-gp-navy-900 truncate text-sm font-semibold">
                    {entry.region}
                  </p>
                  <p className="text-gp-text-muted text-xs font-medium">
                    {formatCompactCurrency(entry.value)}
                  </p>
                </div>
                <span className="text-gp-text-secondary text-xs font-semibold">
                  {entry.percent.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardCard>
  );
}

function TopProducts({ sales }: { sales: SaleApiResponse[] }) {
  const total = sumSales(sales);
  const productData = Array.from(
    sales.reduce((map, sale) => {
      const name =
        sale.product?.name ||
        (typeof sale.productVariant === "string" ? sale.productVariant : "") ||
        "Unmapped product";
      const current = map.get(name) ?? { value: 0, units: 0, orders: new Set<string>() };
      current.value += Number(sale.untaxedTotal) || 0;
      current.units += Number(sale.qtyOrdered) || 0;
      if (sale.order) current.orders.add(String(sale.order));
      map.set(name, current);
      return map;
    }, new Map<string, { value: number; units: number; orders: Set<string> }>()),
  )
    .map(([name, summary]) => ({
      name,
      value: summary.value,
      units: summary.units,
      orders: summary.orders.size,
      percent: total > 0 ? (summary.value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <DashboardCard className="p-5 lg:col-span-6" delay={360}>
      <SectionHeader
        icon={Package}
        title="Top Products"
        eyebrow="Product performance"
        action={
          <Link
            href="/manager/products"
            className="manager-link text-gp-gold-700 inline-flex items-center gap-1 text-sm font-semibold"
          >
            View Products
            <ChevronRight className="size-4" />
          </Link>
        }
      />
      {productData.length === 0 ? (
        <div className="mt-5">
          <EmptyState title="No product sales for this period" icon={Package} />
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {productData.map((product, index) => (
            <div
              key={product.name}
              className="manager-ranked-row group/product relative min-w-0 rounded-[12px] p-1"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="bg-gp-navy-900 text-gp-gold-500 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                    {index + 1}
                  </span>
                  <p className="text-gp-navy-900 truncate text-sm font-semibold">
                    {product.name}
                  </p>
                </div>
                <p className="text-gp-text-secondary shrink-0 text-sm font-semibold">
                  {formatCompactCurrency(product.value)}
                </p>
              </div>
              <div className="bg-gp-border-subtle mt-2 h-2 rounded-full">
                <div
                  className={cn(
                    "manager-progress-fill h-2 rounded-full",
                    index % 2 === 0 ? "bg-gp-navy-900" : "bg-gp-gold-500",
                  )}
                  style={{ width: `${Math.min(100, product.percent)}%` }}
                />
              </div>
              <p className="text-gp-text-muted mt-1 text-right text-xs font-medium">
                {product.percent.toFixed(1)}%
              </p>
              <div className="manager-product-detail pointer-events-none absolute right-2 bottom-[calc(100%-4px)] z-20 w-[min(260px,calc(100vw-48px))] rounded-[12px] border border-white/10 bg-gp-navy-900 px-3 py-2.5 text-white opacity-0 shadow-[0_18px_38px_rgba(16,29,54,0.26)]">
                <p className="truncate text-sm font-semibold text-gp-gold-300">
                  {product.name}
                </p>
                <div className="mt-2 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-white/70">Sales</span>
                    <span className="font-semibold">{formatCurrency(product.value)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-white/70">Units</span>
                    <span className="font-semibold">
                      {product.units.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-white/70">Orders</span>
                    <span className="font-semibold">
                      {product.orders.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-white/70">Contribution</span>
                    <span className="font-semibold">
                      {product.percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gp-gold-300">
                  View Products
                  <ChevronRight className="size-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}

function VisitsTrend({
  visits,
  reports,
  range,
}: {
  visits: DashboardVisit[];
  reports: VisitReport[];
  range: DateRangeValue;
}) {
  const trend = buildTimeSeries(visits, range, (visit) => visit.date, () => 1);
  const completed = visits.filter((visit) => visit.status === "COMPLETED").length;
  const avgRating =
    reports.length > 0
      ? reports.reduce((sum, report) => sum + normalizeRating(report.rating), 0) /
        reports.length
      : 0;
  const samplesDistributed = reports.reduce(
    (sum, report) => sum + report.samplesProvided.length,
    0,
  );

  return (
    <DashboardCard className="p-5 lg:col-span-6" delay={400}>
      <SectionHeader icon={Activity} title="Visits Trend" eyebrow="Field activity" />
      {trend.length === 0 ? (
        <div className="mt-5">
          <EmptyState title="No visits recorded for this period" icon={Activity} />
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="border-gp-border-subtle bg-gp-surface-subtle rounded-[12px] border p-3">
              <p className="text-gp-text-muted text-xs font-semibold">
                Completed
              </p>
              <p className="text-gp-navy-900 mt-1 text-xl font-semibold">
                {completed.toLocaleString()}
              </p>
            </div>
            <div className="border-gp-border-subtle bg-gp-surface-subtle rounded-[12px] border p-3">
              <p className="text-gp-text-muted text-xs font-semibold">
                Avg Rating
              </p>
              <p className="text-gp-navy-900 mt-1 text-xl font-semibold">
                {avgRating ? avgRating.toFixed(1) : "N/A"}
              </p>
            </div>
          </div>
          <ChartContainer
            config={{ value: { label: "Visits", color: GOLD } }}
            className="mt-4 h-[220px] w-full"
          >
            <AreaChart data={trend} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="visitsTrendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GOLD} stopOpacity={0.22} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="4 4" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={34} />
              <Tooltip
                cursor={{ stroke: GOLD_SOFT, strokeWidth: 1 }}
                content={(props) => (
                  <DashboardTooltip
                    {...props}
                    valueFormatter={(value) =>
                      `${value.toLocaleString()} visits`
                    }
                    details={() => [
                      ["Completed", completed.toLocaleString()],
                      ["Avg Rating", avgRating ? avgRating.toFixed(1) : "N/A"],
                      ["Samples", samplesDistributed.toLocaleString()],
                    ]}
                  />
                )}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={GOLD_DARK}
                strokeWidth={3}
                fill="url(#visitsTrendFill)"
                activeDot={{ r: 5, fill: NAVY, stroke: GOLD, strokeWidth: 2 }}
                animationDuration={680}
              />
            </AreaChart>
          </ChartContainer>
        </>
      )}
    </DashboardCard>
  );
}

function CoverageCard({
  doctors,
  visits,
}: {
  doctors: DoctorApiResponse[];
  visits: DashboardVisit[];
}) {
  const activeDoctors = doctors.filter((doctor) => doctor.isActive !== false);
  const visited = new Set(visits.map((visit) => visit.doctorId).filter(Boolean));
  const covered = activeDoctors.filter((doctor) => visited.has(doctor.id)).length;
  const percent = activeDoctors.length > 0 ? (covered / activeDoctors.length) * 100 : 0;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <DashboardCard className="p-5 lg:col-span-4" delay={440}>
      <SectionHeader icon={Stethoscope} title="Doctor Coverage" eyebrow="Coverage" />
      {activeDoctors.length === 0 ? (
        <div className="mt-5">
          <EmptyState title="No active doctors available" icon={Stethoscope} />
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-5">
          <div className="relative size-32 shrink-0">
            <svg viewBox="0 0 120 120" className="size-32 -rotate-90">
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="#EEF1F6"
                strokeWidth="12"
                fill="none"
              />
              <circle
                className="manager-ring-fill"
                cx="60"
                cy="60"
                r={radius}
                stroke={GOLD}
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
                style={
                  {
                    strokeDasharray: circumference,
                    strokeDashoffset: offset,
                  } as CSSProperties
                }
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gp-navy-900 text-2xl font-semibold">
                {Math.round(percent)}%
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-gp-navy-900 text-xl font-semibold">
              {covered.toLocaleString()} / {activeDoctors.length.toLocaleString()}
            </p>
            <p className="text-gp-text-muted mt-1 text-sm leading-5 font-medium">
              active doctors visited in the selected period
            </p>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}

function PharmacyCoverage({
  pharmacies,
  sales,
}: {
  pharmacies: PharmacyApiResponse[];
  sales: SaleApiResponse[];
}) {
  const pharmacyNamesWithSales = new Set(
    sales.map((sale) => String(sale.customer ?? "")).filter(Boolean),
  );
  const covered = pharmacies.filter((pharmacy) =>
    pharmacyNamesWithSales.has(pharmacy.name),
  ).length;
  const percent = pharmacies.length > 0 ? (covered / pharmacies.length) * 100 : 0;

  return (
    <DashboardCard className="p-5 lg:col-span-4" delay={500}>
      <SectionHeader icon={Warehouse} title="Pharmacy Coverage" eyebrow="Commercial" />
      {pharmacies.length === 0 ? (
        <div className="mt-5">
          <EmptyState title="No pharmacy accounts available" icon={Warehouse} />
        </div>
      ) : (
        <div className="mt-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-gp-navy-900 text-3xl leading-none font-semibold">
                {covered.toLocaleString()} / {pharmacies.length.toLocaleString()}
              </p>
              <p className="text-gp-text-muted mt-2 text-sm font-medium">
                pharmacies with sales in the selected period
              </p>
            </div>
            <span className="text-gp-gold-700 text-2xl font-semibold">
              {Math.round(percent)}%
            </span>
          </div>
          <div className="bg-gp-border-subtle mt-5 h-3 rounded-full">
            <div
              className="manager-progress-fill bg-gp-gold-500 h-3 rounded-full"
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>
          <p className="text-gp-text-placeholder mt-3 text-xs font-medium">
            Based on existing sales customer names matched to registered
            pharmacies.
          </p>
        </div>
      )}
    </DashboardCard>
  );
}

function VisitQuality({ reports }: { reports: VisitReport[] }) {
  const average =
    reports.length > 0
      ? reports.reduce((sum, report) => sum + normalizeRating(report.rating), 0) /
        reports.length
      : 0;
  const excellent = reports.filter((report) => normalizeRating(report.rating) >= 5).length;
  const good = reports.filter((report) => {
    const rating = normalizeRating(report.rating);
    return rating >= 4 && rating < 5;
  }).length;
  const needsReview = reports.filter((report) => normalizeRating(report.rating) < 4).length;
  const samples = reports.reduce((sum, report) => sum + report.samplesProvided.length, 0);

  return (
    <DashboardCard className="p-5 lg:col-span-4" delay={480}>
      <SectionHeader icon={ClipboardCheck} title="Visit Quality" eyebrow="Reports" />
      {reports.length === 0 ? (
        <div className="mt-5">
          <EmptyState title="No visit reports for this period" icon={ClipboardCheck} />
        </div>
      ) : (
        <div className="mt-5">
          <div className="flex items-end gap-2">
            <span className="text-gp-navy-900 text-4xl leading-none font-semibold">
              {average.toFixed(1)}
            </span>
            <span className="text-gp-text-muted pb-1 text-sm font-medium">
              / 5 average
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {[
              ["Excellent", excellent, SUCCESS],
              ["Good", good, GOLD],
              ["Needs Review", needsReview, DANGER],
              ["Samples", samples, NAVY],
            ].map(([label, value, color]) => (
              <div key={String(label)} className="flex items-center justify-between gap-3">
                <span className="text-gp-text-secondary text-sm font-medium">
                  {label}
                </span>
                <span
                  className="rounded-full border px-2 py-1 text-xs font-semibold"
                  style={{
                    color: String(color),
                    borderColor: `${color}33`,
                    backgroundColor: `${color}12`,
                  }}
                >
                  {Number(value).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardCard>
  );
}

function ForecastInsight({ forecasts }: { forecasts: ForecastManagement[] }) {
  if (forecasts.length === 0) return null;

  const totalUnits = forecasts.reduce((sum, forecast) => sum + forecast.totalUnits, 0);
  const pending = forecasts.filter((forecast) => !forecast.isApproved).length;
  const approved = forecasts.length - pending;

  return (
    <DashboardCard className="p-5 lg:col-span-4" delay={520}>
      <SectionHeader icon={Target} title="Forecast Demand" eyebrow="Forecast" />
      <div className="mt-5">
        <p className="text-gp-navy-900 text-3xl font-semibold">
          {totalUnits.toLocaleString()}
        </p>
        <p className="text-gp-text-muted mt-1 text-sm font-medium">
          forecasted units in this period
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="border-gp-warning-border bg-gp-warning-soft rounded-[12px] border p-3">
            <p className="text-gp-warning text-xs font-semibold">Pending</p>
            <p className="text-gp-navy-900 mt-1 text-xl font-semibold">
              {pending}
            </p>
          </div>
          <div className="border-gp-success-border bg-gp-success-soft rounded-[12px] border p-3">
            <p className="text-gp-success text-xs font-semibold">Approved</p>
            <p className="text-gp-navy-900 mt-1 text-xl font-semibold">
              {approved}
            </p>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

function TeamPerformance({
  teamMembers,
  visits,
  sales,
  pharmacies,
}: {
  teamMembers: User[];
  visits: DashboardVisit[];
  sales: SaleApiResponse[];
  pharmacies: PharmacyApiResponse[];
}) {
  const [sortBy, setSortBy] = useState<TeamSort>("sales");
  const pharmacyNamesBySubRegion = pharmacies.reduce((map, pharmacy) => {
    const key = pharmacy.subRegion || "";
    if (!key) return map;
    const next = map.get(key) ?? new Set<string>();
    next.add(pharmacy.name);
    map.set(key, next);
    return map;
  }, new Map<string, Set<string>>());

  const reps = teamMembers
    .filter((member) => member.role === "MEDICAL_REP")
    .map((member) => {
      const subRegion = member.region?.subRegion?.name ?? "";
      const customerNames = pharmacyNamesBySubRegion.get(subRegion) ?? new Set<string>();
      const repSales = sales.filter((sale) => customerNames.has(String(sale.customer ?? "")));
      return {
        member,
        visits: visits.filter(
          (visit) => visit.userId === member.id || visit.createdById === member.id,
        ).length,
        sales: sumSales(repSales),
      };
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.member.name.localeCompare(b.member.name);
      }

      if (sortBy === "visits") {
        return b.visits - a.visits || b.sales - a.sales;
      }

      return b.sales - a.sales || b.visits - a.visits;
    })
    .slice(0, 5);

  return (
    <DashboardCard className="p-5 lg:col-span-6" delay={560}>
      <SectionHeader
        icon={Users}
        title="Team Performance"
        eyebrow="Representatives"
        action={
          <div className="flex items-center gap-3">
            <div
              role="tablist"
              aria-label="Sort team performance"
              className="border-gp-border-control bg-gp-surface-control hidden rounded-[10px] border p-1 sm:flex"
            >
              {(["sales", "visits", "name"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={sortBy === option}
                  onClick={() => setSortBy(option)}
                  className={cn(
                    "h-7 rounded-[8px] px-2 text-xs font-semibold capitalize transition-[background-color,color] duration-[170ms]",
                    sortBy === option
                      ? "bg-gp-navy-900 text-white"
                      : "text-gp-text-muted hover:text-gp-navy-900",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
            <Link
              href="/manager/team"
              className="manager-link text-gp-gold-700 inline-flex items-center gap-1 text-sm font-semibold"
            >
              View Team
              <ChevronRight className="size-4" />
            </Link>
          </div>
        }
      />
      <label className="mt-4 block sm:hidden">
        <span className="sr-only">Sort team performance</span>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as TeamSort)}
          className="border-gp-border-control bg-gp-surface-card text-gp-navy-900 focus:border-gp-gold-500 focus:ring-gp-gold-500/10 h-10 w-full rounded-[10px] border px-3 text-sm font-semibold outline-none focus:ring-2"
        >
          <option value="sales">Sort by sales</option>
          <option value="visits">Sort by visits</option>
          <option value="name">Sort by name</option>
        </select>
      </label>
      {reps.length === 0 ? (
        <div className="mt-5">
          <EmptyState title="No active representatives available" icon={Users} />
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-[14px] border border-gp-border-subtle">
          {reps.map(({ member, visits: repVisits, sales: repSales }) => (
            <Link
              key={member.id}
              href={`/manager/team/${member.id}`}
              className="border-gp-border-subtle grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b px-4 py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_90px_120px_80px] sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="bg-gp-navy-900 text-gp-gold-500 flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                  {getInitials(member.name)}
                </span>
                <div className="min-w-0">
                  <p className="text-gp-navy-900 truncate text-sm font-semibold">
                    {member.name}
                  </p>
                  <p className="text-gp-text-muted truncate text-xs font-medium">
                    {member.region?.subRegion?.name || "No sub-region"}
                  </p>
                </div>
              </div>
              <p className="text-gp-text-secondary text-right text-sm font-semibold">
                {repVisits} visits
              </p>
              <p className="text-gp-text-secondary hidden text-right text-sm font-semibold sm:block">
                {formatCompactCurrency(repSales)}
              </p>
              <span
                className={cn(
                  "hidden rounded-full border px-2 py-1 text-center text-xs font-semibold sm:inline-flex sm:justify-center",
                  member.isActive
                    ? "border-gp-success-border bg-gp-success-soft text-gp-success"
                    : "border-gp-danger-border bg-gp-danger-soft text-gp-danger",
                )}
              >
                {member.isActive ? "Active" : "Inactive"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}

function AttentionList({
  requests,
  plans,
  forecasts,
}: {
  requests: TRequest[];
  plans: VisitPlan[];
  forecasts: ForecastManagement[];
}) {
  const items = [
    ...requests
      .filter((request) => request.status === "PENDING")
      .map((request) => ({
        id: `request-${request.id}`,
        title: request.title,
        context: request.rep?.name || request.subject,
        date: request.submittedDate,
        status: "Pending",
        icon: FileClock,
        href: "/manager/requests",
      })),
    ...plans
      .filter((plan) => plan.status === "PENDING")
      .map((plan) => ({
        id: `plan-${plan.id}`,
        title: plan.title,
        context: `${plan.targetDoctors ?? 0} doctors, ${plan.targetVisits ?? 0} visits`,
        date: plan.submittedDate,
        status: "Pending",
        icon: ClipboardCheck,
        href: "/manager/plan",
      })),
    ...forecasts
      .filter((forecast) => !forecast.isApproved)
      .map((forecast) => ({
        id: `forecast-${forecast.id}`,
        title: "Forecast approval",
        context: forecast.repName,
        date: forecast.createdAt,
        status: "Pending",
        icon: Target,
        href: "/manager/forecast",
      })),
  ]
    .sort((a, b) => {
      const left = parseMaybeDate(a.date)?.getTime() ?? 0;
      const right = parseMaybeDate(b.date)?.getTime() ?? 0;
      return right - left;
    })
    .slice(0, 5);

  return (
    <DashboardCard className="p-5 lg:col-span-6" delay={600}>
      <SectionHeader icon={AlertCircle} title="Needs Your Attention" eyebrow="Workflow" />
      {items.length === 0 ? (
        <div className="border-gp-success-border bg-gp-success-soft mt-5 rounded-[14px] border px-4 py-5 text-center">
          <Check className="text-gp-success mx-auto size-5" aria-hidden="true" />
          <p className="text-gp-navy-900 mt-2 text-sm font-semibold">
            You&apos;re all caught up
          </p>
          <p className="text-gp-text-muted mt-1 text-xs font-medium">
            No requests require your attention.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="manager-row-link border-gp-border-subtle hover:border-gp-gold-300 hover:bg-gp-surface-hover flex items-center gap-3 rounded-[12px] border bg-white p-3 transition-[border-color,background-color,transform] duration-[180ms]"
              >
                <span className="border-gp-warning-border bg-gp-warning-soft text-gp-warning flex size-9 shrink-0 items-center justify-center rounded-[10px] border">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-gp-navy-900 block truncate text-sm font-semibold">
                    {item.title}
                  </span>
                  <span className="text-gp-text-muted block truncate text-xs font-medium">
                    {item.context} - {formatDateLabel(parseMaybeDate(item.date) ?? new Date())}
                  </span>
                </span>
                <span className="border-gp-warning-border bg-gp-warning-soft text-gp-warning rounded-full border px-2 py-1 text-xs font-semibold">
                  {item.status}
                </span>
                <ChevronRight className="manager-row-chevron text-gp-text-muted size-4" />
              </Link>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}

function RecentPlans({ plans }: { plans: VisitPlan[] }) {
  const recentPlans = plans
    .slice()
    .sort((a, b) => {
      const left = parseMaybeDate(a.submittedDate)?.getTime() ?? 0;
      const right = parseMaybeDate(b.submittedDate)?.getTime() ?? 0;
      return right - left;
    })
    .slice(0, 5);

  return (
    <DashboardCard className="p-5 lg:col-span-6" delay={640}>
      <SectionHeader
        icon={ClipboardCheck}
        title="Recent Plans"
        eyebrow="Planning"
        action={
          <Link
            href="/manager/plan"
            className="manager-link text-gp-gold-700 inline-flex items-center gap-1 text-sm font-semibold"
          >
            View All
            <ChevronRight className="size-4" />
          </Link>
        }
      />
      {recentPlans.length === 0 ? (
        <div className="mt-5">
          <EmptyState title="No recent plans" icon={ClipboardCheck} />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {recentPlans.map((plan) => (
            <div
              key={plan.id}
              className="border-gp-border-subtle bg-gp-surface-subtle rounded-[12px] border p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-gp-navy-900 truncate text-sm font-semibold">
                    {plan.title}
                  </p>
                  <p className="text-gp-text-muted mt-1 text-xs font-medium">
                    {plan.planType} - {plan.targetDoctors ?? 0} doctors -{" "}
                    {plan.targetVisits ?? 0} visits
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-1 text-xs font-semibold",
                    statusBadgeClass(plan.status),
                  )}
                >
                  {plan.status}
                </span>
              </div>
              <p className="text-gp-text-placeholder mt-2 text-xs font-medium">
                {plan.startDate} to {plan.endDate}
              </p>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}

function QuickActions() {
  return (
    <DashboardCard className="p-5 lg:col-span-6" delay={680}>
      <SectionHeader icon={Zap} title="Quick Actions" eyebrow="Shortcuts" />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="manager-action-link border-gp-border-subtle hover:border-gp-gold-300 hover:bg-gp-surface-hover focus-visible:ring-gp-gold-500/20 flex items-center gap-3 rounded-[12px] border bg-white p-3 transition-[border-color,background-color,transform] duration-[180ms] focus-visible:ring-3 focus-visible:outline-none"
            >
              <span className="manager-action-icon border-gp-border-control text-gp-navy-900 flex size-10 shrink-0 items-center justify-center rounded-[10px] border bg-white">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-gp-navy-900 block truncate text-sm font-semibold">
                  {action.title}
                </span>
                <span className="text-gp-text-muted mt-0.5 block truncate text-xs font-medium">
                  {action.desc}
                </span>
              </span>
              <ChevronRight className="manager-row-chevron text-gp-text-muted size-4" />
            </Link>
          );
        })}
      </div>
    </DashboardCard>
  );
}

function PeoplePerformance({ appraisals }: { appraisals: Review[] }) {
  if (appraisals.length === 0) return null;

  const avg =
    appraisals.reduce((sum, review) => sum + review.overallCurrent, 0) /
    appraisals.length;
  const excellent = appraisals.filter((review) => review.statusBadge === "Excellent").length;
  const improving = appraisals.filter((review) => review.statusBadge === "Improving").length;

  return (
    <DashboardCard className="p-5 lg:col-span-6" delay={720}>
      <SectionHeader icon={ArrowUpRight} title="People Performance" eyebrow="Appraisal" />
      <div className="mt-5 grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
        <div>
          <p className="text-gp-navy-900 text-4xl font-semibold">
            {Math.round(avg)}
          </p>
          <p className="text-gp-text-muted mt-1 text-sm font-medium">
            average score
          </p>
        </div>
        <div className="space-y-3">
          {[
            ["Excellent", excellent, SUCCESS],
            ["Improving", improving, WARNING],
            ["Reviews", appraisals.length, NAVY],
          ].map(([label, value, color]) => (
            <div key={String(label)} className="flex items-center justify-between gap-3">
              <span className="text-gp-text-secondary text-sm font-medium">
                {label}
              </span>
              <span
                className="rounded-full border px-2 py-1 text-xs font-semibold"
                style={{
                  color: String(color),
                  borderColor: `${color}33`,
                  backgroundColor: `${color}12`,
                }}
              >
                {Number(value).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}

export default function ManagerDashboard({
  userName,
  dashboardData,
  sales,
  visits,
  doctors,
  pharmacies,
  requests,
  teamMembers,
  plans,
  reports,
  forecasts,
  appraisals,
  errors,
}: ManagerDashboardProps) {
  const [preset, setPreset] = useState<DashboardRangePreset>("month");
  const [range, setRange] = useState<DateRangeValue>(() => getPresetRange("month"));
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<DashboardStatusFilter>("all");

  const selectedSales = useMemo(
    () =>
      getSalesInRange(sales, range).filter((sale) =>
        matchesSearch(
          [
            sale.customer,
            sale.order,
            sale.sheetName,
            sale.product?.name,
            sale.productId,
          ],
          query,
        ),
      ),
    [sales, range, query],
  );
  const previousSales = useMemo(
    () => getSalesInRange(sales, previousRange(range)),
    [sales, range],
  );
  const selectedVisits = useMemo(
    () =>
      visits
        .filter((visit) => isWithinRange(visit.date, range))
        .filter((visit) =>
          matchesSearch(
            [visit.createdBy, visit.createdById, visit.doctorId, visit.status],
            query,
          ),
        )
        .filter((visit) =>
          statusFilter === "completed" ? visit.status === "COMPLETED" : true,
        ),
    [visits, range, query, statusFilter],
  );
  const selectedReports = useMemo(
    () =>
      reports
        .filter((report) => isWithinRange(report.visitDate, range))
        .filter((report) =>
          matchesSearch(
            [
              report.id,
              report.visitId,
              report.visitPurpose,
              report.rating,
              report.notes,
              ...report.samplesProvided,
              ...report.discussedTopics,
            ],
            query,
          ),
        ),
    [reports, range, query],
  );
  const selectedRequests = useMemo(
    () =>
      requests
        .filter((request) => isWithinRange(request.submittedDate, range))
        .filter((request) =>
          matchesSearch(
            [
              request.title,
              request.subject,
              request.type,
              request.status,
              request.rep?.name,
            ],
            query,
          ),
        )
        .filter((request) => {
          if (statusFilter === "pending") return request.status === "PENDING";
          if (statusFilter === "approved") return request.status === "APPROVED";
          return true;
        }),
    [requests, range, query, statusFilter],
  );
  const selectedPlans = useMemo(
    () =>
      plans
        .filter((plan) => overlapsRange(plan.startDate, plan.endDate, range))
        .filter((plan) =>
          matchesSearch(
            [plan.title, plan.planType, plan.status, plan.createdBy?.name],
            query,
          ),
        )
        .filter((plan) => {
          if (statusFilter === "pending") return plan.status === "PENDING";
          if (statusFilter === "approved") return plan.status === "APPROVED";
          return true;
        }),
    [plans, range, query, statusFilter],
  );
  const selectedForecasts = useMemo(
    () =>
      forecasts
        .filter((forecast) => isWithinRange(forecast.periodDate, range))
        .filter((forecast) =>
          matchesSearch(
            [
              forecast.repName,
              forecast.periodType,
              forecast.notes,
              ...forecast.productForecasts.map((item) => item.productName),
            ],
            query,
          ),
        )
        .filter((forecast) => {
          if (statusFilter === "pending") return !forecast.isApproved;
          if (statusFilter === "approved") return forecast.isApproved;
          return true;
        }),
    [forecasts, range, query, statusFilter],
  );
  const selectedAppraisals = useMemo(
    () =>
      appraisals
        .filter((review) => {
          const date = parseMaybeDate(review.lastReview);
          return date ? isWithinRange(date, range) : true;
        })
        .filter((review) =>
          matchesSearch(
            [review.name, review.email, review.role, review.period],
            query,
          ),
        ),
    [appraisals, range, query],
  );

  const salesTotal = sumSales(selectedSales);
  const previousTotal = sumSales(previousSales);
  const salesDelta =
    previousTotal > 0 ? ((salesTotal - previousTotal) / previousTotal) * 100 : null;
  const activeDoctors = doctors.filter((doctor) => doctor.isActive !== false).length;
  const activePharmacies = pharmacies.length;
  const pendingRequests = selectedRequests.filter((request) => request.status === "PENDING").length;
  const filteredTeamMembers = useMemo(
    () =>
      teamMembers.filter((member) =>
        matchesSearch(
          [
            member.name,
            member.email,
            member.role,
            member.region?.subRegion?.name,
          ],
          query,
        ),
      ),
    [teamMembers, query],
  );
  const teamCount = filteredTeamMembers.length;
  const pendingRequestsValue =
    query || statusFilter !== "all"
      ? pendingRequests
      : pendingRequests || dashboardData?.pendingRequestsCount || 0;

  const kpis = [
    {
      label: "Total Sales",
      value: salesTotal,
      helper:
        selectedSales.length > 0
          ? `${selectedSales.length.toLocaleString()} sales records`
          : "No sales in selected period",
      icon: BarChart3,
      formatter: formatCurrency,
      href: "/manager/sales",
      trend:
        salesDelta !== null
          ? { value: salesDelta, direction: salesDelta >= 0 ? ("up" as const) : ("down" as const) }
          : undefined,
    },
    {
      label: "Total Visits",
      value: selectedVisits.length,
      helper: `${selectedVisits.filter((visit) => visit.status === "COMPLETED").length} completed`,
      icon: Activity,
      href: "/manager/visits",
    },
    {
      label: "Active Doctors",
      value: activeDoctors,
      helper: "Available doctor universe",
      icon: Stethoscope,
      href: "/manager/doctors",
    },
    {
      label: "Active Pharmacies",
      value: activePharmacies,
      helper: "Registered pharmacy accounts",
      icon: Warehouse,
      href: "/manager/pharmacies",
    },
    {
      label: "Pending Requests",
      value: pendingRequestsValue,
      helper: "Manager attention queue",
      icon: FileClock,
      href: "/manager/requests",
    },
    {
      label: "Team Members",
      value: teamCount,
      helper: "Active supervisors and reps",
      icon: Users,
      href: "/manager/team",
    },
  ];

  function handleDateChange(nextPreset: DashboardRangePreset, nextRange: DateRangeValue) {
    setPreset(nextPreset);
    setRange(nextRange);
  }

  return (
    <div className="manager-dashboard space-y-5">
      <header className="manager-dashboard-header flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-gp-gold-700 text-[11px] font-semibold tracking-[0.08em] uppercase">
            GolderaPharm CRM
          </p>
          <h1 className="text-gp-navy-900 mt-1 text-[28px] leading-tight font-semibold sm:text-[32px]">
            Dashboard
          </h1>
          <p className="text-gp-text-muted mt-1 text-sm leading-6 font-medium">
            Real insights. Stronger teams. Better decisions.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
          <DashboardFilters
            query={query}
            status={statusFilter}
            onQueryChange={setQuery}
            onStatusChange={setStatusFilter}
          />
          <DashboardDateFilter
            preset={preset}
            range={range}
            onChange={handleDateChange}
          />
        </div>
      </header>

      {errors.length > 0 && (
        <div className="border-gp-warning-border bg-gp-warning-soft text-gp-navy-900 rounded-[14px] border px-4 py-3 text-sm font-medium">
          Some dashboard sections could not load. Available data is still shown.
        </div>
      )}

      <section className="manager-hero relative overflow-hidden rounded-[18px] border border-gp-gold-300 bg-white px-5 py-5 shadow-gp-card sm:px-6">
        <div className="relative z-10 max-w-3xl">
          <p className="text-gp-gold-700 text-[11px] font-semibold tracking-[0.08em] uppercase">
            Executive Overview
          </p>
          <h2 className="text-gp-navy-900 mt-2 text-2xl font-semibold">
            Welcome back, Dr. {userName}
          </h2>
          <p className="text-gp-text-secondary mt-2 text-sm leading-6 font-medium">
            Here&apos;s what&apos;s happening across GolderaPharm for{" "}
            {formatDateLabel(range.from)} to {formatDateLabel(range.to)}.
          </p>
          {salesDelta !== null && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-gp-gold-300 bg-gp-gold-50 px-3 py-1.5 text-sm font-semibold text-gp-navy-900">
              {salesDelta >= 0 ? (
                <TrendingUp className="size-4 text-gp-success" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-4 text-gp-danger" aria-hidden="true" />
              )}
              Sales are {salesDelta >= 0 ? "up" : "down"}{" "}
              {Math.abs(salesDelta).toFixed(1)}% compared with the previous
              period.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {["Manager", "Active Account", preset === "custom" ? "Custom range" : "Current reporting period"].map(
              (badge) => (
                <span
                  key={badge}
                  className="border-gp-gold-300 bg-white/70 text-gp-navy-900 rounded-full border px-3 py-1 text-xs font-semibold"
                >
                  {badge}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {kpis.map((kpi, index) => (
          <KpiCard key={kpi.label} {...kpi} delay={120 + index * 55} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <SalesPerformance
          sales={selectedSales}
          previousSales={previousSales}
          range={range}
        />
        <SalesByRegion sales={selectedSales} pharmacies={pharmacies} />
        <TopProducts sales={selectedSales} />
        <VisitsTrend visits={selectedVisits} reports={selectedReports} range={range} />
        <CoverageCard doctors={doctors} visits={selectedVisits} />
        <PharmacyCoverage pharmacies={pharmacies} sales={selectedSales} />
        <VisitQuality reports={selectedReports} />
        <ForecastInsight forecasts={selectedForecasts} />
        <TeamPerformance
          teamMembers={filteredTeamMembers}
          visits={selectedVisits}
          sales={selectedSales}
          pharmacies={pharmacies}
        />
        <AttentionList
          requests={selectedRequests}
          plans={selectedPlans}
          forecasts={selectedForecasts}
        />
        <RecentPlans plans={selectedPlans} />
        <QuickActions />
        <PeoplePerformance appraisals={selectedAppraisals} />
      </section>
    </div>
  );
}
