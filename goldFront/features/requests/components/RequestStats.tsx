"use client";

import { CircleCheckBig, Clock, ListChecks, XCircle } from "lucide-react";
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
