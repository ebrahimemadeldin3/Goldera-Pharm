"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { eachDayOfInterval, isSameDay, isToday, format } from "date-fns";
import WeekVisitCard from "@/features/visits/components/shared/WeekVisitCard";
import { Visit } from "@/features/visits/lib/types/ui";
import type { VisitStatus } from "@/lib/types";
import { cn, formatDateOnly } from "@/lib/utils";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useRoleUI } from "@/core/ui/role-ui-context";

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

const INITIAL_LIMIT = 6;

/**
 * Week view rendered as an agenda: one full-width row per day.
 * Visit cards flow in an auto-fill grid, so they always get a readable
 * width (min 15rem) no matter how narrow the surrounding panel is.
 */
export default function WeekVisitsPanel({
  range,
  visits,
  reportBasePath,
  selectedDate,
  isSearching = false,
  isFiltered = false,
  onClearFilters,
  managerTheme = false,
}: {
  range: { start: Date; end: Date };
  visits: Visit[];
  reportBasePath?: string;
  selectedDate?: Date;
  isSearching?: boolean;
  isFiltered?: boolean;
  onClearFilters?: () => void;
  managerTheme?: boolean;
}) {
  const pathname = usePathname();
  const { role } = useRoleUI();
  const isRep = role === "MEDICAL_REP" || pathname?.startsWith("/rep");
  const isManager =
    managerTheme || role === "MANAGER" || pathname?.startsWith("/manager");
  const days = eachDayOfInterval(range);

  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>(
    {},
  );

  const toggleDay = (dateKey: string) => {
    setExpandedDays((prev) => ({ ...prev, [dateKey]: !prev[dateKey] }));
  };

  if (visits.length === 0 && (isSearching || isFiltered) && onClearFilters) {
    return (
      <div className="visits-empty-state flex min-h-[238px] flex-col items-center justify-center rounded-[14px] border border-dashed border-[#DDE3EE] bg-[#FBFCFE] px-5 py-8 text-center">
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-full",
            isRep
              ? "bg-gp-rep-primary-soft text-gp-rep-primary"
              : "border border-[#E9DDB8] bg-[#FFF8E5] text-[#B18732]",
          )}
        >
          <Calendar className="size-5" aria-hidden="true" />
        </span>
        <h4 className="mt-4 text-base font-semibold text-[#182033]">
          {isSearching
            ? "No visits match your search."
            : "No visits match the current filters."}
        </h4>
        <p className="mt-2 max-w-[360px] text-sm leading-6 font-medium text-[#667085]">
          Clear filters to return to the full weekly workspace.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className={cn(
            "mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border px-4 text-sm font-semibold transition-colors focus-visible:outline-none",
            isRep
              ? "border-[#CBEFDD] bg-white text-[#168557] hover:bg-[#E9F8F1] focus-visible:ring-2 focus-visible:ring-[#168557]/20"
              : "border-[#E9DDB8] bg-white text-[#101D36] hover:bg-[#FFF8E5] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20",
          )}
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#EEF1F6] overflow-hidden rounded-[14px] border border-[#E5E8EF] bg-white">
      {days.map((day) => {
        const dateKey = formatDateOnly(day);
        const dayVisits = visits.filter((v) => isSameDay(v.date, day));
        const hasVisits = dayVisits.length > 0;
        const isSelectedDay = selectedDate
          ? isSameDay(day, selectedDate)
          : false;
        const isTodayDate = isToday(day);
        const completedCount = dayVisits.filter(
          (v) => v.status === "COMPLETED",
        ).length;
        const dayStatuses = VISIT_STATUS_ORDER.filter((status) =>
          dayVisits.some((visit) => visit.status === status),
        );
        const isExpanded = expandedDays[dateKey] ?? false;
        const visibleVisits =
          isSearching || isExpanded
            ? dayVisits
            : dayVisits.slice(0, INITIAL_LIMIT);
        const remainingCount = dayVisits.length - INITIAL_LIMIT;

        return (
          <section
            key={dateKey}
            aria-label={format(day, "EEEE, MMMM d")}
            className={cn(
              "visits-week-day flex flex-col gap-3 px-4 sm:flex-row sm:gap-4",
              hasVisits ? "py-4" : "py-2.5",
              isTodayDate &&
                (isRep ? "bg-[#F5FBF8]" : "bg-[#FFFCF3]"),
            )}
          >
            {/* Day label */}
            <div
              className={cn(
                "flex shrink-0 items-center gap-3 sm:w-[132px]",
                hasVisits && "sm:items-start",
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 flex-col items-center justify-center rounded-[10px] leading-none",
                  isSelectedDay
                    ? isRep
                      ? "bg-[#168557] text-white"
                      : "bg-[#101D36] text-white"
                    : isTodayDate
                      ? isRep
                        ? "border border-[#168557] bg-white text-[#168557]"
                        : "border border-[#C9A44C] bg-white text-[#8A6515]"
                      : hasVisits
                        ? "bg-[#F4F6FA] text-[#182033]"
                        : "bg-[#F9FAFB] text-[#98A2B3]",
                )}
              >
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">
                  {format(day, "EEE")}
                </span>
                <span className="mt-0.5 text-[15px] font-bold tabular-nums">
                  {format(day, "d")}
                </span>
              </span>

              <div className="min-w-0">
                <p
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-semibold",
                    hasVisits ? "text-[#182033]" : "text-[#98A2B3]",
                  )}
                >
                  {format(day, "EEEE")}
                  {isTodayDate && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                        isRep
                          ? "bg-[#E9F8F1] text-[#168557]"
                          : "bg-[#FFF8E5] text-[#8A6515]",
                      )}
                    >
                      Today
                    </span>
                  )}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-[#667085]">
                  {dayStatuses.length > 0 && (
                    <span className="inline-flex gap-0.5" aria-hidden="true">
                      {dayStatuses.map((status) => (
                        <span
                          key={status}
                          className={cn(
                            "size-1.5 rounded-full",
                            visitStatusDotStyles[status],
                          )}
                        />
                      ))}
                    </span>
                  )}
                  {hasVisits
                    ? `${dayVisits.length} ${dayVisits.length === 1 ? "visit" : "visits"}${
                        completedCount > 0 ? ` · ${completedCount} done` : ""
                      }`
                    : "No visits"}
                </p>
              </div>
            </div>

            {/* Visits */}
            {hasVisits && (
              <div className="min-w-0 flex-1">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,15rem),1fr))] gap-2.5">
                  {visibleVisits.map((v, index) => (
                    <WeekVisitCard
                      key={v.id}
                      visit={v}
                      reportBasePath={reportBasePath}
                      managerTheme={isManager}
                      isRep={isRep}
                      animationDelay={`${Math.min(index * 25, 120)}ms`}
                    />
                  ))}
                </div>

                {!isSearching && remainingCount > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleDay(dateKey)}
                    className={cn(
                      "mt-2.5 inline-flex h-8 items-center gap-1 rounded-[8px] border border-[#E5E8EF] bg-white px-3 text-xs font-semibold text-[#475467] transition-colors hover:bg-[#F9FAFB]",
                      isRep
                        ? "hover:border-[#CBEFDD] hover:text-[#168557]"
                        : "hover:border-[#E9DDB8] hover:text-[#8A6515]",
                    )}
                  >
                    {isExpanded ? (
                      <>
                        Show less <ChevronUp className="size-3.5" />
                      </>
                    ) : (
                      <>
                        Show {remainingCount} more{" "}
                        {remainingCount === 1 ? "visit" : "visits"}
                        <ChevronDown className="size-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
