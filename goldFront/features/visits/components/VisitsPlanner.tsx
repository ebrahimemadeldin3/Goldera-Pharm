"use client";

import { useMemo, useState } from "react";
import {
  startOfWeek,
  endOfWeek,
  isSameDay,
  isWithinInterval,
  format,
  addWeeks,
} from "date-fns";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/SearchInput";
import DayVisitsPanel from "@/features/visits/components/panels/DayVisitsPanel";
import WeekVisitsPanel from "@/features/visits/components/panels/WeekVisitsPanel";
import { Visit } from "@/features/visits/lib/types/ui";
import { RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

type VisitsPlannerProps = {
  visits: Visit[];
  reportBasePath?: string;
  page?: number;
  limit?: number;
  totalCount?: number;
};

export default function VisitsPlanner({
  visits = [],
  reportBasePath,
}: VisitsPlannerProps) {
  const [mode, setMode] = useState<"day" | "week">("day");
  const [selected, setSelected] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  // Synchronized 7-day week navigation (moves in discrete 7-day periods)
  const handlePrevWeek = () => {
    const newSelected = addWeeks(selected, -1);
    setSelected(startOfWeek(newSelected, { weekStartsOn: 6 }));
  };

  const handleNextWeek = () => {
    const newSelected = addWeeks(selected, 1);
    setSelected(startOfWeek(newSelected, { weekStartsOn: 6 }));
  };

  // Client-side search filtering on current mode dataset
  const activeVisits = mode === "day" ? dayVisits : weekVisits;
  const isSearching = searchQuery.trim() !== "";
  
  const filteredVisits = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
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
  }, [activeVisits, searchQuery]);

  return (
    <section className="border-slate-200 rounded-xl border bg-white p-5 lg:h-[calc(100vh-170px)] lg:overflow-hidden flex flex-col">
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start flex-1 min-h-0">
        {/* Left Column: Fixed/Scrollable Calendar Navigation & Status Legend (280px fixed width on desktop) */}
        <div className="w-full lg:w-70 shrink-0 flex flex-col gap-4 lg:h-full lg:overflow-y-auto pr-1">
          {/* Day / Week Mode Selector */}
          <div className="flex w-full items-center gap-1.5 rounded-xl bg-slate-100 p-1 shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className={`h-8.5 flex-1 cursor-pointer rounded-lg text-xs font-semibold transition-all focus-visible:outline-none ${
                mode === "day"
                  ? "bg-white text-slate-900 shadow-2xs border border-slate-200 hover:bg-white hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 focus-visible:ring-2 focus-visible:ring-slate-400"
              }`}
              onClick={() => setMode("day")}
            >
              Day View
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`h-8.5 flex-1 cursor-pointer rounded-lg text-xs font-semibold transition-all focus-visible:outline-none ${
                mode === "week"
                  ? "bg-white text-slate-900 shadow-2xs border border-slate-200 hover:bg-white hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 focus-visible:ring-2 focus-visible:ring-slate-400"
              }`}
              onClick={() => setMode("week")}
            >
              Week View
            </Button>
          </div>

          {/* Full-Width Calendar Card */}
          <Card className="relative p-3 border border-slate-200 shadow-none w-full shrink-0">
            <div className="mb-2 px-1 text-xs font-semibold text-slate-900">
              {mode === "day"
                ? format(selected, "EEEE, d MMMM yyyy")
                : `${format(weekRange.start, "MMM d")} - ${format(
                    weekRange.end,
                    "MMM d, yyyy",
                  )}`}
            </div>

            <ShadCalendar
              mode="single"
              selected={selected}
              onSelect={(d) => d && setSelected(d)}
              className="rounded-md p-0 w-full"
              classNames={{
                today: "bg-blue-50 text-blue-700 font-bold rounded-md",
                selected:
                  "bg-dashboard-blue! text-white! rounded-md font-medium",
                day: "cursor-pointer hover:bg-slate-100 rounded-md text-xs h-7 w-7",
              }}
            />

            {/* Visit Status Legend */}
            <div className="mt-3 border-t border-slate-100 pt-2.5">
              <p className="mb-1.5 text-[11px] font-semibold text-slate-800 uppercase tracking-wider">
                Status Legend
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="bg-emerald-500 size-2 rounded-full shrink-0" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-blue-500 size-2 rounded-full shrink-0" />
                  <span>In Progress</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-amber-500 size-2 rounded-full shrink-0" />
                  <span>Scheduled</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-red-500 size-2 rounded-full shrink-0" />
                  <span>Cancelled</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Integrated Fixed Toolbar & Scrollable Visit Results Area */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-3 lg:h-full lg:overflow-hidden">
          {/* Integrated Search & 7-Day Navigation Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 shrink-0">
            {/* Search Input */}
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search visits..."
              className="w-full sm:w-65"
            />

            {/* Synchronized 7-Day Week Navigation (in Week mode) */}
            {mode === "week" && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
                <button
                  type="button"
                  onClick={handlePrevWeek}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-slate-700 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer font-medium"
                  title="Previous 7 days"
                >
                  <ChevronLeft size={14} />
                  <span>Prev Week</span>
                </button>

                <span className="px-2 font-semibold text-slate-900">
                  {format(weekRange.start, "MMM d")} – {format(weekRange.end, "MMM d")}
                </span>

                <button
                  type="button"
                  onClick={handleNextWeek}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-slate-700 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer font-medium"
                  title="Next 7 days"
                >
                  <span>Next Week</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}

            <div className="text-xs text-slate-500 font-medium">
              Showing {filteredVisits.length} of {activeVisits.length} {mode === "day" ? "day" : "week"} visits
            </div>
          </div>

          {/* Scope Info Pill when Searching */}
          {isSearching && (
            <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/70 px-3.5 py-2 text-xs text-blue-700 shrink-0">
              <span>
                Filtering current {mode} view for &quot;<strong>{searchQuery}</strong>&quot;. Showing {filteredVisits.length} matching records.
              </span>
              <button
                onClick={() => setSearchQuery("")}
                className="font-medium underline hover:text-blue-900 cursor-pointer inline-flex items-center gap-1"
              >
                <RotateCcw size={12} />
                Clear search
              </button>
            </div>
          )}

          {/* Scrollable Visit Results Area (ONLY THIS CONTAINER SCROLLS ON DESKTOP) */}
          <div className="flex-1 min-h-0 lg:overflow-y-auto pr-1 space-y-3">
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
        </div>
      </div>
    </section>
  );
}
