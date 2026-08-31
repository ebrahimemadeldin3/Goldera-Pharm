import Link from "next/link";
import { CalendarCheck2, Clock, Building2, CircleCheckBig, Plus, ChevronRight } from "lucide-react";
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
    <div className="flex flex-col gap-4 rounded-[16px] border border-[#E5E8EF] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF1F6] pb-3.5">
        <div>
          <h2 className="text-base font-semibold text-[#182033]">
            Today&apos;s Agenda ({safeVisits.length})
          </h2>
          <p className="text-xs text-[#667085]">
            Chronological field schedule (Asia/Riyadh timezone)
          </p>
        </div>

        <Link
          href="/rep/visits/add"
          className="inline-flex h-8 items-center gap-1 rounded-[8px] border border-[#E5E8EF] bg-[#F9FAFB] px-3 text-xs font-semibold text-[#182033] hover:bg-[#F0FDF4] hover:text-[#168557] hover:border-[#CBEFDD] transition-all"
        >
          <Plus size={14} />
          <span>Add Visit</span>
        </Link>
      </div>

      <div className="space-y-3">
        {safeVisits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#E9F8F1] text-[#168557] mb-3">
              <CalendarCheck2 size={24} />
            </div>
            <h3 className="text-sm font-semibold text-[#182033]">
              You&apos;re all clear for today.
            </h3>
            <p className="mt-1 text-xs text-[#667085] max-w-xs">
              No visits scheduled for today. Plan ahead by adding a new visit to your schedule.
            </p>
            <Link
              href="/rep/visits/add"
              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-[#168557] px-4 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(22,133,87,0.22)] transition-all hover:bg-[#107349]"
            >
              <Plus size={15} />
              <span>Schedule a Visit</span>
            </Link>
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
            const timeLabel = visit?.timeLabel || visit?.time || "Scheduled";
            const visitId = visit?.id || `visit-${index}`;
            const visitDate = getVisitDateLabel(visit?.date);
            const visitType = visit?.visitType || "Routine Visit";

            return (
              <div
                key={visitId}
                className={`flex flex-col gap-3 rounded-[14px] border p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${
                  isCompleted
                    ? "border-[#CBEFDD] bg-[#F0FDF4]/50"
                    : isCancelled
                    ? "border-[#F5C9C5] bg-[#FFF1F0]/40"
                    : "border-[#E5E8EF] bg-white hover:border-[#D8DEE8] hover:shadow-2xs"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#F6F8FB] px-2 py-1 text-xs font-semibold text-[#182033] border border-[#E5E8EF]">
                      <Clock size={12} className="text-[#667085]" />
                      {timeLabel}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#182033] truncate">
                        {doctorName}
                      </h3>

                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          isCompleted
                            ? "bg-[#E9F8F1] text-[#168557] border border-[#CBEFDD]"
                            : isCancelled
                            ? "bg-[#FFF1F0] text-[#B42318] border border-[#F5C9C5]"
                            : "bg-[#FFF8E5] text-[#8A6515] border border-[#F5DFAC]"
                        }`}
                      >
                        {isCompleted ? "Completed" : isCancelled ? "Cancelled" : "Scheduled"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#667085]">
                      <span className="flex items-center gap-1">
                        <Building2 size={12} />
                        {hospitalName}
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
