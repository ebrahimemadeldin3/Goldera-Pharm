"use client";

import { useMemo, useState } from "react";
import Pagination from "@/components/ui/Pagination";
import CoachingReportCard from "./CoachingReportCard";
import SegmentedButton from "./ui/SegmentedButton";
import { Card, CardHeader } from "@/components/ui/card";
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
      (r) => r.status === "Pending Feedback",
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

  return (
    <Card className="border-secondary-light border p-6 shadow-none">
            <div className="mt-6">
        <Pagination page={page} limit={limit} totalCount={totalCount} />
      </div>
      {/* Segmented filter */}
      <CardHeader className="m-0 flex w-full max-w-[430px] flex-wrap items-center gap-1 rounded-full bg-[#F1F5F9] p-1">
        <SegmentedButton
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="All Reports"
          count={counts.all}
        />
        <SegmentedButton
          active={filter === "pending"}
          onClick={() => setFilter("pending")}
          label="Pending Feedback"
          count={counts.pending}
          countColor="#D92D20"
        />
        <SegmentedButton
          active={filter === "completed"}
          onClick={() => setFilter("completed")}
          label="Completed"
          count={counts.completed}
        />
      </CardHeader>

      <div className="space-y-4">
        {visible.map((r) => (
          <CoachingReportCard key={r.id} report={r} isRep={isRep} />
        ))}
      </div>

    </Card>
  );
}
