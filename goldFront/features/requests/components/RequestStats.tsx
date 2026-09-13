"use client";

import { CircleCheckBig, Clock, ListChecks, XCircle } from "lucide-react";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { StatCards } from "@/core/ui/StatCards";

interface RequestStatsProps {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const statsConfig = [
  {
    id: "total",
    label: "Total",
    dataKey: "total",
    icon: ListChecks,
    bgColor: "bg-[#F6F8FB] text-[#344054] border border-[#E5E8EF]",
  },
  {
    id: "pending",
    label: "Pending",
    dataKey: "pending",
    icon: Clock,
    bgColor: "bg-[#FFF8E5] text-[#B18732] border border-[#E9DDB8]",
  },
  {
    id: "approved",
    label: "Approved",
    dataKey: "approved",
    icon: CircleCheckBig,
    bgColor: "bg-[#E9F8F1] text-[#168557] border border-[#CBEFDD]",
  },
  {
    id: "rejected",
    label: "Rejected",
    dataKey: "rejected",
    icon: XCircle,
    bgColor: "bg-[#FEF3F2] text-[#D92D20] border border-[#FECDCA]",
  },
] as const;

export default function RequestStats({
  total,
  pending,
  approved,
  rejected,
}: RequestStatsProps) {
  const { role } = useRoleUI();

  if (role === "MEDICAL_REP") {
    return (
      <section className="rounded-[16px] border border-[#E5E8EF] bg-white p-5 shadow-none">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085] mb-3">
          Requests Summary
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:divide-x sm:divide-[#EEF1F6]">
          <div className="flex flex-col gap-1 min-w-0 sm:pr-4">
            <span className="text-xs font-medium text-[#667085] truncate">Total</span>
            <span className="text-xl font-bold text-[#182033]">{total}</span>
          </div>
          <div className="flex flex-col gap-1 min-w-0 sm:px-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EEF1F6]">
            <span className="text-xs font-medium text-[#667085] truncate">Pending</span>
            <span className="text-xl font-bold text-[#8A6515]">{pending}</span>
          </div>
          <div className="flex flex-col gap-1 min-w-0 sm:px-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EEF1F6]">
            <span className="text-xs font-medium text-[#667085] truncate">Approved</span>
            <span className="text-xl font-bold text-[#168557]">{approved}</span>
          </div>
          <div className="flex flex-col gap-1 min-w-0 sm:pl-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EEF1F6]">
            <span className="text-xs font-medium text-[#667085] truncate">Rejected</span>
            <span className="text-xl font-bold text-[#D92D20]">{rejected}</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <StatCards
      stats={[...statsConfig]}
      data={{
        total,
        pending,
        approved,
        rejected,
      }}
      cardClassName="rounded-[14px]"
    />
  );
}
