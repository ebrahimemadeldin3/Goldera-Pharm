"use client";

import { useState } from "react";
import { eachDayOfInterval, isSameDay, format } from "date-fns";
import VisitCard from "@/features/visits/components/shared/VisitCard";
import { Visit } from "@/features/visits/lib/types/ui";
import type { VisitStatus } from "@/lib/types";
import {
  cn,
  formatDateOnly,
  formatSaudiDateDisplay,
  formatSaudiWeekday,
} from "@/lib/utils";
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

export default function WeekVisitsPanel({
  range,
  visits,
  reportBasePath,
  selectedDate,
  isSearching = false,
}: {
  range: { start: Date; end: Date };
  visits: Visit[];
  reportBasePath?: string;
  selectedDate?: Date;
  isSearching?: boolean;
}) {
  const { role } = useRoleUI();
  const isRep = role === "MEDICAL_REP";
  const days = eachDayOfInterval(range);

  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>(
    {},
  );
  const [expandedVisitsPerDay, setExpandedVisitsPerDay] = useState<
    Record<string, boolean>
  >({});

  const toggleDayAccordion = (dateKey: string) => {
    setCollapsedDays((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  const toggleDayVisitsLimit = (dateKey: string) => {
    setExpandedVisitsPerDay((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  const INITIAL_LIMIT = 2;

  return (
    <div className="space-y-3">
      {days.map((day) => {
        const dateKey = formatDateOnly(day);
        const dayVisits = visits.filter((v) => isSameDay(v.date, day));
        const hasVisits = dayVisits.length > 0;
        const isSelectedDay = selectedDate
          ? isSameDay(day, selectedDate)
          : false;
        const completedCount = dayVisits.filter(
          (v) => v.status === "COMPLETED",
        ).length;
        const dayStatuses = VISIT_STATUS_ORDER.filter((status) =>
          dayVisits.some((visit) => visit.status === status),
        );

        const statusSummaryText = hasVisits
          ? `${dayVisits.length} ${
              dayVisits.length === 1 ? "visit" : "visits"
            }${completedCount > 0 ? ` - ${completedCount} completed` : ""}`
          : "0 visits";

        const defaultCollapsed = isSearching ? !hasVisits : !isSelectedDay;
        const isCollapsed = collapsedDays[dateKey] ?? defaultCollapsed;
        const isVisitsExpanded = expandedVisitsPerDay[dateKey] ?? false;
        const visibleVisits =
          isSearching || isVisitsExpanded
            ? dayVisits
            : dayVisits.slice(0, INITIAL_LIMIT);
        const remainingCount = dayVisits.length - INITIAL_LIMIT;

        return (
          <article
            key={dateKey}
            className={cn(
              "visits-week-day overflow-hidden rounded-[14px] border bg-white shadow-none transition-[background-color,border-color,box-shadow,transform] duration-[170ms]",
              hasVisits ? "border-[#E5E8EF]" : "border-[#E7EAF0] bg-[#FBFCFE]",
              isSelectedDay && (isRep ? "border-[#CBEFDD] bg-[#E9F8F1]/40" : "border-[#E9DDB8] bg-[#FFFDF7]"),
            )}
          >
            <button
              type="button"
              aria-expanded={!isCollapsed}
              aria-controls={`day-visits-panel-${dateKey}`}
              onClick={() => toggleDayAccordion(dateKey)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleDayAccordion(dateKey);
                }
              }}
              className={cn(
                "visits-week-day-header flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-[background-color,color] duration-[150ms] focus-visible:outline-none",
                isRep
                  ? "focus-visible:ring-2 focus-visible:ring-[#168557]/25"
                  : "focus-visible:ring-2 focus-visible:ring-[#C9A44C]/25",
                hasVisits
                  ? isRep
                    ? "text-[#182033] hover:bg-[#E9F8F1]/30"
                    : "text-[#182033] hover:bg-[#FFFDF7]"
                  : "text-[#667085] hover:bg-[#F4F6FA]",
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-[10px]",
                    isSelectedDay
                      ? isRep
                        ? "bg-[#168557] text-white shadow-[0_4px_10px_rgba(22,133,87,0.22)]"
                        : "bg-[#101D36] text-white"
                      : hasVisits
                        ? "bg-[#EEF4FF] text-[#3972D5]"
                        : "bg-[#F4F6FA] text-[#98A2B3]",
                  )}
                >
                  <Calendar className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {formatSaudiWeekday(day)}, {formatSaudiDateDisplay(day)}
                  </p>
                  <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
                    {dayStatuses.length > 0 && (
                      <span
                        className="inline-flex items-center gap-1"
                        aria-hidden="true"
                      >
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
                    <span className="truncate text-xs font-medium text-[#667085]">
                      {statusSummaryText}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    "inline-flex h-7 items-center rounded-full border px-2.5 text-[11px] font-bold",
                    hasVisits
                      ? "border-[#E5E8EF] bg-white text-[#344054]"
                      : "border-[#E7EAF0] bg-[#F9FAFB] text-[#98A2B3]",
                  )}
                >
                  {dayVisits.length}
                </span>
                {isCollapsed ? (
                  <ChevronDown className="size-4 text-[#98A2B3]" />
                ) : (
                  <ChevronUp className="size-4 text-[#98A2B3]" />
                )}
              </div>
            </button>

            {!isCollapsed && (
              <div
                id={`day-visits-panel-${dateKey}`}
                className="visits-week-day-body space-y-3 border-t border-[#EEF1F6] p-3.5"
              >
                {dayVisits.length === 0 ? (
                  <div className="rounded-[12px] border border-dashed border-[#DDE3EE] bg-[#FBFCFE] px-4 py-4 text-center text-xs font-medium text-[#8A94A6]">
                    No visits scheduled for {format(day, "EEEE, MMM d")}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                      {visibleVisits.map((v, index) => (
                        <VisitCard
                          key={v.id}
                          visit={v}
                          reportBasePath={reportBasePath}
                          animationDelay={`${Math.min(index * 24, 120)}ms`}
                        />
                      ))}
                    </div>

                    {!isSearching && dayVisits.length > INITIAL_LIMIT && (
                      <div className="flex justify-center pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDayVisitsLimit(dateKey);
                          }}
                          className={cn(
                            "inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-[#E5E8EF] bg-white px-3.5 text-xs font-semibold text-[#344054] shadow-none transition-[background-color,border-color,color,transform] duration-[160ms] hover:-translate-y-px focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                            isRep
                              ? "hover:border-[#CBEFDD] hover:bg-[#E9F8F1] hover:text-[#168557] focus-visible:ring-2 focus-visible:ring-[#168557]/20"
                              : "hover:border-[#E9DDB8] hover:bg-[#FFF8E5] hover:text-[#8A6515] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20"
                          )}
                        >
                          {isVisitsExpanded ? (
                            <>
                              <span>Show less</span>
                              <ChevronUp
                                className="size-3.5"
                                aria-hidden="true"
                              />
                            </>
                          ) : (
                            <>
                              <span>
                                Show {remainingCount} more{" "}
                                {remainingCount === 1 ? "visit" : "visits"}
                              </span>
                              <ChevronDown
                                className="size-3.5"
                                aria-hidden="true"
                              />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
