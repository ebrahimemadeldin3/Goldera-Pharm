import Link from "next/link";
import { CalendarCheck2, Clock, Building2, Stethoscope, ArrowRight } from "lucide-react";
import type { Visit } from "@/features/visits/lib/types/ui";

type DashboardVisitLike = Partial<Visit> & {
  time?: string;
};

export function NextVisitCard({ visits }: { visits: DashboardVisitLike[] }) {
  // Safe filtering for next visit (status is not completed or cancelled)
  const safeVisits = Array.isArray(visits) ? visits : [];
  const nextVisit = safeVisits.find(
    (v) => v.status !== "COMPLETED" && v.status !== "CANCELLED"
  );

  if (!nextVisit) {
    return (
      <div className="flex flex-col gap-3 rounded-[14px] border border-[#E9DDB8] bg-[#FFF8E5]/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[#FFF8E5] border border-[#E9DDB8] text-[#8A6515]">
            <CalendarCheck2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#182033]">
              No upcoming visits scheduled for today
            </h3>
            <p className="text-xs text-[#667085]">
              You have completed your scheduled visits or have none remaining.
            </p>
          </div>
        </div>

        <Link
          href="/rep/visits/add"
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-[10px] border border-[#E9DDB8] bg-white px-3.5 text-xs font-semibold text-[#8A6515] transition-all hover:bg-[#FFF8E5]"
        >
          <span>Schedule Visit</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const doctorName =
    nextVisit.person ||
    nextVisit.doctor?.nameEN ||
    nextVisit.doctor?.nameAR ||
    "Scheduled Doctor";
  const hospitalName =
    nextVisit.place || nextVisit.doctor?.accountName || "Clinic / Hospital";
  const timeLabel = nextVisit.timeLabel || nextVisit.time || "Scheduled Today";
  const visitType = nextVisit.visitType || "Routine Visit";

  return (
    <div className="flex flex-col gap-4 rounded-[14px] border border-[#CBEFDD] bg-[#E9F8F1]/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[#168557] text-white shadow-xs">
          <Stethoscope size={20} />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#168557] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Next Visit
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-[#168557]">
              <Clock size={12} />
              {timeLabel}
            </span>
          </div>

          <h3 className="text-base font-semibold text-[#182033] truncate">
            {doctorName}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#344054]">
            <span className="flex items-center gap-1">
              <Building2 size={13} className="text-[#667085]" />
              {hospitalName}
            </span>
            <span className="flex items-center gap-1 text-[#667085]">
              {visitType}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#CBEFDD]">
        <Link
          href={`/rep/visits/report?visitId=${nextVisit.id || ""}`}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] bg-[#168557] px-4 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(22,133,87,0.22)] transition-all hover:bg-[#107349]"
        >
          <span>Submit Report</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
