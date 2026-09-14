"use client";

import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import type { DateRange } from "react-day-picker";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Copy,
  FileText,
  MessageSquareText,
  Package,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Stethoscope,
  User2,
  X,
  type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  cn,
  formatDateOnly,
  formatSaudiDateDisplay,
  getSaudiDateParts,
  parseDateValue,
} from "@/lib/utils";
import type { VisitReport } from "../../lib/types";

type ManagerVisitReportsProps = {
  reports: VisitReport[];
  page?: number;
  limit?: number;
  totalCount?: number;
};

type ManagerVisitReport = VisitReport & {
  doctorNameAR?: string;
  doctorNameEN?: string;
  repName?: string;
  representativeName?: string;
  representativeNameAR?: string;
  representativeNameEN?: string;
  userName?: string;
  user?: {
    name?: string;
    nameAR?: string;
    nameEN?: string;
    avatar?: string;
    image?: string;
  };
};

type RatingTab = "all" | "excellent" | "positive" | "needsReview";
type DateFilterMode = "single" | "range";
type DateSelection = {
  mode: DateFilterMode;
  from?: Date;
  to?: Date;
};
type SampleFilter = "all" | "withSamples" | "withoutSamples";
type MonthMotionDirection = "next" | "previous" | "none";

const ratingTabs: {
  id: RatingTab;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "all", label: "All", icon: FileText },
  { id: "excellent", label: "Excellent", icon: Sparkles },
  { id: "positive", label: "Good+", icon: Star },
  { id: "needsReview", label: "Needs Review", icon: MessageSquareText },
];

const DATE_RANGE_SEPARATOR = " \u2013 ";
const quickDateOptions = [
  { id: "today", label: "Today" },
  { id: "last7", label: "Last 7 Days" },
  { id: "thisMonth", label: "This Month" },
  { id: "last30", label: "Last 30 Days" },
] as const;

function parseRating(rating: string): number {
  const value = Number.parseFloat(rating);
  return Number.isFinite(value) ? value : 0;
}

function ratingLabel(rating: number): string {
  if (rating >= 5) return "Excellent";
  if (rating >= 4) return "Very Good";
  if (rating >= 3) return "Good";
  if (rating >= 2) return "Fair";
  return "Poor";
}

function shortId(id: string | undefined): string {
  if (!id) return "Not provided";
  return id.length > 16 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;
}

function toCalendarDate(date: Date): Date {
  return parseDateValue(formatDateOnly(date));
}

function addCalendarDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400000);
}

function getDateKey(date?: Date): string {
  return date ? formatDateOnly(date) : "";
}

function parseVisitDate(value: string): Date | null {
  if (!value) return null;

  const parsed = parseDateValue(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return toCalendarDate(parsed);
}

function normalizeDateSelection(
  mode: DateFilterMode,
  from?: Date,
  to?: Date,
): DateSelection {
  if (!from) return { mode };

  const normalizedFrom = toCalendarDate(from);

  if (mode === "single") {
    return { mode, from: normalizedFrom };
  }

  if (!to) return { mode, from: normalizedFrom };

  const normalizedTo = toCalendarDate(to);
  const fromKey = getDateKey(normalizedFrom);
  const toKey = getDateKey(normalizedTo);

  return fromKey <= toKey
    ? { mode, from: normalizedFrom, to: normalizedTo }
    : { mode, from: normalizedTo, to: normalizedFrom };
}

function isDateSelectionComplete(selection: DateSelection): boolean {
  if (!selection.from) return false;
  return selection.mode === "single" || Boolean(selection.to);
}

function isDateSelectionActive(selection: DateSelection): boolean {
  return Boolean(selection.from) && isDateSelectionComplete(selection);
}

function getDateSelectionKey(selection: DateSelection): string {
  return `${selection.mode}:${getDateKey(selection.from)}:${getDateKey(
    selection.to,
  )}`;
}

function padDatePart(value: number): string {
  return String(value).padStart(2, "0");
}

function formatSaudiMonthDay(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Riyadh",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatDateSelectionLabel(selection: DateSelection): string {
  if (!selection.from) return "All Dates";

  if (selection.mode === "single" || !selection.to) {
    return formatSaudiDateDisplay(selection.from);
  }

  const fromParts = getSaudiDateParts(selection.from);
  const toParts = getSaudiDateParts(selection.to);

  if (fromParts.year === toParts.year) {
    return `${formatSaudiMonthDay(selection.from)}${DATE_RANGE_SEPARATOR}${formatSaudiMonthDay(
      selection.to,
    )}, ${toParts.year}`;
  }

  return `${formatSaudiDateDisplay(selection.from)}${DATE_RANGE_SEPARATOR}${formatSaudiDateDisplay(
    selection.to,
  )}`;
}

function getQuickDateSelection(
  quickSelectId: (typeof quickDateOptions)[number]["id"],
): DateSelection {
  const today = toCalendarDate(new Date());

  if (quickSelectId === "today") {
    return { mode: "single", from: today };
  }

  if (quickSelectId === "last7") {
    return {
      mode: "range",
      from: addCalendarDays(today, -6),
      to: today,
    };
  }

  if (quickSelectId === "last30") {
    return {
      mode: "range",
      from: addCalendarDays(today, -29),
      to: today,
    };
  }

  const { year, month } = getSaudiDateParts(today);

  return {
    mode: "range",
    from: parseDateValue(`${year}-${month}-01`),
    to: parseDateValue(
      `${year}-${month}-${padDatePart(Number(getSaudiDateParts(today).day))}`,
    ),
  };
}

function getPreviewSelection(
  draftSelection: DateSelection,
  hoveredDate: Date | null,
): DateSelection | null {
  if (
    draftSelection.mode !== "range" ||
    !draftSelection.from ||
    draftSelection.to ||
    !hoveredDate
  ) {
    return null;
  }

  return normalizeDateSelection("range", draftSelection.from, hoveredDate);
}

function isDateInSelection(
  date: Date,
  selection: DateSelection,
  mode: "start" | "middle" | "end",
): boolean {
  if (!selection.from || !selection.to) return false;

  const dateKey = getDateKey(date);
  const fromKey = getDateKey(selection.from);
  const toKey = getDateKey(selection.to);

  if (mode === "start") return dateKey === fromKey;
  if (mode === "end") return dateKey === toKey;
  return dateKey > fromKey && dateKey < toKey;
}

function reportMatchesVisitDateSelection(
  report: VisitReport,
  selection: DateSelection,
): boolean {
  if (!isDateSelectionActive(selection)) return true;

  const visitDate = parseVisitDate(report.visitDate);
  if (!visitDate || !selection.from) return false;

  const visitKey = getDateKey(visitDate);
  const fromKey = getDateKey(selection.from);

  if (selection.mode === "single") {
    return visitKey === fromKey;
  }

  const toKey = getDateKey(selection.to);
  return visitKey >= fromKey && visitKey <= toKey;
}

function parseReportDate(value: string): Date | null {
  const parsed = new Date(value.replace(" at ", " "));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isThisMonth(value: string): boolean {
  const parsed = parseReportDate(value);
  if (!parsed) return false;

  const now = new Date();
  return (
    parsed.getMonth() === now.getMonth() &&
    parsed.getFullYear() === now.getFullYear()
  );
}

function formatCreatedAt(value: string): { date: string; time: string } {
  const [date, time] = value.split(" at ");
  return {
    date: date || value || "Not available",
    time: time || "",
  };
}

function CopyReportId({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Visit ID copied" : "Copy Visit ID"}
          className={cn(
            "reports-copy-button focus-visible:ring-gp-gold-500/25 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-[border-color,color,background-color,box-shadow,transform] duration-[190ms] focus-visible:ring-3 focus-visible:outline-none",
            copied
              ? "border-gp-success-border bg-gp-success-soft text-gp-success"
              : "border-gp-border-control text-gp-text-muted bg-white",
          )}
        >
          {copied ? (
            <Check className="size-3" aria-hidden="true" />
          ) : (
            <Copy className="size-3" aria-hidden="true" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-gp-navy-900 text-white">
        {copied ? "Copied" : "Copy Visit ID"}
      </TooltipContent>
    </Tooltip>
  );
}

function RatingDisplay({ rating }: { rating: number }) {
  const filledStars = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <div className="reports-rating flex flex-col items-start gap-1 sm:items-end">
      <div
        className="flex items-center gap-1"
        aria-label={`Rating ${rating.toFixed(1)} out of 5. ${ratingLabel(rating)}`}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={cn(
              "reports-rating-star size-3.5",
              index < filledStars
                ? "fill-gp-gold-500 text-gp-gold-500"
                : "text-gp-border-control",
            )}
            aria-hidden="true"
          />
        ))}
        <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 ml-1 inline-flex min-h-6 items-center rounded-full border px-2 text-xs font-semibold">
          {rating.toFixed(1)}
        </span>
      </div>
      <p className="text-gp-text-muted text-xs font-medium">
        {ratingLabel(rating)}
      </p>
    </div>
  );
}

