"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";
import { VisitReport } from "../lib/types";
import {
  Calendar,
  Clock,
  Star,
  MessageSquare,
  Package,
  FileText,
  Stethoscope,
  X,
} from "lucide-react";

interface VisitReportsListProps {
  reports: VisitReport[];
  page?: number;
  limit?: number;
  totalCount?: number;
  initialFromDate?: string;
  initialToDate?: string;
}

const getRatingColor = (rating: string) => {
  const ratingNum = parseInt(rating, 10);
  if (ratingNum >= 4) return "text-[#168557]";
  if (ratingNum >= 3) return "text-[#F59E0B]";
  return "text-[#D92D20]";
};

export default function VisitReportsList({
  reports,
  page = 1,
  limit = 10,
  totalCount = 0,
  initialFromDate = "",
  initialToDate = "",
}: VisitReportsListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const [rangeError, setRangeError] = useState<string | null>(null);

  const hasActiveFilter = Boolean(initialFromDate || initialToDate);

  const applyDateFilter = (nextFrom: string, nextTo: string) => {
    if (nextFrom && nextTo && nextFrom > nextTo) {
      setRangeError("From date cannot be after To date.");
      return;
    }
    setRangeError(null);
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", "1");
    if (nextFrom) params.set("fromDate", nextFrom);
    else params.delete("fromDate");
    if (nextTo) params.set("toDate", nextTo);
    else params.delete("toDate");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const clearDateFilter = () => {
    setFromDate("");
    setToDate("");
    setRangeError(null);
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("fromDate");
    params.delete("toDate");
    params.set("page", "1");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const filterBar = (
    <Card className="rounded-[14px] border border-[#E5E8EF] bg-white p-4 shadow-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-xl">
          <div className="space-y-1">
            <Label htmlFor="reports-from-date" className="text-xs font-semibold text-[#344054]">
              From Date
            </Label>
            <Input
              id="reports-from-date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="reports-to-date" className="text-xs font-semibold text-[#344054]">
              To Date
            </Label>
            <Input
              id="reports-to-date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => applyDateFilter(fromDate, toDate)}
            className="h-9 bg-[#168557] text-white hover:bg-[#107349]"
          >
            Apply Date Filter
          </Button>
          {(hasActiveFilter || fromDate || toDate) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearDateFilter}
              className="h-9 gap-1"
            >
              <X className="size-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {rangeError && (
        <p className="mt-2 text-xs font-medium text-[#D92D20]">{rangeError}</p>
      )}

      {hasActiveFilter && (
        <p className="mt-2 text-xs font-medium text-[#168557]">
          Active Date Range:{" "}
          {initialFromDate || "Start"} — {initialToDate || "Present"}
        </p>
      )}
    </Card>
  );

  if (reports.length === 0) {
    return (
      <div className="space-y-4">
        {filterBar}
        <Card className="flex flex-col items-center justify-center rounded-[14px] border border-[#E5E8EF] bg-white p-12 shadow-none text-center">
          <FileText className="mb-3 size-12 text-[#98A2B3]" />
          <h3 className="text-base font-bold text-[#182033]">No reports found</h3>
          <p className="text-xs text-[#667085] mt-1 max-w-sm">
            {hasActiveFilter
              ? "No visit reports match the selected date range."
              : "Visit reports will appear here once you submit field visits."}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filterBar}
      {/* 2-Column Desktop Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="rounded-[14px] border border-[#E5E8EF] bg-white p-5 shadow-none transition-all hover:border-[#CBEFDD] space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              {/* Header with Doctor Info */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EEF1F6] pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[#E9F8F1] border border-[#CBEFDD] text-[#168557]">
                    <Stethoscope className="size-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-sm font-bold text-[#182033]">
                        {report.doctorNameEN || report.doctorNameAR || `Visit #${report.visitId}`}
                      </h3>
                      <span className="rounded-full border border-[#DDE3EE] bg-[#F4F6FA] px-2 py-0.5 text-[10px] font-bold text-[#344054]">
                        {report.companionType === "WITH_MANAGER"
                          ? `Joint Visit${report.accompanyingManagerName ? ` (${report.accompanyingManagerName})` : ""}`
                          : report.companionType === "SINGLE"
                            ? "Single Visit"
                            : "Unknown"}
                      </span>
                    </div>
                    <p className="text-xs text-[#667085] mt-0.5">
                      Date: {report.visitDate}{report.visitTime ? ` at ${report.visitTime}` : ""}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Star className={`size-3.5 fill-current ${getRatingColor(report.rating)}`} />
                    <span className={`text-xs font-bold ${getRatingColor(report.rating)}`}>
                      {report.rating}/5
                    </span>
                  </div>
                  <p className="text-[11px] text-[#98A2B3] mt-0.5">
                    {report.createdAt}
                  </p>
                </div>
              </div>

              {/* Visit Metrics Strip */}
              <div className="grid grid-cols-3 gap-2 bg-[#FBFCFE] p-2.5 rounded-[10px] border border-[#EEF1F6] text-xs">
                <div>
                  <span className="text-[#667085] text-[10px] block font-medium">Date</span>
                  <span className="font-bold text-[#182033] flex items-center gap-1 mt-0.5">
                    <Calendar size={12} className="text-[#168557]" />
                    {report.visitDate}
                  </span>
                </div>
                <div>
                  <span className="text-[#667085] text-[10px] block font-medium">Duration</span>
                  <span className="font-bold text-[#182033] flex items-center gap-1 mt-0.5">
                    <Clock size={12} className="text-[#168557]" />
                    {report.duration}
                  </span>
                </div>
                <div>
                  <span className="text-[#667085] text-[10px] block font-medium">Samples</span>
                  <span className="font-bold text-[#168557] flex items-center gap-1 mt-0.5">
                    <Package size={12} />
                    {report.samplesProvided.length} items
                  </span>
                </div>
              </div>

              {/* Visit Purpose */}
              {report.visitPurpose && (
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1">
                    <FileText size={12} className="text-[#168557]" />
                    Visit Purpose
                  </h4>
                  <p className="text-xs text-[#344054] bg-[#F9FAFB] rounded-[8px] p-2.5 border border-[#EEF1F6]">
                    {report.visitPurpose}
                  </p>
                </div>
              )}

              {/* Discussed Topics */}
              {report.discussedTopics && report.discussedTopics.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                    Discussed Topics
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {report.discussedTopics.map((topic, index) => (
                      <span
                        key={index}
                        className="rounded-md border border-[#D7E5FF] bg-[#EDF4FF] px-2 py-0.5 text-[11px] font-medium text-[#3972D5]"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Doctor Feedback */}
              {report.doctorFeedback && (
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1">
                    <MessageSquare size={12} className="text-[#168557]" />
                    Doctor Feedback
                  </h4>
                  <p className="text-xs text-[#344054] bg-[#F9FAFB] rounded-[8px] p-2.5 border border-[#EEF1F6]">
                    {report.doctorFeedback}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <TablePaginationFooter
        page={page}
        limit={limit}
        totalCount={totalCount || reports.length}
        itemLabel="visit reports"
        ariaLabel="Visit reports pagination"
        pageNavAriaLabel="Visit report pages"
      />
    </div>
  );
}
