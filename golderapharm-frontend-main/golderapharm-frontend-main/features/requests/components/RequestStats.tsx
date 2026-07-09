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
    bgColor: "bg-system-primary",
  },
  {
    id: "pending",
    label: "Pending",
    dataKey: "pending",
    icon: Clock,
    bgColor: "bg-dashboard-orange",
  },
  {
    id: "approved",
    label: "Approved",
    dataKey: "approved",
    icon: CircleCheckBig,
    bgColor: "bg-dashboard-green",
  },
  {
    id: "rejected",
    label: "Rejected",
    dataKey: "rejected",
    icon: XCircle,
    bgColor: "bg-dashboard-red",
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
    />
  );
}