function ReportsDateFilter({
  selection,
  onApply,
  onClear,
}: {
  selection: DateSelection;
  onApply: (selection: DateSelection) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftSelection, setDraftSelection] =
    useState<DateSelection>(selection);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    selection.from ?? toCalendarDate(new Date()),
  );
  const [monthMotionDirection, setMonthMotionDirection] =
    useState<MonthMotionDirection>("none");
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const isActive = isDateSelectionActive(selection);
  const isApplyDisabled = !isDateSelectionComplete(draftSelection);
  const previewSelection = useMemo(
    () => getPreviewSelection(draftSelection, hoveredDate),
    [draftSelection, hoveredDate],
  );
  const dayPickerRangeSelection = draftSelection.from
    ? ({
        from: draftSelection.from,
        to: draftSelection.to,
      } satisfies DateRange)
    : undefined;
  const displayValue = formatDateSelectionLabel(selection);
  const draftDisplayValue = formatDateSelectionLabel(draftSelection);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      setDraftSelection(selection);
      setHoveredDate(null);
      setVisibleMonth(selection.from ?? toCalendarDate(new Date()));
    } else {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }

  function selectMode(mode: DateFilterMode) {
    setDraftSelection((current) =>
      normalizeDateSelection(
        mode,
        current.from,
        mode === "range" ? current.to : undefined,
      ),
    );
    setHoveredDate(null);
  }

  function selectSingleDate(date?: Date) {
    if (!date) return;
    const nextSelection = normalizeDateSelection("single", date);
    setDraftSelection(nextSelection);
    setVisibleMonth(nextSelection.from ?? toCalendarDate(new Date()));
  }

  function selectRangeDate(date: Date) {
    const clickedDate = toCalendarDate(date);

    setHoveredDate(null);
    setDraftSelection((current) => {
      if (!current.from || current.to) {
        return { mode: "range", from: clickedDate };
      }

      return normalizeDateSelection("range", current.from, clickedDate);
    });
  }

  function handleMonthChange(nextMonth: Date) {
    const nextDirection =
      nextMonth.getTime() >= visibleMonth.getTime() ? "next" : "previous";

    setMonthMotionDirection("none");
    window.setTimeout(() => setMonthMotionDirection(nextDirection), 0);
    setVisibleMonth(nextMonth);
  }

  function handleQuickSelect(
    quickSelectId: (typeof quickDateOptions)[number]["id"],
  ) {
    const nextSelection = getQuickDateSelection(quickSelectId);
    setDraftSelection(nextSelection);
    setHoveredDate(null);
    setVisibleMonth(nextSelection.from ?? toCalendarDate(new Date()));
  }

  function handleApply() {
    if (isApplyDisabled) return;

    const nextSelection = normalizeDateSelection(
      draftSelection.mode,
      draftSelection.from,
      draftSelection.to,
    );

    setOpen(false);
    onApply(nextSelection);
  }

  function handleClear() {
    setDraftSelection({ mode: "range" });
    setHoveredDate(null);
    setOpen(false);
    onClear();
  }

  const calendarClassNames = {
    table: cn(
      "sales-date-calendar-grid w-full border-collapse",
      monthMotionDirection === "next" && "sales-date-calendar-grid-next",
      monthMotionDirection === "previous" &&
        "sales-date-calendar-grid-previous",
    ),
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          aria-label="Open visit date filter"
          className={cn(
            "reports-date-filter-trigger focus-visible:ring-gp-gold-500/20 inline-flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-[10px] border px-3 text-sm font-semibold shadow-none transition-[border-color,background-color,box-shadow,color,transform] duration-[170ms] focus-visible:ring-3 focus-visible:outline-none sm:w-52 lg:h-10",
            isActive
              ? "border-gp-gold-400 bg-gp-gold-50 text-gp-navy-900"
              : "border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-surface-hover bg-white",
            open && "border-gp-gold-500 ring-gp-gold-500/15 ring-3",
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <CalendarDays
              className="text-gp-gold-600 size-4 shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">{displayValue}</span>
          </span>
          <ArrowRight
            className={cn(
              "reports-date-trigger-arrow text-gp-text-muted size-4 shrink-0 rotate-90",
              open && "text-gp-navy-900 -rotate-90",
            )}
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        collisionPadding={12}
        sideOffset={8}
        className="reports-date-popover-content sales-date-popover-content w-[min(calc(100vw-24px),430px)] overflow-hidden rounded-[16px] border border-[#E5E8EF] bg-white p-0 text-[#182033] shadow-[0_18px_46px_rgba(16,27,51,0.14)]"
      >
        <div className="p-4">
          <div>
            <p className="text-gp-navy-900 text-sm font-semibold">
              Filter by Visit Date
            </p>
            <p className="text-gp-text-muted mt-1 text-xs font-medium">
              Choose a single day or custom date range
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Choose date filter mode"
            className="border-gp-border-control bg-gp-surface-control mt-4 grid grid-cols-2 rounded-[12px] border p-1"
          >
            {(["single", "range"] as const).map((mode) => {
              const isSelected = draftSelection.mode === mode;

              return (
                <button
                  key={mode}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => selectMode(mode)}
                  className={cn(
                    "reports-date-mode-tab focus-visible:ring-gp-gold-500/25 h-9 rounded-[9px] px-3 text-xs font-semibold transition-[background-color,color,box-shadow,transform] duration-[170ms] focus-visible:ring-2 focus-visible:outline-none",
                    isSelected
                      ? "bg-gp-navy-900 text-white shadow-[0_4px_10px_rgba(16,29,54,0.18)]"
                      : "text-gp-text-muted hover:text-gp-navy-900 hover:bg-white",
                  )}
                >
                  {mode === "single" ? "Single Day" : "Date Range"}
                </button>
              );
            })}
          </div>

          {draftSelection.mode === "single" ? (
            <Calendar
              mode="single"
              month={visibleMonth}
              selected={draftSelection.from}
              onSelect={selectSingleDate}
              onMonthChange={handleMonthChange}
              className="sales-date-calendar reports-date-calendar mt-4 w-full p-0"
              classNames={calendarClassNames}
            />
          ) : (
            <Calendar
              mode="range"
              month={visibleMonth}
              selected={dayPickerRangeSelection}
              onDayClick={selectRangeDate}
              onDayMouseEnter={(date) => setHoveredDate(toCalendarDate(date))}
              onDayMouseLeave={() => setHoveredDate(null)}
              onMonthChange={handleMonthChange}
              modifiers={{
                sales_range_preview_start: (date) =>
                  Boolean(
                    previewSelection &&
                    isDateInSelection(date, previewSelection, "start"),
                  ),
                sales_range_preview_middle: (date) =>
                  Boolean(
                    previewSelection &&
                    isDateInSelection(date, previewSelection, "middle"),
                  ),
                sales_range_preview_end: (date) =>
                  Boolean(
                    previewSelection &&
                    isDateInSelection(date, previewSelection, "end"),
                  ),
              }}
              modifiersClassNames={{
                sales_range_preview_start: "sales-date-preview-start",
                sales_range_preview_middle: "sales-date-preview-middle",
                sales_range_preview_end: "sales-date-preview-end",
              }}
              className="sales-date-calendar reports-date-calendar mt-4 w-full p-0"
              classNames={calendarClassNames}
            />
          )}

          <div className="mt-4 border-t border-[#EEF1F6] pt-3">
            <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.04em] uppercase">
              Quick Filters
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {quickDateOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => handleQuickSelect(option.id)}
                  className="sales-date-quick-button h-8 rounded-[9px] border border-[#E7EAF0] bg-[#FBFCFE] px-2 text-xs font-semibold text-[#344054] transition-[background-color,border-color,color,transform] duration-[150ms] hover:-translate-y-px hover:border-[#E9DDB8] hover:bg-[#FBF7EA] hover:text-[#9A7426] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20 focus-visible:outline-none"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-gp-border-subtle bg-gp-surface-subtle mt-3 grid gap-3 rounded-[12px] border px-3 py-2.5 sm:grid-cols-2">
            <div>
              <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.04em] uppercase">
                {draftSelection.mode === "single" ? "Selected Day" : "From"}
              </p>
              <p className="text-gp-navy-900 mt-1 truncate text-sm font-semibold">
                {draftSelection.from
                  ? formatSaudiDateDisplay(draftSelection.from)
                  : "Not selected"}
              </p>
            </div>
            <div>
              <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.04em] uppercase">
                To
              </p>
              <p className="text-gp-navy-900 mt-1 truncate text-sm font-semibold">
                {draftSelection.mode === "single"
                  ? draftSelection.from
                    ? formatSaudiDateDisplay(draftSelection.from)
                    : "Same day"
                  : draftSelection.to
                    ? formatSaudiDateDisplay(draftSelection.to)
                    : "Select an end date"}
              </p>
            </div>
          </div>

          <p
            className="text-gp-text-muted mt-2 min-h-4 text-xs font-medium"
            aria-live="polite"
          >
            {draftSelection.mode === "range" &&
            draftSelection.from &&
            !draftSelection.to
              ? "Select an end date."
              : draftDisplayValue}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[#EEF1F6] bg-[#FBFCFE] px-4 py-3">
          <button
            type="button"
            onClick={handleClear}
            disabled={!isActive && !draftSelection.from}
            className="sales-date-action-clear h-9 rounded-[9px] px-3 text-sm font-semibold text-[#667085] transition-[background-color,color] duration-[150ms] hover:bg-[#F2F4F7] hover:text-[#344054] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#667085]"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={isApplyDisabled}
            className="sales-date-action-apply h-9 rounded-[9px] bg-[linear-gradient(135deg,#D8B85A_0%,#C9A44C_55%,#B18732_100%)] px-4 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(185,139,50,0.18)] transition-[filter,transform,opacity] duration-[150ms] hover:-translate-y-px hover:brightness-[1.02] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
          >
            Apply Filter
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MetricCell({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="reports-metric-cell min-w-0 py-1">
      <p className="text-gp-text-muted flex items-center gap-2 text-[11px] font-semibold tracking-[0.06em] uppercase">
        <Icon
          className="reports-metric-icon text-gp-gold-600 size-3.5"
          aria-hidden="true"
        />
        {label}
      </p>
      <p className="text-gp-navy-900 mt-1.5 text-sm font-semibold">{value}</p>
    </div>
  );
}

function DetailText({ title, value }: { title: string; value: string }) {
  return (
    <div className="border-gp-border-subtle mt-4 border-t pt-4">
      <p className="text-gp-text-muted flex items-center gap-2 text-[11px] font-semibold tracking-[0.06em] uppercase">
        <FileText className="text-gp-gold-600 size-3.5" aria-hidden="true" />
        {title}
      </p>
      <p className="text-gp-text-secondary mt-2 text-sm leading-6 break-words whitespace-pre-wrap">
        {value}
      </p>
    </div>
  );
}

function getRepresentativeDisplay(report: ManagerVisitReport): string {
  const runtimeUser = report.user;
  const englishName =
    report.representativeNameEN ||
    runtimeUser?.nameEN ||
    report.representativeName ||
    report.repName ||
    report.userName ||
    runtimeUser?.name ||
    "";
  const arabicName = report.representativeNameAR || runtimeUser?.nameAR || "";

  if (englishName && arabicName) return `${englishName} / ${arabicName}`;
  return englishName || arabicName;
}

function ReportCard({
  report,
  animationIndex,
  expanded,
  onToggle,
}: {
  report: ManagerVisitReport;
  animationIndex: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const rating = parseRating(report.rating);
  const created = formatCreatedAt(report.createdAt);
  const visibleSamples = report.samplesProvided.slice(0, 3);
  const hiddenSamples = Math.max(0, report.samplesProvided.length - 3);
  const representativeName = getRepresentativeDisplay(report);
  const representativeAvatar = report.user?.avatar || report.user?.image || "";
  const doctorName =
    report.doctorNameEN || report.doctorNameAR
      ? `${report.doctorNameEN || ""}${
          report.doctorNameEN && report.doctorNameAR ? " / " : ""
        }${report.doctorNameAR || ""}`
      : "";

  return (
    <Card
      className="reports-card reports-card-enter border-gp-border-default bg-gp-surface-card shadow-gp-card group/card gap-0 overflow-hidden rounded-[14px] border py-0"
      style={
        {
          "--reports-card-delay": `${Math.min(animationIndex, 8) * 50}ms`,
        } as CSSProperties
      }
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
            <div className="reports-card-icon bg-gp-navy-900 text-gp-gold-500 flex size-12 shrink-0 items-center justify-center rounded-[10px] shadow-[0_4px_12px_rgba(16,29,54,0.18)]">
              <Stethoscope className="size-5.5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
                <h3 className="text-gp-navy-900 text-base leading-5 font-semibold sm:text-[17px]">
                  Visit Report
                </h3>
                <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                  <FileText className="size-3.5" aria-hidden="true" />
                  ID {shortId(report.visitId)}
                </span>
                <CopyReportId value={report.visitId} />
              </div>
              {(representativeName || doctorName) && (
                <div className="mt-2 flex flex-col gap-1.5">
                  {representativeName && (
                    <p
                      className="text-gp-text-secondary flex min-w-0 items-center gap-1.5 text-sm font-semibold break-words"
                      dir="auto"
                    >
                      {representativeAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={representativeAvatar}
                          alt=""
                          className="size-5 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <User2
                          className="text-gp-gold-600 size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <span className="text-gp-text-muted text-xs font-semibold tracking-[0.04em] uppercase">
                        Representative
                      </span>
                      <span className="min-w-0 break-words">
                        {representativeName}
                      </span>
                    </p>
                  )}
                  {doctorName && (
                    <p
                      className="text-gp-text-muted text-sm font-medium break-words"
                      dir="auto"
                    >
                      {doctorName}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 sm:text-right">
            <RatingDisplay rating={rating} />
            <p className="text-gp-text-muted mt-1 text-xs font-medium">
              {created.date}
              {created.time ? ` at ${created.time}` : ""}
            </p>
          </div>
        </div>

        <div className="border-gp-border-subtle mt-4 grid grid-cols-1 gap-3 border-t pt-3.5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-0">
          <MetricCell
            icon={CalendarDays}
            label="Visit Date"
            value={report.visitDate || "Not available"}
          />
          <MetricCell
            icon={Clock}
            label="Duration"
            value={report.duration || "Not provided"}
          />
          <MetricCell
            icon={Package}
            label="Samples"
            value={`${report.samplesProvided.length} ${
              report.samplesProvided.length === 1 ? "item" : "items"
            }`}
          />
          <MetricCell
            icon={Star}
            label="Rating"
            value={`${rating.toFixed(1)} / 5`}
          />
        </div>

        {report.visitPurpose && (
          <div className="border-gp-border-subtle mt-4 border-t pt-3.5">
            <p className="text-gp-text-muted flex items-center gap-2 text-[11px] font-semibold tracking-[0.06em] uppercase">
              <MessageSquareText
                className="reports-section-icon text-gp-gold-600 size-3.5"
                aria-hidden="true"
              />
              Visit Purpose
            </p>
            <p
              className={cn(
                "text-gp-text-secondary mt-2 text-sm leading-6 break-words",
                "line-clamp-2",
              )}
            >
              {report.visitPurpose}
            </p>
          </div>
        )}

        <footer
          className={cn(
            "border-gp-border-subtle mt-4 flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between",
            expanded && "sm:justify-end",
          )}
        >
          {!expanded && (
            <div className="flex min-w-0 flex-wrap gap-2">
              {visibleSamples.length > 0 ? (
                <>
                  {visibleSamples.map((sample, index) => (
                    <span
                      key={`${sample}-${index}`}
                      className="reports-sample-chip border-gp-gold-300 bg-gp-gold-50 text-gp-navy-900 inline-flex min-h-7 max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
                      dir="auto"
                    >
                      <Package
                        className="reports-sample-chip-icon text-gp-gold-600 size-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 truncate">{sample}</span>
                    </span>
                  ))}
                  {hiddenSamples > 0 && (
                    <span className="border-gp-border-control bg-gp-surface-control text-gp-text-secondary inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-xs font-semibold">
                      +{hiddenSamples} more
                    </span>
                  )}
                </>
              ) : (
                <span className="border-gp-border-control bg-gp-surface-control text-gp-text-muted inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold">
                  <Package className="size-3.5" aria-hidden="true" />
                  No samples
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={`report-details-${report.id}`}
            aria-label={`${expanded ? "Hide" : "View"} details for visit ${report.visitId}`}
            className="reports-view-button bg-gp-navy-900 focus-visible:ring-gp-gold-500/30 inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(16,29,54,0.24)] transition-[border-color,color,box-shadow,transform] duration-[190ms] hover:shadow-[0_6px_16px_rgba(16,29,54,0.3)] focus-visible:ring-3 focus-visible:outline-none sm:w-auto"
          >
            {expanded ? "Hide Details" : "View Details"}
            <ArrowRight
              className={cn(
                "reports-view-arrow text-gp-gold-500 size-4",
                expanded && "is-open",
              )}
              aria-hidden="true"
            />
          </button>
        </footer>

        <div
          id={`report-details-${report.id}`}
          className={cn("reports-details", expanded && "is-open")}
          aria-hidden={!expanded}
        >
          <div className="reports-details-inner">
            <section className="reports-details-panel border-gp-border-subtle mt-4 rounded-[12px] border bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.08em] uppercase">
                  Report Details
                </p>
                <button
                  type="button"
                  onClick={onToggle}
                  className="reports-details-hide text-gp-text-muted hover:bg-gp-gold-50 hover:text-gp-gold-700 focus-visible:ring-gp-gold-500/25 hidden h-8 cursor-pointer items-center gap-1.5 rounded-[8px] px-2.5 text-xs font-semibold transition-[background-color,color,transform] duration-[170ms] focus-visible:ring-2 focus-visible:outline-none sm:inline-flex"
                >
                  Hide Details
                  <ArrowRight
                    className="text-gp-gold-500 size-3.5 -rotate-90"
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div className="reports-details-grid mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="reports-detail-group">
                  <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.06em] uppercase">
                    Visit Information
                  </p>
                  <div className="mt-3 space-y-3">
                    <MetricCell
                      icon={FileText}
                      label="Full Visit ID"
                      value={
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                          <span className="min-w-0 font-mono text-xs break-all">
                            {report.visitId}
                          </span>
                          <CopyReportId value={report.visitId} />
                        </span>
                      }
                    />
                    <MetricCell
                      icon={CalendarDays}
                      label="Visit Date"
                      value={report.visitDate || "Not available"}
                    />
                    <MetricCell
                      icon={Clock}
                      label="Duration"
                      value={report.duration || "Not provided"}
                    />
                  </div>
                </div>

                <div className="reports-detail-group">
                  <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.06em] uppercase">
                    Submission
                  </p>
                  <div className="mt-3 space-y-3">
                    <MetricCell
                      icon={CalendarDays}
                      label="Submitted"
                      value={report.createdAt || "Not available"}
                    />
                    <MetricCell
                      icon={Star}
                      label="Rating"
                      value={`${rating.toFixed(1)} / 5 - ${ratingLabel(rating)}`}
                    />
                    <MetricCell
                      icon={Package}
                      label="Samples"
                      value={`${report.samplesProvided.length} total`}
                    />
                  </div>
                </div>

                {(representativeName || doctorName) && (
                  <div className="reports-detail-group">
                    <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.06em] uppercase">
                      People
                    </p>
                    <div className="mt-3 space-y-3">
                      {representativeName && (
                        <MetricCell
                          icon={User2}
                          label="Representative"
                          value={
                            <span dir="auto" className="break-words">
                              {representativeName}
                            </span>
                          }
                        />
                      )}
                      {doctorName && (
                        <MetricCell
                          icon={Stethoscope}
                          label="Doctor"
                          value={
                            <span dir="auto" className="break-words">
                              {doctorName}
                            </span>
                          }
                        />
                      )}
                    </div>
                  </div>
                )}

                {report.visitPurpose && (
                  <div className="reports-detail-group">
                    <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.06em] uppercase">
                      Visit Purpose
                    </p>
                    <p
                      className="text-gp-text-secondary mt-3 text-sm leading-6 break-words whitespace-pre-wrap"
                      dir="auto"
                    >
                      {report.visitPurpose}
                    </p>
                  </div>
                )}
              </div>

              {report.discussedTopics.length > 0 && (
                <div className="border-gp-border-subtle mt-4 border-t pt-4">
                  <p className="text-gp-text-muted flex items-center gap-2 text-[11px] font-semibold tracking-[0.06em] uppercase">
                    <MessageSquareText
                      className="text-gp-gold-600 size-3.5"
                      aria-hidden="true"
                    />
                    Discussed Topics
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {report.discussedTopics.map((topic, index) => (
                      <span
                        key={`${topic}-${index}`}
                        className="border-gp-border-control text-gp-navy-900 inline-flex min-h-7 items-center rounded-full border bg-white px-2.5 py-1 text-xs font-semibold"
                        dir="auto"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {report.samplesProvided.length > 0 && (
                <div className="border-gp-border-subtle mt-4 border-t pt-4">
                  <p className="text-gp-text-muted flex items-center gap-2 text-[11px] font-semibold tracking-[0.06em] uppercase">
                    <Package
                      className="text-gp-gold-600 size-3.5"
                      aria-hidden="true"
                    />
                    Samples Provided
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {report.samplesProvided.map((sample, index) => (
                      <span
                        key={`${sample}-${index}`}
                        className="reports-sample-chip border-gp-gold-300 text-gp-navy-900 inline-flex min-h-7 max-w-full items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-xs font-semibold"
                        dir="auto"
                      >
                        <Package
                          className="reports-sample-chip-icon text-gp-gold-600 size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 truncate">{sample}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {report.doctorFeedback && (
                <DetailText
                  title="Doctor Feedback"
                  value={report.doctorFeedback}
                />
              )}

              {report.notes && (
                <DetailText title="Additional Notes" value={report.notes} />
              )}
            </section>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryCard({
  label,
  value,
  helper,
  icon: Icon,
  tone,
  index,
}: {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: "gold" | "navy" | "success" | "warning";
  index: number;
}) {
  const toneClassName = {
    gold: {
      shell: "border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700",
      rail: "bg-gp-gold-500 group-hover/card:bg-gp-gold-600",
    },
    navy: {
      shell: "border-gp-border-control bg-gp-surface-subtle text-gp-navy-900",
      rail: "bg-gp-navy-900",
    },
    success: {
      shell: "border-gp-success-border bg-gp-success-soft text-gp-success",
      rail: "bg-gp-success",
    },
    warning: {
      shell: "border-gp-warning-border bg-gp-warning-soft text-gp-warning",
      rail: "bg-gp-warning",
    },
  }[tone];

  return (
    <Card
      className="reports-kpi-card reports-section-enter border-gp-border-default bg-gp-surface-card shadow-gp-card group/card relative gap-0 overflow-hidden rounded-[14px] border py-0"
      style={
        {
          "--reports-enter-delay": `${70 + index * 50}ms`,
        } as CSSProperties
      }
    >
      <span
        className={cn(
          "reports-kpi-rail absolute top-0 bottom-0 left-0 w-[3px]",
          toneClassName.rail,
        )}
        aria-hidden="true"
      />
      <CardContent className="flex min-h-[96px] items-center gap-4 py-4 pr-5 pl-[22px] sm:py-5">
        <span
          className={cn(
            "reports-kpi-icon-shell flex size-10 shrink-0 items-center justify-center rounded-[10px] border",
            toneClassName.shell,
          )}
        >
          <Icon className="reports-kpi-icon size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-gp-text-muted text-[11px] leading-4 font-semibold tracking-[0.04em] uppercase">
            {label}
          </p>
          <p className="reports-kpi-value text-gp-navy-900 mt-1.5 text-2xl leading-none font-semibold">
            {value}
          </p>
          <p className="text-gp-text-placeholder mt-1.5 truncate text-xs font-medium">
            {helper}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ManagerVisitReports({
  reports,
  page = 1,
  limit = 10,
  totalCount = 0,
}: ManagerVisitReportsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [ratingTab, setRatingTab] = useState<RatingTab>("all");
  const [dateSelection, setDateSelection] = useState<DateSelection>({
    mode: "range",
  });
  const [sampleFilter, setSampleFilter] = useState<SampleFilter>("all");
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const tabRefs = useRef<Record<RatingTab, HTMLButtonElement | null>>({
    all: null,
    excellent: null,
    positive: null,
    needsReview: null,
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsPageTransitioning(false);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [dateSelection, limit, page, query, ratingTab, sampleFilter]);

  const ratingCounts = useMemo(
    () => ({
      all: reports.length,
      excellent: reports.filter((report) => parseRating(report.rating) >= 5)
        .length,
      positive: reports.filter((report) => {
        const rating = parseRating(report.rating);
        return rating >= 4 && rating < 5;
      }).length,
      needsReview: reports.filter((report) => parseRating(report.rating) < 4)
        .length,
    }),
    [reports],
  );

  const dateSelectionKey = getDateSelectionKey(dateSelection);
  const hasActiveDateFilter = isDateSelectionActive(dateSelection);
  const dateFilterLabel = formatDateSelectionLabel(dateSelection);

  const searchedReports = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    if (!trimmed) return reports;

    return reports.filter((report) => {
      const typedReport = report as ManagerVisitReport;

      return [
        report.id,
        report.visitId,
        report.visitPurpose,
        typedReport.doctorNameAR,
        typedReport.doctorNameEN,
        getRepresentativeDisplay(typedReport),
        report.createdAt,
        report.visitDate,
        report.duration,
        ...report.samplesProvided,
        ...report.discussedTopics,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(trimmed),
      );
    });
  }, [query, reports]);

  const ratingFilteredReports = useMemo(
    () =>
      searchedReports.filter((report) => {
        const rating = parseRating(report.rating);

        if (ratingTab === "excellent") return rating >= 5;
        if (ratingTab === "positive") return rating >= 4 && rating < 5;
        if (ratingTab === "needsReview") return rating < 4;
        return true;
      }),
    [ratingTab, searchedReports],
  );

  const dateFilteredReports = useMemo(
    () =>
      ratingFilteredReports.filter((report) =>
        reportMatchesVisitDateSelection(report, dateSelection),
      ),
    [dateSelection, ratingFilteredReports],
  );

  const filteredReports = useMemo(
    () =>
      dateFilteredReports.filter((report) => {
        const samplesCount = report.samplesProvided.length;

        if (sampleFilter === "withSamples") return samplesCount > 0;
        if (sampleFilter === "withoutSamples") return samplesCount === 0;
        return true;
      }),
    [dateFilteredReports, sampleFilter],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setExpandedReportId(null);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [dateSelectionKey, limit, page, query, ratingTab, sampleFilter]);

  useEffect(() => {
    if (
      expandedReportId &&
      !filteredReports.some((report) => report.id === expandedReportId)
    ) {
      const timeout = window.setTimeout(() => {
        setExpandedReportId(null);
      }, 0);

      return () => window.clearTimeout(timeout);
    }
  }, [expandedReportId, filteredReports]);

  const averageRating =
    reports.length > 0
      ? reports.reduce((sum, report) => sum + parseRating(report.rating), 0) /
        reports.length
      : 0;
  const reportsThisMonth = reports.filter((report) =>
    isThisMonth(report.createdAt),
  ).length;
  const samplesDistributed = reports.reduce(
    (sum, report) => sum + report.samplesProvided.length,
    0,
  );
  const hasActiveFilters =
    query.trim().length > 0 ||
    ratingTab !== "all" ||
    hasActiveDateFilter ||
    sampleFilter !== "all";
  const emptyCopy = hasActiveFilters
    ? "Try changing your filters or search query."
    : "Visit reports will appear here once medical representatives submit them.";

  function resetFilters() {
    setQuery("");
    setRatingTab("all");
    setDateSelection({ mode: "range" });
    setSampleFilter("all");
    setExpandedReportId(null);
    resetPageToFirst();
  }

  function selectTab(nextTab: RatingTab, shouldFocus = false) {
    setRatingTab(nextTab);
    setExpandedReportId(null);
    resetPageToFirst();
    if (shouldFocus) {
      window.requestAnimationFrame(() => tabRefs.current[nextTab]?.focus());
    }
  }

  function resetPageToFirst() {
    if (page <= 1) return;

    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", "1");
    setIsPageTransitioning(true);
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleSearchChange(value: string) {
    setQuery(value);
    setExpandedReportId(null);
    resetPageToFirst();
  }

  function handleApplyDateFilter(nextSelection: DateSelection) {
    setDateSelection(nextSelection);
    setExpandedReportId(null);
    resetPageToFirst();
  }

  function clearDateFilter() {
    setDateSelection({ mode: "range" });
    setExpandedReportId(null);
    resetPageToFirst();
  }

  function handleSampleFilterChange(value: string) {
    setSampleFilter(value as SampleFilter);
    setExpandedReportId(null);
    resetPageToFirst();
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentTab: RatingTab,
  ) {
    const orderedTabs = ratingTabs.map((tab) => tab.id);
    const currentIndex = orderedTabs.indexOf(currentTab);
    let nextTab: RatingTab | undefined;

    if (event.key === "Home") nextTab = orderedTabs[0];
    else if (event.key === "End") nextTab = orderedTabs.at(-1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextTab =
        orderedTabs[
          (currentIndex - 1 + orderedTabs.length) % orderedTabs.length
        ];
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextTab = orderedTabs[(currentIndex + 1) % orderedTabs.length];
    }

    if (!nextTab) return;
    event.preventDefault();
    selectTab(nextTab, true);
  }

  return (
    <>
      <section
        aria-label="Visit reports summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <SummaryCard
          label="Total Reports"
          value={totalCount.toLocaleString()}
          helper="Reports available"
          icon={FileText}
          tone="gold"
          index={0}
        />
        <SummaryCard
          label="Average Rating"
          value={averageRating ? averageRating.toFixed(1) : "0.0"}
          helper="On this page"
          icon={Star}
          tone="navy"
          index={1}
        />
        <SummaryCard
          label="This Month"
          value={reportsThisMonth.toLocaleString()}
          helper="Loaded reports submitted"
          icon={CalendarDays}
          tone="warning"
          index={2}
        />
        <SummaryCard
          label="Samples Distributed"
          value={samplesDistributed.toLocaleString()}
          helper="Across loaded reports"
          icon={Package}
          tone="success"
          index={3}
        />
      </section>

      <section className="reports-directory reports-section-enter border-gp-border-default bg-gp-surface-card shadow-gp-card overflow-hidden rounded-[16px] border">
        <header className="border-gp-border-subtle border-b px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-6">
            <div className="min-w-0">
              <h2 className="text-gp-navy-900 text-lg font-semibold">
                Visit Reports
              </h2>
              <p
                key={`${ratingTab}-${dateSelectionKey}-${filteredReports.length}-${query}`}
                className="reports-count-refresh text-gp-text-muted mt-0.5 text-sm font-medium"
                aria-live="polite"
              >
                {filteredReports.length}{" "}
                {filteredReports.length === 1 ? "report" : "reports"} shown on
                this page
              </p>
            </div>

            <div className="reports-tabs-scroll max-w-full overflow-x-auto overscroll-x-contain pb-0.5 lg:self-center">
              <div
                role="tablist"
                aria-label="Filter visit reports by rating"
                className="border-gp-border-control bg-gp-surface-control grid min-w-[580px] grid-cols-4 rounded-[12px] border p-1 lg:min-w-[560px]"
              >
                {ratingTabs.map((option) => {
                  const Icon = option.icon;
                  const isSelected = ratingTab === option.id;

                  return (
                    <button
                      key={option.id}
                      ref={(element) => {
                        tabRefs.current[option.id] = element;
                      }}
                      type="button"
                      role="tab"
                      id={`reports-rating-tab-${option.id}`}
                      aria-selected={isSelected}
                      aria-controls="reports-results"
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => selectTab(option.id)}
                      onKeyDown={(event) => handleTabKeyDown(event, option.id)}
                      className={cn(
                        "reports-rating-tab focus-visible:ring-gp-gold-500/25 relative flex min-h-10 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] px-2 text-xs font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-[190ms] focus-visible:ring-3 focus-visible:outline-none sm:text-sm",
                        isSelected
                          ? "bg-gp-navy-900 text-white shadow-[0_4px_10px_rgba(16,29,54,0.22)]"
                          : "text-gp-text-muted hover:text-gp-navy-900 hover:bg-gp-navy-900/5 border border-transparent",
                      )}
                    >
                      <Icon
                        className={cn(
                          "hidden size-3.5 shrink-0 sm:block",
                          isSelected && "text-gp-gold-500",
                        )}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 truncate">{option.label}</span>
                      <span
                        className={cn(
                          "reports-tab-count inline-flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] leading-4 transition-colors duration-[190ms]",
                          isSelected
                            ? "text-gp-gold-500 bg-white/10"
                            : "bg-gp-border-subtle text-gp-text-muted",
                        )}
                      >
                        {ratingCounts[option.id]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="reports-search-field relative w-full max-w-full lg:ml-auto lg:max-w-md">
              <Search
                className="reports-search-icon text-gp-text-placeholder pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search reports..."
                aria-label="Search visit reports"
                className="reports-search-input border-gp-border-control bg-gp-surface-card text-gp-navy-900 placeholder:text-gp-text-placeholder focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/10 h-11 rounded-[10px] pr-10 pl-10 text-sm font-medium shadow-none lg:h-10"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  aria-label="Clear report search"
                  className="reports-search-clear text-gp-text-muted hover:bg-gp-gold-50 hover:text-gp-gold-700 focus-visible:ring-gp-gold-500/25 absolute top-1/2 right-2.5 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[8px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <ReportsDateFilter
              selection={dateSelection}
              onApply={handleApplyDateFilter}
              onClear={clearDateFilter}
            />

            {hasActiveDateFilter && (
              <button
                type="button"
                onClick={clearDateFilter}
                aria-label={`Clear visit date filter ${dateFilterLabel}`}
                className="reports-date-chip border-gp-gold-300 bg-gp-gold-50 text-gp-navy-900 hover:border-gp-gold-500 hover:bg-gp-surface-hover focus-visible:ring-gp-gold-500/25 inline-flex min-h-10 max-w-full cursor-pointer items-center gap-2 rounded-[10px] border px-3 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-[170ms] focus-visible:ring-3 focus-visible:outline-none"
              >
                <CalendarDays
                  className="text-gp-gold-600 size-4"
                  aria-hidden="true"
                />
                <span className="min-w-0 truncate">{dateFilterLabel}</span>
                <X className="size-3.5 shrink-0" aria-hidden="true" />
              </button>
            )}

            <Select
              value={sampleFilter}
              onValueChange={handleSampleFilterChange}
            >
              <SelectTrigger className="reports-select-trigger data-placeholder:text-gp-text-placeholder border-gp-border-control bg-gp-surface-card text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-surface-hover focus-visible:border-gp-gold-500 h-11 w-full cursor-pointer px-3 text-sm font-semibold shadow-none transition-[border-color,box-shadow,background-color] duration-[170ms] focus-visible:ring-3 focus-visible:ring-[#C9A44C]/15 sm:w-48 lg:h-10">
                <Package
                  className="text-gp-gold-600 size-4"
                  aria-hidden="true"
                />
                <SelectValue placeholder="All Samples" />
              </SelectTrigger>
              <SelectContent className="reports-select-content border-gp-border-control bg-white p-0 shadow-[0_10px_24px_rgba(15,23,42,0.12)] [&>div:not([data-slot])]:p-1">
                <SelectItem value="all" className="reports-select-item">
                  All Samples
                </SelectItem>
                <SelectItem value="withSamples" className="reports-select-item">
                  Has Samples
                </SelectItem>
                <SelectItem
                  value="withoutSamples"
                  className="reports-select-item"
                >
                  No Samples
                </SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="reports-reset-button border-gp-border-control bg-gp-surface-card text-gp-text-secondary hover:border-gp-gold-300 hover:bg-gp-gold-50 hover:text-gp-gold-700 focus-visible:ring-gp-gold-500/25 inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border px-3 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-[170ms] focus-visible:ring-3 focus-visible:outline-none sm:w-auto lg:h-10"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Reset
              </button>
            )}
          </div>
        </header>

        <div
          id="reports-results"
          role="tabpanel"
          aria-labelledby={`reports-rating-tab-${ratingTab}`}
          aria-busy={isPageTransitioning}
          className={cn(
            "reports-results-transition p-4 sm:p-5",
            isPageTransitioning && "reports-results-exit",
          )}
        >
          {filteredReports.length > 0 ? (
            <div className="flex flex-col gap-3.5">
              {filteredReports.map((report, index) => (
                <ReportCard
                  key={report.id}
                  report={report as ManagerVisitReport}
                  animationIndex={index}
                  expanded={expandedReportId === report.id}
                  onToggle={() =>
                    setExpandedReportId((currentId) =>
                      currentId === report.id ? null : report.id,
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="reports-empty-state border-gp-border-control bg-gp-surface-subtle rounded-[14px] border border-dashed px-5 py-10 text-center">
              <span className="bg-gp-gold-50 text-gp-gold-700 mx-auto flex size-12 items-center justify-center rounded-full">
                <FileText className="size-5" aria-hidden="true" />
              </span>
              <h3 className="text-gp-navy-900 mt-4 text-base font-semibold">
                No visit reports found
              </h3>
              <p className="text-gp-text-muted mx-auto mt-2 max-w-md text-sm leading-6 font-medium">
                {emptyCopy}
              </p>
            </div>
          )}
        </div>

        <TablePaginationFooter
          page={page}
          limit={limit}
          totalCount={totalCount}
          itemLabel="reports"
          ariaLabel="Visit reports pagination"
          pageNavAriaLabel="Visit report pages"
          tone="navy"
          onPageChangeStart={() => setIsPageTransitioning(true)}
        />
      </section>
    </>
  );
}
