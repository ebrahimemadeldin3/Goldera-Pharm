"use client";

import { useState } from "react";
import { eachDayOfInterval, isSameDay, format } from "date-fns";
import { Card } from "@/components/ui/card";
import VisitCard from "@/features/visits/components/shared/VisitCard";
import { Visit } from "@/features/visits/lib/types/ui";
import {
  formatDateOnly,
  formatSaudiDateDisplay,
  formatSaudiWeekday,
} from "@/lib/utils";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";

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
  const days = eachDayOfInterval(range);
  
  // Track open/collapsed days (Default: Only selected/current day expands, others collapse)
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({});
  // Track per-day progressive disclosure expansion (max 2 visits by default)
  const [expandedVisitsPerDay, setExpandedVisitsPerDay] = useState<Record<string, boolean>>({});

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

        const completedCount = dayVisits.filter((v) => v.status === "COMPLETED").length;
        const scheduledCount = dayVisits.length - completedCount;

        const statusSummaryText = hasVisits
          ? `${dayVisits.length} ${dayVisits.length === 1 ? "visit" : "visits"}${
              completedCount > 0 || scheduledCount > 0
                ? ` · ${scheduledCount > 0 ? `${scheduledCount} scheduled` : ""}${
                    scheduledCount > 0 && completedCount > 0 ? " · " : ""
                  }${completedCount > 0 ? `${completedCount} completed` : ""}`
                : ""
            }`
          : "0 visits";
        
        // Sensible Default: selected/current day is expanded, other days collapsed (unless searching with results)
        const isSelectedDay = selectedDate ? isSameDay(day, selectedDate) : false;
        const defaultCollapsed = isSearching ? !hasVisits : !isSelectedDay;
        const isCollapsed = collapsedDays[dateKey] ?? defaultCollapsed;

        // Progressive disclosure for visits inside expanded day
        const isVisitsExpanded = expandedVisitsPerDay[dateKey] ?? false;
        const visibleVisits = isSearching || isVisitsExpanded ? dayVisits : dayVisits.slice(0, INITIAL_LIMIT);
        const remainingCount = dayVisits.length - INITIAL_LIMIT;

        return (
          <Card
            key={dateKey}
            className={`overflow-hidden border shadow-2xs transition-all duration-150 ${
              hasVisits ? "border-slate-200 bg-white" : "border-slate-200/60 bg-slate-50/50"
            }`}
          >
            {/* Lightweight Integrated Day Header Bar */}
            <div
              role="button"
              tabIndex={0}
              aria-expanded={!isCollapsed}
              aria-controls={`day-visits-panel-${dateKey}`}
              onClick={() => toggleDayAccordion(dateKey)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleDayAccordion(dateKey);
                }
              }}
              className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none ${
                hasVisits
                  ? "bg-white text-slate-800 hover:bg-slate-50"
                  : "bg-slate-50/80 text-slate-600 hover:bg-slate-100/70"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Calendar size={14} className={hasVisits ? "text-blue-600" : "text-slate-400"} />
                <span>{formatSaudiWeekday(day)}, {formatSaudiDateDisplay(day)}</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium ${
                    hasVisits
                      ? "bg-slate-100 text-slate-700 border border-slate-200/80"
                      : "bg-slate-50 text-slate-400 border border-slate-200/50"
                  }`}
                >
                  {statusSummaryText}
                </span>

                {isCollapsed ? (
                  <ChevronDown size={15} className="text-slate-400" />
                ) : (
                  <ChevronUp size={15} className="text-slate-400" />
                )}
              </div>
            </div>

            {/* Visit Cards Section when Expanded */}
            {!isCollapsed && (
              <div id={`day-visits-panel-${dateKey}`} className="p-3.5 border-t border-slate-100 space-y-3">
                {dayVisits.length === 0 ? (
                  <div className="py-2.5 text-center text-xs text-slate-400 italic">
                    No visits scheduled for {format(day, "EEEE, MMM d")}
                  </div>
                ) : (
                  <>
                    {/* 2-Column Responsive Visit Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                      {visibleVisits.map((v) => (
                        <VisitCard
                          key={v.id}
                          visit={v}
                          reportBasePath={reportBasePath}
                        />
                      ))}
                    </div>

                    {/* Progressive Disclosure Toggle Button (Show N More / Show Less) */}
                    {!isSearching && dayVisits.length > INITIAL_LIMIT && (
                      <div className="flex justify-center pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDayVisitsLimit(dateKey);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150 cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
                        >
                          {isVisitsExpanded ? (
                            <>
                              <span>Show less</span>
                              <ChevronUp size={13} />
                            </>
                          ) : (
                            <>
                              <span>Show {remainingCount} more {remainingCount === 1 ? "visit" : "visits"}</span>
                              <ChevronDown size={13} />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
