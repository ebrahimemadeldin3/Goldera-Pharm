"use client";

import { useMemo, useState, type MouseEvent } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useRoleUI } from "@/core/ui/role-ui-context";
import {
  cn,
  formatDateOnly,
  formatSaudiDateDisplay,
  getSaudiDateParts,
  getSaudiWeekdayIndex,
  parseDateValue,
} from "@/lib/utils";

interface SalesDateFilterProps {
  selectedDate?: string;
  selectedDateFrom?: string;
  selectedDateTo?: string;
}

type SalesDateSelection = {
  from?: Date;
  to?: Date;
};

type MonthMotionDirection = "next" | "previous" | "none";

const DATE_RANGE_SEPARATOR = " \u2013 ";
const quickSelectOptions = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "year", label: "This Year" },
] as const;

function toCalendarDate(date: Date): Date {
  return parseDateValue(formatDateOnly(date));
}

function parseDateKey(value?: string | null): Date | undefined {
  if (!value) return undefined;

  const date = parseDateValue(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function addCalendarDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400000);
}

function padDatePart(value: number): string {
  return String(value).padStart(2, "0");
}

function getDateKey(date?: Date): string {
  return date ? formatDateOnly(date) : "";
}

function normalizeSelection(from?: Date, to?: Date): SalesDateSelection {
  if (!from) return {};
  const normalizedFrom = toCalendarDate(from);

  if (!to) {
    return { from: normalizedFrom };
  }

  const normalizedTo = toCalendarDate(to);
  const fromKey = getDateKey(normalizedFrom);
  const toKey = getDateKey(normalizedTo);

  return fromKey <= toKey
    ? { from: normalizedFrom, to: normalizedTo }
    : { from: normalizedTo, to: normalizedFrom };
}

function getSelectionFromSearchParams({
  selectedDate,
  selectedDateFrom,
  selectedDateTo,
}: SalesDateFilterProps): SalesDateSelection {
  const rangeFrom = parseDateKey(selectedDateFrom);
  const rangeTo = parseDateKey(selectedDateTo);

  if (rangeFrom || rangeTo) {
    return normalizeSelection(rangeFrom ?? rangeTo, rangeTo ?? rangeFrom);
  }

  return normalizeSelection(parseDateKey(selectedDate));
}

function isSameSelection(
  left: SalesDateSelection,
  right: SalesDateSelection,
): boolean {
  return (
    getDateKey(left.from) === getDateKey(right.from) &&
    getDateKey(left.to) === getDateKey(right.to)
  );
}

function isSingleDateSelection(selection: SalesDateSelection): boolean {
  if (!selection.from) return false;
  return (
    !selection.to || getDateKey(selection.from) === getDateKey(selection.to)
  );
}

function formatSaudiMonthDay(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Riyadh",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatDateSelection(selection: SalesDateSelection): string {
  if (!selection.from) return "Pick a date";
  if (isSingleDateSelection(selection)) {
    return formatSaudiDateDisplay(selection.from);
  }

  const from = selection.from;
  const to = selection.to;
  if (!to) return formatSaudiDateDisplay(from);

  const fromParts = getSaudiDateParts(from);
  const toParts = getSaudiDateParts(to);
  const sameYear = fromParts.year === toParts.year;

  if (sameYear) {
    return `${formatSaudiMonthDay(from)}${DATE_RANGE_SEPARATOR}${formatSaudiMonthDay(to)}, ${toParts.year}`;
  }

  return `${formatSaudiDateDisplay(from)}${DATE_RANGE_SEPARATOR}${formatSaudiDateDisplay(to)}`;
}

function getQuickSelection(
  quickSelectId: (typeof quickSelectOptions)[number]["id"],
): SalesDateSelection {
  const now = new Date();
  const today = parseDateValue(formatDateOnly(now));

  if (quickSelectId === "today") {
    return { from: today };
  }

  if (quickSelectId === "week") {
    const weekDay = getSaudiWeekdayIndex(now);
    const from = addCalendarDays(today, -weekDay);
    const to = addCalendarDays(from, 6);
    return { from, to };
  }

  const { year, month } = getSaudiDateParts(now);

  if (quickSelectId === "month") {
    const lastDayOfMonth = new Date(Number(year), Number(month), 0).getDate();

    return {
      from: parseDateValue(`${year}-${month}-01`),
      to: parseDateValue(`${year}-${month}-${padDatePart(lastDayOfMonth)}`),
    };
  }

  return {
    from: parseDateValue(`${year}-01-01`),
    to: parseDateValue(`${year}-12-31`),
  };
}

