"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  addWeeks,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { DayButtonProps } from "react-day-picker";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import DayVisitsPanel from "@/features/visits/components/panels/DayVisitsPanel";
import WeekVisitsPanel from "@/features/visits/components/panels/WeekVisitsPanel";
import { Visit } from "@/features/visits/lib/types/ui";
import { useRoleUI } from "@/core/ui/role-ui-context";
import type { VisitStatus } from "@/lib/types";
import { cn, formatDateOnly } from "@/lib/utils";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

type VisitsPlannerProps = {
  visits: Visit[];
  reportBasePath?: string;
  page?: number;
  limit?: number;
  totalCount?: number;
};

type VisitMode = "day" | "week";
type MonthMotion = "next" | "previous";

const VISIT_STATUS_ORDER: VisitStatus[] = [
  "COMPLETED",
  "IN_PROGRESS",
  "SCHEDULED",
  "CANCELLED",
];

const visitStatusDotStyles: Record<VisitStatus, string> = {
  COMPLETED: "bg-[#20A66A]",
  IN_PROGRESS: "bg-[#3972D5]",
  SCHEDULED: "bg-[#C9A44C]",
  CANCELLED: "bg-[#D92D20]",
};

const statusLegend: Array<{ status: VisitStatus; label: string }> = [
  { status: "COMPLETED", label: "Completed" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "SCHEDULED", label: "Scheduled" },
  { status: "CANCELLED", label: "Cancelled" },
];

