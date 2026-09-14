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
  const numYear = Number(year);
  const numMonth = Number(month);

  if (quickSelectId === "month") {
    const lastDayOfMonth = new Date(Date.UTC(numYear, numMonth, 0)).getUTCDate();
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

function isDateInSelection(
  date: Date,
  selection: SalesDateSelection,
  boundary?: "start" | "middle" | "end",
): boolean {
  if (!selection.from) return false;

  const currentKey = getDateKey(toCalendarDate(date));
  const fromKey = getDateKey(selection.from);
  const toKey = getDateKey(selection.to ?? selection.from);

  if (boundary === "start") {
    return currentKey === fromKey && fromKey !== toKey;
  }

  if (boundary === "end") {
    return currentKey === toKey && fromKey !== toKey;
  }

  if (boundary === "middle") {
    return currentKey > fromKey && currentKey < toKey;
  }

  return currentKey >= fromKey && currentKey <= toKey;
}

export function SalesDateFilter({
  selectedDate = "",
  selectedDateFrom = "",
  selectedDateTo = "",
}: SalesDateFilterProps) {
  const { role } = useRoleUI();
  const router = useRouter();
  const pathname = usePathname();
  const isRep = role === "MEDICAL_REP" || pathname?.startsWith("/rep");
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

  const previewSelection = useMemo(() => {
    if (!draftSelection.from || draftSelection.to || !hoveredDate) {
      return null;
    }

    return normalizeSelection(draftSelection.from, hoveredDate);
  }, [draftSelection.from, draftSelection.to, hoveredDate]);

  function applySelectionToUrl(selection: SalesDateSelection) {
    const params = new URLSearchParams(searchParams.toString());
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
    const nextUrl = `${pathname}?${params.toString()}`;
    router.push(nextUrl, { scroll: false });
  }

  function handlePopoverOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      setDraftSelection(appliedSelection);
      setHoveredDate(null);
      setVisibleMonth(appliedSelection.from ?? toCalendarDate(new Date()));
    }
  }

  function handleDraftDayClick(clickedDate: Date) {
    setHoveredDate(null);
    setDraftSelection((currentSelection) => {
      if (!currentSelection.from || currentSelection.to) {
        return { from: clickedDate };
      }

      const fromKey = getDateKey(currentSelection.from);
      const clickedKey = getDateKey(clickedDate);

      if (clickedKey < fromKey) {
        return { from: clickedDate, to: currentSelection.from };
      }

      return { from: currentSelection.from, to: clickedDate };
    });
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

    applySelectionToUrl(draftSelection);
    setOpen(false);
  }

  function handleCancelDate() {
    setDraftSelection(appliedSelection);
    setHoveredDate(null);
    setOpen(false);
  }

  function handleClearDate(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    applySelectionToUrl({});
    setDraftSelection({});
    setHoveredDate(null);
    setOpen(false);
  }

  function handleMonthChange(nextMonth: Date) {
    const currentMonthKey = `${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}`;
    const nextMonthKey = `${nextMonth.getFullYear()}-${nextMonth.getMonth()}`;

    if (currentMonthKey === nextMonthKey) {
      return;
    }

    const direction: MonthMotionDirection =
      nextMonth.getTime() > visibleMonth.getTime() ? "next" : "previous";

    setMonthMotionDirection(direction);
    setVisibleMonth(toCalendarDate(nextMonth));
    window.setTimeout(() => setMonthMotionDirection("none"), 220);
  }

  const activeQuickSelectId = useMemo(() => {
    return (
      quickSelectOptions.find((option) =>
        isSameSelection(draftSelection, getQuickSelection(option.id)),
      )?.id ?? null
    );
  }, [draftSelection]);

  const hasAppliedDate = Boolean(appliedSelection.from);
  const formattedTriggerLabel = formatDateSelection(appliedSelection);

  const dayPickerSelection: DateRange | undefined = draftSelection.from
    ? {
        from: draftSelection.from,
        to: draftSelection.to ?? draftSelection.from,
      }
    : undefined;

  return (
    <Popover open={open} onOpenChange={handlePopoverOpenChange}>
      <div className="relative inline-flex">
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Filter sales by date"
            className={cn(
              "sales-date-trigger group relative flex h-10 w-[240px] cursor-pointer items-center justify-between rounded-xl border bg-white px-3.5 text-sm font-semibold transition-[border-color,background-color,color,box-shadow] duration-[150ms] focus-visible:outline-none",
              hasAppliedDate
                ? isRep
                  ? "border-[#CBEFDD] bg-[#E9F8F1] text-[#168557] hover:border-[#168557] focus-visible:ring-2 focus-visible:ring-[#168557]/20"
                  : "border-[#E8D7A8] bg-[#FBF7EA] text-[#8A6515] hover:border-[#C9A44C] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20"
                : isRep
                  ? "border-[#E5E8EF] text-[#344054] hover:border-[#CBEFDD] hover:bg-[#F9FBF9] focus-visible:ring-2 focus-visible:ring-[#168557]/20"
                  : "border-[#E5E8EF] text-[#344054] hover:border-[#E8D7A8] hover:bg-[#FDFCF9] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20"
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <CalendarIcon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  hasAppliedDate
                    ? isRep
                      ? "text-[#168557]"
                      : "text-[#8A6515]"
                    : "text-[#667085] group-hover:text-[#182033]"
                )}
                aria-hidden="true"
              />
              <span className="truncate text-left">{formattedTriggerLabel}</span>
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
            <div className="mt-2 flex flex-wrap gap-1.5">
              {quickSelectOptions.map((option) => {
                const isSelected = activeQuickSelectId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleQuickSelect(option.id)}
                    className={cn(
                      "sales-date-chip rounded-[8px] border px-2.5 py-1 text-xs font-semibold transition-[background-color,border-color,color] duration-[150ms] focus-visible:outline-none",
                      isSelected
                        ? isRep
                          ? "border-[#CBEFDD] bg-[#E9F8F1] text-[#168557] focus-visible:ring-2 focus-visible:ring-[#168557]/20"
                          : "border-[#E8D7A8] bg-[#FBF7EA] text-[#8A6515] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20"
                        : "border-[#EEF1F6] bg-white text-[#475467] hover:border-[#D8DEE8] hover:bg-[#F9FAFB]"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#EEF1F6] bg-[#FBFCFE] px-3.5 py-3">
          <p className="min-w-0 pr-2 text-xs font-semibold text-[#667085]">
            {formatDateSelection(draftSelection)}
          </p>

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
