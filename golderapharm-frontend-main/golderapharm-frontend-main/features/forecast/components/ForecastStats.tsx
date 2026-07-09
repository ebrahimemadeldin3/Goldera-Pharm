"use client";

import { StatCards } from "@/core/ui/StatCards";
import { forecastStatsConfig } from "../lib/constants/stats-config";

type ForecastStatsProps = {
  totalProducts: number;
  totalAllocation: number;
  myDoctors: number;
  pendingApproval: number;
};

export default function ForecastStats({
  totalProducts,
  totalAllocation,
  myDoctors,
  pendingApproval,
}: ForecastStatsProps) {
  const data = {
    totalProducts,
    totalAllocation,
    myDoctors,
    pendingApproval,
  };

  return <StatCards stats={forecastStatsConfig} data={data} />;
}