function VisitCalendarDayButton({
  className,
  day,
  modifiers,
  statusDotsByDate,
  isRep = false,
  children,
  ...props
}: DayButtonProps & { statusDotsByDate: Map<string, VisitStatus[]>; isRep?: boolean }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dateKey = formatDateOnly(day.date);
  const rawStatusDots = statusDotsByDate.get(dateKey) ?? [];
  const statusDots = isRep
    ? rawStatusDots.filter((s) => s === "CANCELLED")
    : rawStatusDots;

  const todayStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const dayStart = useMemo(() => {
    return new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
  }, [day.date]);

  const isPast = isRep && dayStart < todayStart;

  useEffect(() => {
    if (modifiers.focused && !isPast) buttonRef.current?.focus();
  }, [modifiers.focused, isPast]);

  const baseDayClasses =
    "visit-calendar-day-button relative flex flex-col items-center justify-center gap-0.5 rounded-[10px] border border-transparent bg-transparent text-sm leading-none font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out outline-none";

  const repDayClasses = isPast
    ? "size-9 sm:size-10 mx-auto opacity-35 cursor-not-allowed pointer-events-none text-[#98A2B3] border-transparent bg-transparent hover:bg-transparent hover:text-[#98A2B3] shadow-none"
    : cn(
        "size-9 sm:size-10 mx-auto text-[#182033] hover:bg-gp-rep-primary-soft hover:text-[#182033] focus-visible:ring-2 focus-visible:ring-gp-rep-primary/25",
        modifiers.outside && "text-[#98A2B3] opacity-40 hover:bg-transparent hover:text-[#98A2B3]",
        modifiers.today && !modifiers.selected && "border border-gp-rep-primary font-bold text-gp-rep-primary bg-transparent hover:bg-gp-rep-primary-soft hover:text-gp-rep-primary shadow-none",
        "data-[range-middle=true]:bg-gp-rep-primary-soft data-[range-middle=true]:text-gp-rep-primary data-[range-middle=true]:rounded-none",
        "data-[range-start=true]:bg-gp-rep-primary data-[range-start=true]:text-white",
        "data-[range-end=true]:bg-gp-rep-primary data-[range-end=true]:text-white",
        "data-[selected-single=true]:bg-gp-rep-primary data-[selected-single=true]:text-white data-[selected-single=true]:border-transparent data-[selected-single=true]:shadow-[0_4px_10px_rgba(22,133,87,0.22)]"
      );

  const managerDayClasses = cn(
    "text-[#182033] hover:bg-[#FFF8E5] hover:text-[#8A6515] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/25",
    "data-[range-middle=true]:bg-[#F8F1DC] data-[range-middle=true]:rounded-none",
    "data-[selected-single=true]:bg-[#101D36] data-[selected-single=true]:text-white data-[selected-single=true]:shadow-[0_6px_14px_rgba(16,29,54,0.22)]"
  );

  return (
    <button
      ref={buttonRef}
      disabled={modifiers.disabled || isPast}
      data-day={dateKey}
      data-selected-single={
        !isPast &&
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={!isPast && modifiers.range_start}
      data-range-end={!isPast && modifiers.range_end}
      data-range-middle={!isPast && modifiers.range_middle}
      className={cn(baseDayClasses, isRep ? repDayClasses : managerDayClasses, className)}
      {...props}
    >
      <span className="visit-calendar-day-number">{children}</span>
      {statusDots.length > 0 && !isPast && (
        <span className="visit-calendar-status-dots" aria-hidden="true">
          {statusDots.map((status) => (
            <span
              key={status}
              className={cn(
                "visit-calendar-status-dot",
                visitStatusDotStyles[status],
              )}
            />
          ))}
        </span>
      )}
    </button>
  );
}

export default function VisitsPlanner({
  visits = [],
  reportBasePath,
}: VisitsPlannerProps) {
  const [mode, setMode] = useState<VisitMode>("day");
  const [selected, setSelected] = useState<Date>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(() =>
    startOfMonth(new Date()),
  );
  const [monthMotion, setMonthMotion] = useState<MonthMotion>("next");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { role } = useRoleUI();
  const isRep = role === "MEDICAL_REP";

  const statusDotsByDate = useMemo(() => {
    const statusSetsByDate = new Map<string, Set<VisitStatus>>();

    visits.forEach((visit) => {
      const dateKey = formatDateOnly(visit.date);
      const existing = statusSetsByDate.get(dateKey) ?? new Set<VisitStatus>();
      existing.add(visit.status);
      statusSetsByDate.set(dateKey, existing);
    });

    return new Map(
      Array.from(statusSetsByDate.entries()).map(([dateKey, statuses]) => [
        dateKey,
        VISIT_STATUS_ORDER.filter((status) => statuses.has(status)),
      ]),
    );
  }, [visits]);

  const dayVisits = useMemo<Visit[]>(() => {
    return visits
      .filter((v) => isSameDay(v.date, selected))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [selected, visits]);

  const weekRange = useMemo(() => {
    const start = startOfWeek(selected, { weekStartsOn: 6 });
    const end = endOfWeek(selected, { weekStartsOn: 6 });
    return { start, end };
  }, [selected]);

  const weekVisits = useMemo<Visit[]>(() => {
    return visits
      .filter((v) =>
        isWithinInterval(v.date, {
          start: weekRange.start,
          end: weekRange.end,
        }),
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [weekRange, visits]);

  const activeVisits = mode === "day" ? dayVisits : weekVisits;
  const trimmedSearchQuery = searchQuery.trim();
  const isSearching = trimmedSearchQuery !== "";

  const filteredVisits = useMemo(() => {
    const term = trimmedSearchQuery.toLowerCase();
    if (!term) return activeVisits;

    return activeVisits.filter((v) => {
      if (v.person?.toLowerCase().includes(term)) return true;
      if (v.doctorNameEN?.toLowerCase().includes(term)) return true;
      if (v.doctorNameAR?.toLowerCase().includes(term)) return true;
      if (v.place?.toLowerCase().includes(term)) return true;
      if (v.statusLabel?.toLowerCase().includes(term)) return true;
      if (v.visitType?.toLowerCase().includes(term)) return true;
      return false;
    });
  }, [activeVisits, trimmedSearchQuery]);

  function selectDate(nextDate: Date) {
    if (isRep) {
      const nextStart = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (nextStart < todayStart) {
        return; // Prevent selecting past dates
      }
    }

    const nextMonth = startOfMonth(nextDate);

    if (!isSameMonth(nextDate, calendarMonth)) {
      setMonthMotion(isBefore(nextMonth, calendarMonth) ? "previous" : "next");
      setCalendarMonth(nextMonth);
    }

    setSelected(nextDate);
  }

  function handleMonthChange(nextMonth: Date) {
    if (isSameMonth(nextMonth, calendarMonth)) return;

    setMonthMotion(isAfter(nextMonth, calendarMonth) ? "next" : "previous");
    setCalendarMonth(nextMonth);
  }

  function handlePrevWeek() {
    const newSelected = addWeeks(selected, -1);
    selectDate(startOfWeek(newSelected, { weekStartsOn: 6 }));
  }

  function handleNextWeek() {
    const newSelected = addWeeks(selected, 1);
    selectDate(startOfWeek(newSelected, { weekStartsOn: 6 }));
  }

  function handleModeKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      setMode(mode === "day" ? "week" : "day");
    }
  }

  const modeIndex = mode === "day" ? 0 : 1;
  const selectedDateLabel = format(selected, "EEEE, MMMM d, yyyy");
  const shortSelectedDateLabel = format(selected, "MMM d, yyyy");
  const weekRangeLabel = `${format(weekRange.start, "MMM d")} - ${format(
    weekRange.end,
    "MMM d, yyyy",
  )}`;
  const resultsTitle = mode === "day" ? selectedDateLabel : weekRangeLabel;
  const resultsHelper =
    mode === "day" ? "Daily visit schedule" : "Weekly visit schedule";
  const countLabel = `${filteredVisits.length} ${
    filteredVisits.length === 1 ? "visit" : "visits"
  }`;
  const recordsSummary = `Showing ${filteredVisits.length} of ${
    activeVisits.length
  } ${mode === "day" ? "day" : "week"} visits`;
  const resultsMotionKey = `${mode}-${formatDateOnly(selected)}-${trimmedSearchQuery}-${filteredVisits.length}`;

  return (
    <section className="visits-page-enter visits-page-enter-delay-2 overflow-hidden rounded-[18px] border border-[#E5E8EF] bg-white shadow-none">
      <div className="border-b border-[#EEF1F6] px-4 py-5 sm:px-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-[10px]",
                  isRep ? "bg-[#E9F8F1] text-[#168557]" : "bg-[#FBF7EA] text-[#B18732]"
                )}
              >
                <CalendarDays className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-[#182033]">
                  Visit Workspace
                </h2>
                <p
                  key={recordsSummary}
                  className="visits-count-refresh mt-1 text-xs font-medium text-[#667085]"
                >
                  {recordsSummary}
                </p>
              </div>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,240px)_minmax(260px,320px)] xl:w-auto">
            <div
              role="tablist"
              aria-label="Visit calendar view"
              className="visits-mode-switch relative grid h-11 grid-cols-2 items-center overflow-hidden rounded-[13px] border border-[#E7EAF0] bg-[#F5F7FA] p-1"
              style={
                {
                  "--visits-mode-index": modeIndex,
                } as CSSProperties
              }
            >
              <span
                className="visits-mode-switch-indicator"
                aria-hidden="true"
              />
              {(["day", "week"] as VisitMode[]).map((viewMode) => {
                const isActive = mode === viewMode;
                const label = viewMode === "day" ? "Day View" : "Week View";

                return (
                  <button
                    key={viewMode}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="visits-results-panel"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setMode(viewMode)}
                    onKeyDown={handleModeKeyDown}
                    className={`visits-mode-tab relative z-10 flex h-full min-w-0 items-center justify-center rounded-[9px] px-3 text-xs font-semibold transition-[background-color,color,transform] duration-[160ms] ease-out outline-none focus-visible:ring-2 focus-visible:ring-[#C9A44C]/30 focus-visible:ring-offset-1 focus-visible:ring-offset-[#F5F7FA] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
                      isActive ? "text-[#182033]" : "text-[#667085]"
                    }`}
                  >
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="visits-search-field relative min-w-0">
              <Search
                className="visits-search-icon pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#98A2B3]"
                aria-hidden="true"
              />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search visits..."
                aria-label="Search visits"
                className="visits-search-input h-11 w-full rounded-[12px] border border-[#E5E8EF] bg-white pr-10 pl-10 text-sm font-medium text-[#182033] transition-[border-color,background-color,box-shadow] duration-[160ms] outline-none placeholder:text-[#98A2B3] focus:border-[#C9A44C] focus:bg-[#FFFDF7] focus:ring-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear visit search"
                  className="visits-search-clear absolute top-1/2 right-2.5 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-[#98A2B3] transition-[background-color,color] duration-[150ms] hover:bg-[#F4F6FA] hover:text-[#182033] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/25 focus-visible:outline-none"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isSearching && (
        <div className="visits-search-scope border-b border-[#EEF1F6] bg-[#FBFCFE] px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-2 text-xs font-medium text-[#667085] sm:flex-row sm:items-center sm:justify-between">
            <span>
              Filtering current {mode} view for{" "}
              <strong className="font-semibold text-[#182033]">
                &quot;{searchQuery}&quot;
              </strong>
              . Showing {filteredVisits.length} matching records.
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-[#9A7628] transition-[background-color,color] duration-[150ms] hover:bg-[#FFF8E5] hover:text-[#182033] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/25 focus-visible:outline-none"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Clear search
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(260px,31%)_minmax(0,1fr)] xl:grid-cols-[minmax(280px,30%)_minmax(0,1fr)]">
        <aside className="visits-calendar-panel rounded-[16px] border border-[#E5E8EF] bg-[#FBFCFE] p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-[#182033]">
                {format(calendarMonth, "MMMM yyyy")}
              </h3>
              <p className="mt-1 text-xs font-medium text-[#667085]">
                {mode === "day"
                  ? shortSelectedDateLabel
                  : `${weekRangeLabel} selected`}
              </p>
            </div>
            <span
              className={cn(
                "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold",
                isRep
                  ? "border-[#CBEFDD] bg-[#E9F8F1] text-[#168557]"
                  : "border-[#E9DDB8] bg-[#FFF8E5] text-[#8A6515]"
              )}
            >
              STATUS
            </span>
          </div>

          <div
            key={`${format(calendarMonth, "yyyy-MM")}-${monthMotion}`}
            className={`visits-calendar-grid-${monthMotion}`}
          >
            <ShadCalendar
              mode="single"
              selected={selected}
              month={calendarMonth}
              onMonthChange={handleMonthChange}
              onSelect={(d) => d && selectDate(d)}
              disabled={
                isRep
                  ? {
                      before: new Date(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        new Date().getDate()
                      ),
                    }
                  : undefined
              }
              className={cn(
                "visits-calendar rounded-none bg-transparent p-0",
                isRep && "visits-calendar-rep"
              )}
              components={{
                DayButton: (dayButtonProps) => (
                  <VisitCalendarDayButton
                    {...dayButtonProps}
                    statusDotsByDate={statusDotsByDate}
                    isRep={isRep}
                  />
                ),
              }}
            />
          </div>

          <div className="mt-4 border-t border-[#E5E8EF] pt-3">
            <p className="mb-2 text-[10px] font-bold tracking-[0.08em] text-[#667085] uppercase">
              {isRep ? "Legend" : "Status"}
            </p>
            {isRep ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-[#667085]">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 shrink-0 rounded-xs bg-[#168557]" aria-hidden="true" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 shrink-0 rounded-full border border-[#168557] bg-transparent" aria-hidden="true" />
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 shrink-0 rounded-full bg-[#D92D20]" aria-hidden="true" />
                  <span>Cancelled</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] font-medium text-[#667085]">
                {statusLegend.map((item) => (
                  <div
                    key={item.status}
                    className="flex min-w-0 items-center gap-2"
                  >
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        visitStatusDotStyles[item.status],
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <section
          id="visits-results-panel"
          className="visits-results-panel min-w-0 overflow-hidden rounded-[16px] border border-[#E5E8EF] bg-white"
        >
          <div className="flex flex-col gap-3 border-b border-[#EEF1F6] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-[#182033]">
                {resultsTitle}
              </h3>
              <p className="mt-1 text-xs font-medium text-[#667085]">
                {resultsHelper}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {mode === "week" && (
                <div className="visits-week-nav inline-flex h-9 items-center gap-1 rounded-[11px] border border-[#E5E8EF] bg-[#F9FAFB] p-1">
                  <button
                    type="button"
                    onClick={handlePrevWeek}
                    aria-label="Previous week"
                    title="Previous week"
                    className={cn(
                      "visits-week-nav-button visits-week-nav-button-prev inline-flex size-7 items-center justify-center rounded-[8px] text-[#667085] transition-[background-color,color,transform] duration-[170ms] focus-visible:ring-2 focus-visible:outline-none",
                      isRep
                        ? "hover:bg-[#E9F8F1] hover:text-[#168557] focus-visible:ring-[#168557]/25"
                        : "hover:bg-white hover:text-[#8A6515] focus-visible:ring-[#C9A44C]/25"
                    )}
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                  </button>
                  <span className="px-2 text-xs font-semibold whitespace-nowrap text-[#182033]">
                    {format(weekRange.start, "MMM d")} -{" "}
                    {format(weekRange.end, "MMM d")}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextWeek}
                    aria-label="Next week"
                    title="Next week"
                    className={cn(
                      "visits-week-nav-button visits-week-nav-button-next inline-flex size-7 items-center justify-center rounded-[8px] text-[#667085] transition-[background-color,color,transform] duration-[170ms] focus-visible:ring-2 focus-visible:outline-none",
                      isRep
                        ? "hover:bg-[#E9F8F1] hover:text-[#168557] focus-visible:ring-[#168557]/25"
                        : "hover:bg-white hover:text-[#8A6515] focus-visible:ring-[#C9A44C]/25"
                    )}
                  >
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                </div>
              )}

              <span className="inline-flex h-8 items-center rounded-full border border-[#E5E8EF] bg-[#F9FAFB] px-3 text-xs font-bold text-[#344054]">
                {countLabel}
              </span>
            </div>
          </div>

          <div
            key={resultsMotionKey}
            className="visits-results-content-enter p-4 sm:p-5"
          >
            {mode === "day" ? (
              <DayVisitsPanel
                date={selected}
                visits={filteredVisits}
                reportBasePath={reportBasePath}
                isSearching={isSearching}
              />
            ) : (
              <WeekVisitsPanel
                range={weekRange}
                visits={filteredVisits}
                reportBasePath={reportBasePath}
                selectedDate={selected}
                isSearching={isSearching}
              />
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
