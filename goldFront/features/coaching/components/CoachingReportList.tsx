"use client";

import { useMemo, useState } from "react";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";
import CoachingReportCard from "./CoachingReportCard";
import { ListChecks } from "lucide-react";
import { CoachingReport } from "../lib/types";

type FilterKey = "all" | "pending" | "completed";

type CoachingReportListProps = {
  reports: CoachingReport[];
  isRep?: boolean;
  page?: number;
  limit?: number;
  totalCount?: number;
};

export default function CoachingReportList({
  reports,
  isRep = false,
  page = 1,
  limit = 10,
  totalCount = 0,
}: CoachingReportListProps) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(() => {
    const pending = reports.filter(
      (r) => r.status === "Pending Feedback"
    ).length;
    const completed = reports.filter((r) => r.status === "Completed").length;
    return { all: reports.length, pending, completed };
  }, [reports]);

  const visible = useMemo(() => {
    if (filter === "all") return reports;
    if (filter === "pending")
      return reports.filter((r) => r.status === "Pending Feedback");
    return reports.filter((r) => r.status === "Completed");
  }, [filter, reports]);

  const tabs: Array<{ id: FilterKey; label: string; count: number }> = [
    { id: "all", label: "All Sessions", count: counts.all },
    { id: "pending", label: "Pending Feedback", count: counts.pending },
    { id: "completed", label: "Completed", count: counts.completed },
  ];

  return (
    <div className="rounded-[14px] border border-[#E5E8EF] bg-white p-5 space-y-5">
      {/* Filter Tabs */}
      <div className="flex w-fit flex-wrap items-center gap-1.5 rounded-[12px] bg-[#F6F8FB] p-1 border border-[#E5E8EF]">
        {tabs.map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex cursor-pointer items-center gap-2 rounded-[9px] px-3 py-1.5 text-xs font-semibold transition-all border ${
                isActive
                  ? "bg-[#E9F8F1] border-[#CBEFDD] text-[#168557] shadow-2xs"
                  : "bg-white border-[#E5E8EF] text-[#667085] hover:text-[#182033]"
              }`}
            >
              {tab.label}
              <span
                className={`flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                  isActive
                    ? "bg-[#168557] text-white"
                    : "bg-[#F6F8FB] text-[#344054] border border-[#E5E8EF]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reports List */}
      <div>
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-[#E5E8EF] bg-[#F9FAFB] py-10 px-6 text-center max-h-[220px]">
            <ListChecks className="size-8 text-[#98A2B3] mb-2" />
            <p className="text-sm font-bold text-[#182033]">
              No coaching sessions found
            </p>
            <p className="text-xs text-[#667085] mt-1 max-w-sm">
              Your coaching sessions and supervisor feedback will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {visible.map((r) => (
              <CoachingReportCard key={r.id} report={r} isRep={isRep} />
            ))}
          </div>
        )}
      </div>

      <TablePaginationFooter
        page={page}
        limit={limit}
        totalCount={totalCount || reports.length}
        itemLabel="coaching reports"
        ariaLabel="Coaching reports pagination"
        pageNavAriaLabel="Coaching report pages"
      />
    </div>
  );
}
