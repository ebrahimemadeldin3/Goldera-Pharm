import {
  DollarSign,
  PackageSearch,
  FileCheck,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { DashboardRequest } from "@/features/dashboard/lib/types";
import { format } from "date-fns";

const getRequestIcon = (type: string) => {
  switch (type) {
    case "EXPENSE":
      return <DollarSign size={14} className="text-[#168557]" />;
    case "SAMPLE":
      return <PackageSearch size={14} className="text-[#168557]" />;
    case "MARKETING":
      return <FileCheck size={14} className="text-[#168557]" />;
    case "LEAVE":
      return <Calendar size={14} className="text-[#168557]" />;
    default:
      return <FileCheck size={14} className="text-[#168557]" />;
  }
};

interface RepPendingRequestsProps {
  requests?: DashboardRequest[];
}

export default function RepPendingRequests({
  requests = [],
}: RepPendingRequestsProps) {
  const pendingRequests = requests
    .filter((req) => req.status === "PENDING")
    .slice(0, 3);

  const pendingCount = pendingRequests.length;

  return (
    <div className="flex flex-col justify-between rounded-[14px] border border-[#E5E8EF] bg-white p-5 shadow-none transition-all">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EEF1F6] pb-3.5">
          <h3 className="text-sm font-bold text-[#182033]">
            Pending Requests
          </h3>
          {pendingCount > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#E9DDB8] bg-[#FFF8E5] px-2.5 py-0.5 text-xs font-bold text-[#8A6515]">
              <Clock size={12} />
              {pendingCount} Pending
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-[#E5E8EF] bg-[#F4F6FA] px-2.5 py-0.5 text-xs font-semibold text-[#667085]">
              0 Pending
            </span>
          )}
        </div>

        {/* Content Body */}
        {pendingCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#E9F8F1] text-[#168557]">
              <CheckCircle2 size={18} />
            </div>
            <p className="mt-2 text-xs font-bold text-[#182033]">
              No pending requests
            </p>
            <p className="mt-0.5 text-xs text-[#667085]">
              You&apos;re all caught up.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EEF1F6] py-1">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between py-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-[8px] border border-[#CBEFDD] bg-[#E9F8F1]">
                    {getRequestIcon(req.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-[#182033]">
                      {req.title}
                    </p>
                    <p className="truncate text-[11px] text-[#667085]">
                      {req.subject}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="inline-flex items-center rounded-full border border-[#E9DDB8] bg-[#FFF8E5] px-2 py-0.5 text-[10px] font-bold text-[#8A6515]">
                    Pending
                  </span>
                  <span className="text-[11px] text-[#98A2B3]">
                    {format(new Date(req.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="mt-4 flex items-center justify-end border-t border-[#EEF1F6] pt-3">
        <Link
          href="/rep/requests"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#168557] transition-colors hover:text-[#107349]"
        >
          View All Requests
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
