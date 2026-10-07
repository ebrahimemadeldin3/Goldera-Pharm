"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { DayButtonProps } from "react-day-picker";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import DayVisitsPanel from "@/features/visits/components/panels/DayVisitsPanel";
import WeekVisitsPanel from "@/features/visits/components/panels/WeekVisitsPanel";
import { Visit } from "@/features/visits/lib/types/ui";
import type { User } from "@/features/team/lib/types";
import { useRoleUI } from "@/core/ui/role-ui-context";
import type { VisitStatus } from "@/lib/types";
import {
  cn,
  formatDateOnly,
  getSaudiCalendarDate,
  parseDateValue,
} from "@/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type VisitsPlannerProps = {
  visits: Visit[];
  medicalReps?: User[];
  reportBasePath?: string;
  page?: number;
  limit?: number;
  totalCount?: number;
};

type VisitMode = "day" | "week";
type MonthMotion = "next" | "previous";
type StatusFilter = "all" | VisitStatus;
type DateFilterPreset = "clear" | "today" | "week" | "month" | "custom";

type RepOption = {
  id: string;
  name: string;
};

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

const ALL_FILTER = "all";

function compareVisitsBySchedule(a: Visit, b: Visit) {
  const dateDifference = a.date.getTime() - b.date.getTime();
  if (dateDifference !== 0) return dateDifference;
  return (a.timeLabel || "").localeCompare(b.timeLabel || "");
}

function dateAtEndOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function parsePlannerDateParam(value: string | null): Date | null {
  if (!value) return null;

  const parsed = parseDateValue(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return getSaudiCalendarDate(parsed);
}

function VisitCalendarDayButton({
  className,
  day,
  modifiers,
  statusDotsByDate,
  isRep = false,
  children,
  ...props
}: DayButtonProps & {
  statusDotsByDate: Map<string, VisitStatus[]>;
  isRep?: boolean;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dateKey = formatDateOnly(day.date);
  const rawStatusDots = statusDotsByDate.get(dateKey) ?? [];
  const statusDots = rawStatusDots;

  const todayStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const dayStart = useMemo(() => {
    return new Date(
      day.date.getFullYear(),
      day.date.getMonth(),
      day.date.getDate(),
    );
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
        modifiers.outside &&
          "text-[#98A2B3] opacity-40 hover:bg-transparent hover:text-[#98A2B3]",
        modifiers.today &&
          !modifiers.selected &&
          "border border-gp-rep-primary font-bold text-gp-rep-primary bg-transparent hover:bg-gp-rep-primary-soft hover:text-gp-rep-primary shadow-none",
        "data-[range-middle=true]:bg-gp-rep-primary-soft data-[range-middle=true]:text-gp-rep-primary data-[range-middle=true]:rounded-none",
        "data-[range-start=true]:bg-gp-rep-primary data-[range-start=true]:text-white",
        "data-[range-end=true]:bg-gp-rep-primary data-[range-end=true]:text-white",
        "data-[selected-single=true]:bg-gp-rep-primary data-[selected-single=true]:text-white data-[selected-single=true]:border-transparent data-[selected-single=true]:shadow-[0_4px_10px_rgba(22,133,87,0.22)]",
      );

  const managerDayClasses = cn(
    "size-9 sm:size-10 mx-auto text-[#182033] hover:bg-[#FFF8E5] hover:text-[#8A6515] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/25",
    modifiers.outside &&
      "text-[#98A2B3] opacity-40 hover:bg-transparent hover:text-[#98A2B3]",
    modifiers.today &&
      !modifiers.selected &&
      "border-[#C9A44C] bg-white text-[#101D36] shadow-[0_0_0_2px_rgba(201,164,76,0.08)]",
    "data-[range-middle=true]:bg-[#F8F1DC] data-[range-middle=true]:rounded-none",
    "data-[range-start=true]:bg-[#101D36] data-[range-start=true]:text-white",
    "data-[range-end=true]:bg-[#101D36] data-[range-end=true]:text-white",
    "data-[selected-single=true]:bg-[#101D36] data-[selected-single=true]:text-white data-[selected-single=true]:shadow-[0_6px_14px_rgba(16,29,54,0.22)]",
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
      className={cn(
        baseDayClasses,
        isRep ? repDayClasses : managerDayClasses,
        className,
      )}
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
  medicalReps = [],
  reportBasePath,
}: VisitsPlannerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedDateParam =
    searchParams.get("date") || searchParams.get("visitDate");
  const selectedDateFromUrl = useMemo(
    () => parsePlannerDateParam(selectedDateParam),
    [selectedDateParam],
  );
  const [mode, setMode] = useState<VisitMode>("day");
  const [selected, setSelected] = useState<Date>(
    () => selectedDateFromUrl ?? new Date(),
  );
  const [calendarMonth, setCalendarMonth] = useState<Date>(() =>
    startOfMonth(selectedDateFromUrl ?? new Date()),
  );
  const [monthMotion, setMonthMotion] = useState<MonthMotion>("next");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRepId, setSelectedRepId] = useState<string>(ALL_FILTER);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL_FILTER);
  const [dateFilterPreset, setDateFilterPreset] =
    useState<DateFilterPreset>("clear");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");

  const { role } = useRoleUI();
  const isRep = role === "MEDICAL_REP" || pathname?.startsWith("/rep");
  const isManager = role === "MANAGER" || pathname?.startsWith("/manager");

  const repLookup = useMemo(() => {
    return new Map(medicalReps.map((rep) => [rep.id, rep.name]));
  }, [medicalReps]);

  const normalizedVisits = useMemo(() => {
    const visitsById = new Map<string, Visit>();

    visits.forEach((visit) => {
      if (!visit.id || visitsById.has(visit.id)) return;

      const inferredRepId =
        visit.medicalRepId ||
        (isManager && repLookup.has(visit.userId) ? visit.userId : undefined);

      visitsById.set(visit.id, {
        ...visit,
        medicalRepId: inferredRepId || visit.medicalRepId,
        medicalRepName:
          visit.medicalRepName ||
          (inferredRepId ? repLookup.get(inferredRepId) : undefined),
      });
    });

    return Array.from(visitsById.values()).sort(compareVisitsBySchedule);
  }, [isManager, repLookup, visits]);

  const getAssignedRepId = useCallback((visit: Visit) => {
    if (visit.medicalRepId) return visit.medicalRepId;

    if (isManager && repLookup.has(visit.userId)) {
      return visit.userId;
    }

    return undefined;
  }, [isManager, repLookup]);

  const getAssignedRepName = useCallback((visit: Visit) => {
    const assignedRepId = getAssignedRepId(visit);
    if (!assignedRepId) return visit.medicalRepName;
    return visit.medicalRepName || repLookup.get(assignedRepId);
  }, [getAssignedRepId, repLookup]);

  const repOptions = useMemo<RepOption[]>(() => {
    const optionsById = new Map<string, string>();

    medicalReps.forEach((rep) => {
      optionsById.set(rep.id, rep.name);
    });

    normalizedVisits.forEach((visit) => {
      const assignedRepId = getAssignedRepId(visit);
      const assignedRepName = getAssignedRepName(visit);
      if (assignedRepId && assignedRepName) {
        optionsById.set(assignedRepId, assignedRepName);
      }
    });

    return Array.from(optionsById.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [getAssignedRepId, getAssignedRepName, medicalReps, normalizedVisits]);

  const dateFilterRange = useMemo(() => {
    const today = new Date();

    if (dateFilterPreset === "today") {
      return { start: startOfDay(today), end: dateAtEndOfDay(today) };
    }

    if (dateFilterPreset === "week") {
      return {
        start: startOfWeek(selected, { weekStartsOn: 6 }),
        end: endOfWeek(selected, { weekStartsOn: 6 }),
      };
    }

    if (dateFilterPreset === "month") {
      return {
        start: startOfMonth(calendarMonth),
        end: dateAtEndOfDay(endOfMonth(calendarMonth)),
      };
    }

    if (dateFilterPreset === "custom" && customDateFrom && customDateTo) {
      const start = parsePlannerDateParam(customDateFrom);
      const end = parsePlannerDateParam(customDateTo);

      if (start && end) {
        return {
          start: startOfDay(isBefore(start, end) ? start : end),
          end: dateAtEndOfDay(isBefore(start, end) ? end : start),
        };
      }
    }

    return null;
  }, [calendarMonth, customDateFrom, customDateTo, dateFilterPreset, selected]);

  const trimmedSearchQuery = searchQuery.trim();
  const isSearching = trimmedSearchQuery !== "";

  const filteredVisitScope = useMemo(() => {
    const term = trimmedSearchQuery.toLowerCase();

    return normalizedVisits.filter((visit) => {
      const assignedRepId = getAssignedRepId(visit);
      const assignedRepName = getAssignedRepName(visit);

      if (selectedRepId !== ALL_FILTER && assignedRepId !== selectedRepId) {
        return false;
      }

      if (statusFilter !== ALL_FILTER && visit.status !== statusFilter) {
        return false;
      }

      if (
        dateFilterRange &&
        !isWithinInterval(visit.date, {
          start: dateFilterRange.start,
          end: dateFilterRange.end,
        })
      ) {
        return false;
      }

      if (!term) return true;

      return [
        visit.person,
        visit.doctorNameEN,
        visit.doctorNameAR,
        assignedRepName,
        visit.facility,
        visit.place,
        visit.territory,
        visit.visitType,
        visit.statusLabel,
      ].some((value) => value?.toLowerCase().includes(term));
    });
  }, [
    dateFilterRange,
    normalizedVisits,
    getAssignedRepId,
    getAssignedRepName,
    selectedRepId,
    statusFilter,
    trimmedSearchQuery,
  ]);

  const hasActiveFilters =
    selectedRepId !== ALL_FILTER ||
    statusFilter !== ALL_FILTER ||
    dateFilterPreset !== "clear" ||
    isSearching;

  const hasStructuredFilters =
    selectedRepId !== ALL_FILTER ||
    statusFilter !== ALL_FILTER ||
    dateFilterPreset !== "clear";

  function clearAllFilters() {
    setSelectedRepId(ALL_FILTER);
    setStatusFilter(ALL_FILTER);
    setDateFilterPreset("clear");
    setCustomDateFrom("");
    setCustomDateTo("");
    setSearchQuery("");
  }

  function applyDatePreset(value: DateFilterPreset) {
    setDateFilterPreset(value);

    if (value !== "custom") {
      setCustomDateFrom("");
      setCustomDateTo("");
    }

    if (value === "today") {
      selectDate(new Date());
    }
  }

  const statusDotsByDate = useMemo(() => {
    const statusSetsByDate = new Map<string, Set<VisitStatus>>();

    filteredVisitScope.forEach((visit) => {
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
  }, [filteredVisitScope]);

  const dayVisits = useMemo<Visit[]>(() => {
    return filteredVisitScope
      .filter((v) => isSameDay(v.date, selected))
      .sort(compareVisitsBySchedule);
  }, [filteredVisitScope, selected]);

  const weekRange = useMemo(() => {
    const start = startOfWeek(selected, { weekStartsOn: 6 });
    const end = endOfWeek(selected, { weekStartsOn: 6 });
    return { start, end };
  }, [selected]);

  const weekVisits = useMemo<Visit[]>(() => {
    return filteredVisitScope
      .filter((v) =>
        isWithinInterval(v.date, {
          start: weekRange.start,
          end: weekRange.end,
        }),
      )
      .sort(compareVisitsBySchedule);
  }, [filteredVisitScope, weekRange]);

  const activeVisits = mode === "day" ? dayVisits : weekVisits;

  function selectDate(nextDate: Date) {
    if (isRep) {
      const nextStart = new Date(
        nextDate.getFullYear(),
        nextDate.getMonth(),
        nextDate.getDate(),
      );
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
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
  const shortSelectedDateLabel = format(selected, "MMM d, yyyy");
  const weekRangeLabel = `${format(weekRange.start, "MMM d")} - ${format(
    weekRange.end,
    "MMM d, yyyy",
  )}`;
  const resultsTitle =
    mode === "day" ? format(selected, "EEEE, MMMM d") : weekRangeLabel;
  const resultsHelper =
    mode === "day" ? "Daily visit schedule" : "Weekly visit schedule";
  const countLabel = `${activeVisits.length} ${
    activeVisits.length === 1 ? "visit" : "visits"
  }`;
  const resultsMotionKey = `${mode}-${formatDateOnly(selected)}-${trimmedSearchQuery}-${selectedRepId}-${statusFilter}-${dateFilterPreset}-${activeVisits.length}`;
  const selectedRepName =
    selectedRepId === ALL_FILTER
      ? "All Medical Reps"
      : repOptions.find((rep) => rep.id === selectedRepId)?.name ||
        "Selected rep";
  const workspaceDateLabel =
    mode === "day" ? format(selected, "MMM d") : weekRangeLabel;
  const workspaceSummary = `${countLabel} for ${workspaceDateLabel}`;
  const filterControlClassName =
    "h-[46px] w-full rounded-[12px] border-[#E1E6EF] bg-white text-sm font-semibold text-[#182033] shadow-none transition-[border-color,background-color,box-shadow] duration-[160ms] hover:border-[#D8DEE8] focus-visible:border-[#101D36] focus-visible:ring-[#C9A44C]/15";
  const filterContentClassName =
    "rounded-[12px] border-[#E5E8EF] bg-white text-[#182033] shadow-[0_16px_40px_rgba(16,27,51,0.14)]";

  return (
    <section
      className={cn(
        "visits-page-enter visits-page-enter-delay-2 overflow-hidden rounded-[18px] border border-[#E5E8EF] bg-white",
        isManager ? "shadow-[0_1px_2px_rgba(16,24,40,0.04)]" : "shadow-none",
      )}
    >
      <div className="border-b border-[#EEF1F6] bg-white px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h2 className="whitespace-nowrap text-lg font-semibold text-[#182033]">
                Visit Workspace
              </h2>
              <p
                key={workspaceSummary}
                className="visits-count-refresh mt-1 text-xs font-medium text-[#667085]"
              >
                {workspaceSummary}
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Visit calendar view"
              className="visits-mode-switch relative grid h-[46px] w-full grid-cols-2 items-center gap-1 overflow-hidden rounded-[12px] border border-[#E7EAF0] bg-[#F5F7FA] p-1 sm:w-[240px]"
              style={
                {
                  "--visits-mode-index": modeIndex,
                } as CSSProperties
              }
            >
              <span
                className={cn(
                  "visits-mode-switch-indicator",
                  isManager && "visits-mode-switch-indicator-manager",
                  isRep && "visits-mode-switch-indicator-rep",
                )}
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
                    className={cn(
                      "visits-mode-tab relative z-10 flex h-full min-w-0 items-center justify-center rounded-[9px] px-3 text-xs font-semibold transition-[background-color,color,transform] duration-[160ms] ease-out outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                      isRep
                        ? "visits-mode-tab-rep"
                        : isManager
                          ? "visits-mode-tab-manager"
                          : undefined,
                      isActive
                        ? isRep
                          ? "font-bold text-[#168557]"
                          : isManager
                            ? "text-white"
                            : "text-[#182033]"
                        : isRep
                          ? "text-[#667085] hover:text-[#168557]"
                          : isManager
                            ? "text-[#344054] hover:text-[#101D36]"
                            : "text-[#667085]",
                      isRep
                        ? "focus-visible:ring-2 focus-visible:ring-[#168557]/30 focus-visible:ring-offset-1 focus-visible:ring-offset-[#F5F7FA]"
                        : "focus-visible:ring-2 focus-visible:ring-[#C9A44C]/30 focus-visible:ring-offset-1 focus-visible:ring-offset-[#F5F7FA]",
                    )}
                  >
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            {isManager && (
              <div className="min-w-0 xl:w-[250px]">
                <label htmlFor="manager-visit-rep-filter" className="sr-only">
                  Medical Representative
                </label>
                <Select value={selectedRepId} onValueChange={setSelectedRepId}>
                  <SelectTrigger
                    id="manager-visit-rep-filter"
                    className={filterControlClassName}
                    aria-label="Filter by medical representative"
                  >
                    <UserRound
                      className="size-4 text-[#B18732]"
                      aria-hidden="true"
                    />
                    <SelectValue placeholder="All Medical Reps" />
                  </SelectTrigger>
                  <SelectContent className={filterContentClassName}>
                    <SelectItem value={ALL_FILTER}>
                      All Medical Reps
                    </SelectItem>
                    {repOptions.map((rep) => (
                      <SelectItem key={rep.id} value={rep.id}>
                        {rep.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="min-w-0 xl:w-[190px]">
              <label htmlFor="visit-status-filter" className="sr-only">
                Visit status
              </label>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as StatusFilter)
                }
              >
                <SelectTrigger
                  id="visit-status-filter"
                  className={cn(
                    filterControlClassName,
                    isRep
                      ? "focus-visible:border-[#168557] focus-visible:ring-[#168557]/15"
                      : "focus-visible:border-[#101D36] focus-visible:ring-[#C9A44C]/15",
                  )}
                  aria-label="Filter by visit status"
                >
                  <SlidersHorizontal
                    className={cn(
                      "size-4",
                      isRep ? "text-[#168557]" : "text-[#B18732]",
                    )}
                    aria-hidden="true"
                  />
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className={filterContentClassName}>
                  <SelectItem value={ALL_FILTER}>All Statuses</SelectItem>
                  {statusLegend.map((item) => (
                    <SelectItem key={item.status} value={item.status}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-0 xl:w-[200px]">
              <label htmlFor="visit-date-filter" className="sr-only">
                Date filter
              </label>
              <Select
                value={dateFilterPreset}
                onValueChange={(value) =>
                  applyDatePreset(value as DateFilterPreset)
                }
              >
                <SelectTrigger
                  id="visit-date-filter"
                  className={cn(
                    filterControlClassName,
                    isRep
                      ? "focus-visible:border-[#168557] focus-visible:ring-[#168557]/15"
                      : "focus-visible:border-[#101D36] focus-visible:ring-[#C9A44C]/15",
                  )}
                  aria-label="Filter by date range"
                >
                  <CalendarDays
                    className={cn(
                      "size-4",
                      isRep ? "text-[#168557]" : "text-[#B18732]",
                    )}
                    aria-hidden="true"
                  />
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent className={filterContentClassName}>
                  <SelectItem value="clear">Any Date</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div
              className={cn(
                "visits-search-field group relative min-w-0 xl:flex-1",
                isRep
                  ? "visits-search-field-rep"
                  : isManager
                    ? "visits-search-field-manager"
                    : undefined,
              )}
            >
              <Search
                className={cn(
                  "visits-search-icon pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#98A2B3]",
                  isRep && "group-focus-within:text-[#168557]",
                )}
                aria-hidden="true"
              />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search visits..."
                aria-label="Search visits"
                className={cn(
                  "visits-search-input h-[46px] w-full rounded-[12px] border border-[#E1E6EF] bg-white pr-10 pl-10 text-sm font-medium text-[#182033] transition-[border-color,background-color,box-shadow] duration-[160ms] outline-none placeholder:text-[#98A2B3] hover:border-[#D8DEE8]",
                  isRep
                    ? "visits-search-input-rep"
                    : isManager
                      ? "visits-search-input-manager"
                      : undefined,
                  isRep
                    ? "focus:border-[#168557] focus:bg-[#F0FDF4]/30 focus:ring-2 focus:ring-[#168557]/20"
                    : isManager
                      ? "focus:border-[#101D36] focus:bg-white focus:ring-2 focus:ring-[#C9A44C]/10"
                      : "focus:border-[#C9A44C] focus:bg-[#FFFDF7] focus:ring-0",
                )}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear visit search"
                  className={cn(
                    "visits-search-clear absolute top-1/2 right-2.5 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-[#98A2B3] transition-[background-color,color] duration-[150ms] focus-visible:outline-none",
                    isRep
                      ? "hover:bg-[#E9F8F1] hover:text-[#168557] focus-visible:ring-2 focus-visible:ring-[#168557]/25"
                      : "hover:bg-[#F4F6FA] hover:text-[#182033] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/25",
                  )}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={clearAllFilters}
              disabled={!hasActiveFilters}
              className={cn(
                "inline-flex h-[46px] items-center justify-center gap-2 rounded-[12px] border border-[#E1E6EF] bg-white px-4 text-xs font-bold text-[#344054] transition-[background-color,border-color,color,box-shadow] duration-[150ms] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45 xl:w-auto",
                isRep
                  ? "hover:border-[#CBEFDD] hover:bg-[#E9F8F1] hover:text-[#168557] focus-visible:ring-2 focus-visible:ring-[#168557]/20"
                  : "hover:border-[#E9DDB8] hover:bg-[#FFF8E5] hover:text-[#101D36] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20",
              )}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {dateFilterPreset === "custom" && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:ml-auto xl:max-w-[390px]">
            <label className="min-w-0 text-xs font-semibold text-[#667085]">
              From
              <input
                type="date"
                value={customDateFrom}
                onChange={(event) => setCustomDateFrom(event.target.value)}
                className="mt-1 h-10 w-full rounded-[10px] border border-[#E5E8EF] bg-white px-3 text-sm font-semibold text-[#182033] outline-none focus:border-[#101D36] focus:ring-2 focus:ring-[#C9A44C]/15"
              />
            </label>
            <label className="min-w-0 text-xs font-semibold text-[#667085]">
              To
              <input
                type="date"
                value={customDateTo}
                onChange={(event) => setCustomDateTo(event.target.value)}
                className="mt-1 h-10 w-full rounded-[10px] border border-[#E5E8EF] bg-white px-3 text-sm font-semibold text-[#182033] outline-none focus:border-[#101D36] focus:ring-2 focus:ring-[#C9A44C]/15"
              />
            </label>
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <div className="visits-search-scope border-b border-[#EEF1F6] bg-[#FBFCFE] px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-2 text-xs font-medium text-[#667085] sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {activeVisits.length} matching records
              {isManager && selectedRepId !== ALL_FILTER ? (
                <>
                  {" "}
                  for{" "}
                  <strong className="font-semibold text-[#182033]">
                    {selectedRepName}
                  </strong>
                </>
              ) : null}
              {isSearching ? (
                <>
                  {" "}
                  matching{" "}
                  <strong className="font-semibold text-[#182033]">
                    &quot;{searchQuery}&quot;
                  </strong>
                </>
              ) : null}
              .
            </span>
            <button
              type="button"
              onClick={clearAllFilters}
              className={cn(
                "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-[background-color,color] duration-[150ms] focus-visible:outline-none",
                isRep
                  ? "text-[#168557] hover:bg-[#E9F8F1] hover:text-[#107349] focus-visible:ring-2 focus-visible:ring-[#168557]/25"
                  : "text-[#9A7628] hover:bg-[#FFF8E5] hover:text-[#182033] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/25",
              )}
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Clear filters
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(250px,30%)_minmax(0,1fr)] xl:grid-cols-[minmax(270px,29%)_minmax(0,1fr)]">
        <aside className="visits-calendar-panel rounded-[14px] border border-[#E5E8EF] bg-[#FBFCFE] p-3.5 lg:sticky lg:top-24 lg:self-start">
          <div className="mb-3 flex items-start justify-between gap-3">
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
            {!isManager && (
              <span
                className={cn(
                  "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold",
                  isRep
                    ? "border-[#CBEFDD] bg-[#E9F8F1] text-[#168557]"
                    : "border-[#E9DDB8] bg-[#FFF8E5] text-[#8A6515]",
                )}
              >
                STATUS
              </span>
            )}
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
                        new Date().getDate(),
                      ),
                    }
                  : undefined
              }
              className={cn(
                "visits-calendar rounded-none bg-transparent p-0",
                isRep && "visits-calendar-rep",
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

          <div className="mt-3 border-t border-[#E5E8EF] pt-3">
            <p className="mb-2 text-[10px] font-bold tracking-[0.08em] text-[#667085] uppercase">
              {isRep ? "Legend" : "Status"}
            </p>
            {isRep ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-[#667085]">
                <div className="flex items-center gap-1.5">
                  <span
                    className="size-2 shrink-0 rounded-xs bg-[#168557]"
                    aria-hidden="true"
                  />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="size-2 shrink-0 rounded-full border border-[#168557] bg-transparent"
                    aria-hidden="true"
                  />
                  <span>Today</span>
                </div>
                {statusLegend.map((item) => (
                  <div key={item.status} className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        visitStatusDotStyles[item.status],
                      )}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] font-medium text-[#667085]">
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
          className={cn(
            "visits-results-panel min-w-0 overflow-hidden rounded-[14px] border border-[#E5E8EF] bg-white",
            isManager && "shadow-[0_1px_2px_rgba(16,24,40,0.03)]",
          )}
        >
          <div className="flex flex-col gap-2 border-b border-[#EEF1F6] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
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
                        : "hover:bg-white hover:text-[#8A6515] focus-visible:ring-[#C9A44C]/25",
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
                        : "hover:bg-white hover:text-[#8A6515] focus-visible:ring-[#C9A44C]/25",
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
                visits={activeVisits}
                reportBasePath={reportBasePath}
                isSearching={isSearching}
                isFiltered={hasStructuredFilters}
                onClearFilters={clearAllFilters}
                managerTheme={isManager}
              />
            ) : (
              <WeekVisitsPanel
                range={weekRange}
                visits={activeVisits}
                reportBasePath={reportBasePath}
                selectedDate={selected}
                isSearching={isSearching}
                isFiltered={hasStructuredFilters}
                onClearFilters={clearAllFilters}
                managerTheme={isManager}
              />
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
