import Link from "next/link";
import {
  CalendarCheck2,
  Clock,
  Building2,
  CircleCheckBig,
  Plus,
  ChevronRight,
  Calendar,
} from "lucide-react";
import type { Visit } from "@/features/visits/lib/types/ui";
import { formatSaudiDateDisplay, parseDateValue } from "@/lib/utils";

type DashboardVisitLike = Partial<Visit> & {
  time?: string;
};

type TodayAgendaProps = {
  visits: DashboardVisitLike[];
};

export function TodayAgenda({ visits }: TodayAgendaProps) {
  const safeVisits = Array.isArray(visits) ? visits : [];

  const getVisitDateLabel = (dateValue: Visit["date"] | undefined) => {
    if (!dateValue) return "Today";
    try {
      return formatSaudiDateDisplay(parseDateValue(dateValue));
    } catch {
      return "Today";
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-[#E5E8EF] bg-white p-5 shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF1F6] pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#182033]">
              Today&apos;s Field Agenda
            </h2>
            <span className="inline-flex items-center rounded-full bg-[#F4F6FA] border border-[#E5E8EF] px-2 py-0.5 text-xs font-bold text-[#344054]">
              {safeVisits.length} {safeVisits.length === 1 ? "visit" : "visits"}
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Chronological field schedule for today
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/rep/visits"
            className="inline-flex h-8 items-center gap-1 rounded-[8px] border border-[#E5E8EF] bg-white px-2.5 text-xs font-semibold text-[#475467] hover:bg-[#F9FAFB] hover:text-[#182033] transition-colors"
          >
            <Calendar size={13} />
            <span>Visits Planner</span>
          </Link>

          <Link
            href="/rep/visits/add"
            className="inline-flex h-8 items-center gap-1 rounded-[8px] bg-[#168557] px-3 text-xs font-semibold text-white shadow-2xs hover:bg-[#107349] transition-all"
          >
            <Plus size={14} />
            <span>Add Visit</span>
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {safeVisits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-[12px] bg-[#FAFBFC] border border-dashed border-[#E5E8EF]">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#E9F8F1] text-[#168557] mb-3">
              <CalendarCheck2 size={24} />
            </div>
            <h3 className="text-sm font-semibold text-[#182033]">
              You&apos;re all clear for today
            </h3>
            <p className="mt-1 text-xs text-[#667085] max-w-sm">
              No visits are scheduled for today. Plan ahead by adding visits or checking your upcoming weekly schedule.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/rep/visits/add"
                className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-[#168557] px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#107349]"
              >
                <Plus size={15} />
                <span>Schedule a Visit</span>
              </Link>
              <Link
                href="/rep/visits"
                className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-[#E5E8EF] bg-white px-3.5 text-xs font-semibold text-[#344054] transition-all hover:bg-[#F4F6FA]"
              >
                <Calendar size={14} />
                <span>View Week View</span>
              </Link>
            </div>
          </div>
        ) : (
          safeVisits.map((visit, index) => {
            const isCompleted = visit?.status === "COMPLETED";
            const isCancelled = visit?.status === "CANCELLED";
            const doctorName =
              visit?.person ||
              visit?.doctor?.nameAR ||
              visit?.doctor?.nameEN ||
              `Doctor #${index + 1}`;
            const hospitalName =
              visit?.place || visit?.doctor?.accountName || "Clinic / Account";
            const timeLabel = visit?.timeLabel || visit?.time || "Flexible";
            const visitId = visit?.id || `visit-${index}`;
            const visitDate = getVisitDateLabel(visit?.date);
            const visitType = visit?.visitType || "Routine Visit";

            return (
              <div
                key={visitId}
                className={`flex flex-col gap-3 rounded-[12px] border p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${
                  isCompleted
                    ? "border-[#CBEFDD] bg-[#F7FCFA]"
                    : isCancelled
                    ? "border-[#F5C9C5] bg-[#FFF5F5]"
                    : "border-[#E5E8EF] bg-white hover:border-[#CBD5E1] hover:shadow-xs"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#F4F6FA] px-2 py-1 text-xs font-semibold text-[#182033] border border-[#E5E8EF]">
                      <Clock size={12} className="text-[#667085]" />
                      {timeLabel}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className="text-sm font-bold text-[#182033] truncate"
                        dir="auto"
                        title={doctorName}
                      >
                        {doctorName}
                      </h3>

                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isCompleted
                            ? "bg-[#E9F8F1] text-[#168557] border border-[#CBEFDD]"
                            : isCancelled
                            ? "bg-[#FFF1F0] text-[#B42318] border border-[#F5C9C5]"
                            : "bg-[#FFF8E5] text-[#8A6515] border border-[#F5DFAC]"
                        }`}
                      >
                        {isCompleted
                          ? "Completed"
                          : isCancelled
                          ? "Cancelled"
                          : "Scheduled"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#667085]">
                      <span className="flex items-center gap-1">
                        <Building2 size={12} />
                        <span className="truncate max-w-[200px]" dir="auto" title={hospitalName}>
                          {hospitalName}
                        </span>
                      </span>
                      <span>•</span>
                      <span>{visitType}</span>
                      <span>•</span>
                      <span>{visitDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EEF1F6]">
                  {isCompleted ? (
                    <span className="inline-flex h-8 items-center gap-1 rounded-[8px] bg-[#E9F8F1] px-3 text-xs font-semibold text-[#168557] border border-[#CBEFDD]">
                      <CircleCheckBig size={14} />
                      Done
                    </span>
                  ) : (
                    <Link
                      href={`/rep/visits/report?visitId=${visitId}`}
                      className="inline-flex h-8 items-center gap-1 rounded-[8px] bg-[#168557] px-3 text-xs font-semibold text-white hover:bg-[#107349] transition-all shadow-2xs"
                    >
                      <span>Submit Report</span>
                      <ChevronRight size={13} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