function getPreviewSelection(
  draftSelection: SalesDateSelection,
  hoveredDate: Date | null,
): SalesDateSelection | null {
  if (!draftSelection.from || draftSelection.to || !hoveredDate) return null;

  return normalizeSelection(draftSelection.from, hoveredDate);
}

function isDateInSelection(
  date: Date,
  selection: SalesDateSelection,
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

export function SalesDateFilter({
  selectedDate = "",
  selectedDateFrom = "",
  selectedDateTo = "",
}: SalesDateFilterProps) {
  const { role } = useRoleUI();
  const isRep = role === "MEDICAL_REP";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const appliedSelection = useMemo(
    () =>
      getSelectionFromSearchParams({
        selectedDate,
        selectedDateFrom,
        selectedDateTo,
      }),
    [selectedDate, selectedDateFrom, selectedDateTo],
  );
  const [open, setOpen] = useState(false);
  const [draftSelection, setDraftSelection] =
    useState<SalesDateSelection>(appliedSelection);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    appliedSelection.from ?? toCalendarDate(new Date()),
  );
  const [monthMotionDirection, setMonthMotionDirection] =
    useState<MonthMotionDirection>("none");

  const previewSelection = useMemo(
    () => getPreviewSelection(draftSelection, hoveredDate),
    [draftSelection, hoveredDate],
  );
  const hasAppliedDate = Boolean(appliedSelection.from);
  const displayValue = formatDateSelection(appliedSelection);
  const draftDisplayValue = formatDateSelection(draftSelection);
  const dayPickerSelection = draftSelection.from
    ? ({ from: draftSelection.from, to: draftSelection.to } satisfies DateRange)
    : undefined;

  function pushDateSelection(selection: SalesDateSelection) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete("date");
    params.delete("dateFrom");
    params.delete("dateTo");

    if (selection.from) {
      const fromKey = getDateKey(selection.from);
      const toKey = getDateKey(selection.to);

      if (!selection.to || fromKey === toKey) {
        params.set("date", fromKey);
      } else {
        params.set("dateFrom", fromKey);
        params.set("dateTo", toKey);
      }
    }

    params.set("page", "1");

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      setDraftSelection(appliedSelection);
      setHoveredDate(null);
      setVisibleMonth(appliedSelection.from ?? toCalendarDate(new Date()));
    }
  }

  function handleDraftDayClick(date: Date) {
    const clickedDate = toCalendarDate(date);

    setHoveredDate(null);
    setDraftSelection((currentSelection) => {
      if (!currentSelection.from || currentSelection.to) {
        return { from: clickedDate };
      }

      return normalizeSelection(currentSelection.from, clickedDate);
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
    quickSelectId: (typeof quickSelectOptions)[number]["id"],
  ) {
    const nextSelection = getQuickSelection(quickSelectId);
    setDraftSelection(nextSelection);
    setHoveredDate(null);
    setVisibleMonth(nextSelection.from ?? toCalendarDate(new Date()));
  }

  function handleApplyDate() {
    if (!draftSelection.from) return;

    const nextSelection = normalizeSelection(
      draftSelection.from,
      draftSelection.to,
    );

    setOpen(false);

    if (!isSameSelection(appliedSelection, nextSelection)) {
      pushDateSelection(nextSelection);
    }
  }

  function handleCancelDate() {
    setDraftSelection(appliedSelection);
    setHoveredDate(null);
    setOpen(false);
  }

  function handleClearDate(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault();
    event?.stopPropagation();

    setDraftSelection({});
    setHoveredDate(null);
    setOpen(false);
    pushDateSelection({});
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <div className="relative">
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Open sales date filter"
            className={cn(
              "sales-date-filter-trigger flex h-11 w-full items-center rounded-[10px] border border-[#DDE3EE] bg-[#F9FAFB] px-3 text-left text-sm font-medium text-[#182033] shadow-none transition-[border-color,background-color,box-shadow,color] duration-[170ms] outline-none",
              isRep
                ? "hover:border-[#CBEFDD] hover:bg-[#F0FDF4]/50 focus-visible:border-[#168557] focus-visible:ring-[3px] focus-visible:ring-[#168557]/10"
                : "hover:border-[#E9DDB8] hover:bg-[#FFFDF7] focus-visible:border-[#C9A44C] focus-visible:ring-[3px] focus-visible:ring-[#C9A44C]/10",
              open && (isRep ? "border-[#168557] ring-[3px] ring-[#168557]/10" : "border-[#C9A44C] ring-[3px] ring-[#C9A44C]/10"),
              hasAppliedDate ? "pr-10" : "text-[#667085]",
            )}
          >
            <CalendarIcon
              className="mr-2 h-4 w-4 shrink-0 text-[#667085]"
              aria-hidden="true"
            />
            <span
              className={cn(
                "min-w-0 truncate",
                hasAppliedDate ? "text-[#182033]" : "text-[#98A2B3]",
              )}
            >
              {displayValue}
            </span>
          </button>
        </PopoverTrigger>

        {hasAppliedDate && (
          <button
            type="button"
            aria-label="Clear sales date filter"
            onClick={handleClearDate}
            className={cn(
              "sales-date-filter-clear absolute top-1/2 right-2.5 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-[#667085] transition-[background-color,color,transform] duration-[150ms] focus-visible:outline-none",
              isRep
                ? "hover:bg-[#E9F8F1] hover:text-[#168557] focus-visible:ring-2 focus-visible:ring-[#168557]/25"
                : "hover:bg-[#F8F1DC] hover:text-[#9A7426] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/25"
            )}
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      <PopoverContent
        align="start"
        collisionPadding={12}
        sideOffset={8}
        className="sales-date-popover-content w-[min(calc(100vw-24px),370px)] overflow-hidden rounded-2xl border border-[#E5E8EF] bg-white p-0 text-[#182033] shadow-[0_18px_46px_rgba(16,27,51,0.14)]"
      >
        <div className="p-3.5">
          <Calendar
            mode="range"
            month={visibleMonth}
            selected={dayPickerSelection}
            onDayClick={handleDraftDayClick}
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
            className={cn(
              "sales-date-calendar w-full p-0",
              isRep && "sales-date-calendar-rep"
            )}
            classNames={{
              table: cn(
                "sales-date-calendar-grid w-full border-collapse",
                monthMotionDirection === "next" &&
                  "sales-date-calendar-grid-next",
                monthMotionDirection === "previous" &&
                  "sales-date-calendar-grid-previous",
              ),
            }}
          />

          <div className="mt-3 border-t border-[#EEF1F6] pt-3">
            <p className="text-[11px] font-semibold tracking-[0.04em] text-[#667085] uppercase">
              Quick Select
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {quickSelectOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => handleQuickSelect(option.id)}
                  className={cn(
                    "sales-date-quick-button h-8 rounded-[9px] border border-[#E7EAF0] bg-[#FBFCFE] px-2 text-xs font-semibold text-[#344054] transition-[background-color,border-color,color,transform] duration-[150ms] hover:-translate-y-px focus-visible:outline-none",
                    isRep
                      ? "hover:border-[#CBEFDD] hover:bg-[#E9F8F1] hover:text-[#168557] focus-visible:ring-2 focus-visible:ring-[#168557]/20"
                      : "hover:border-[#E9DDB8] hover:bg-[#FBF7EA] hover:text-[#9A7426] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-[12px] border border-[#EEF1F6] bg-[#FBFCFE] px-3 py-2.5">
            <p className="text-[11px] font-semibold tracking-[0.04em] text-[#667085] uppercase">
              Selected
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-[#182033]">
              {draftDisplayValue}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[#EEF1F6] bg-[#FBFCFE] px-3.5 py-3">
          <button
            type="button"
            onClick={handleClearDate}
            disabled={!hasAppliedDate && !draftSelection.from}
            className={cn(
              "sales-date-action-clear h-9 rounded-[9px] px-3 text-sm font-semibold text-[#667085] transition-[background-color,color] duration-[150ms] hover:bg-[#F2F4F7] hover:text-[#344054] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#667085]",
              isRep ? "focus-visible:ring-2 focus-visible:ring-[#168557]/20" : "focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20"
            )}
          >
            Clear
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelDate}
              className={cn(
                "sales-date-action-cancel h-9 rounded-[9px] border border-[#E5E8EF] bg-white px-3 text-sm font-semibold text-[#344054] transition-[background-color,border-color,color] duration-[150ms] hover:border-[#D8DEE8] hover:bg-[#F9FAFB] focus-visible:outline-none",
                isRep ? "focus-visible:ring-2 focus-visible:ring-[#168557]/20" : "focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20"
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyDate}
              disabled={!draftSelection.from}
              className={cn(
                "sales-date-action-apply h-9 rounded-[9px] px-4 text-sm font-semibold text-white transition-[filter,transform,opacity] duration-[150ms] hover:-translate-y-px hover:brightness-[1.02] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0",
                isRep
                  ? "bg-[#168557] hover:bg-[#107349] shadow-[0_4px_12px_rgba(22,133,87,0.22)] focus-visible:ring-2 focus-visible:ring-[#168557]/25"
                  : "bg-[linear-gradient(135deg,#D8B85A_0%,#C9A44C_55%,#B18732_100%)] shadow-[0_4px_12px_rgba(185,139,50,0.18)] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/25"
              )}
            >
              Apply
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
