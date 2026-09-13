"use client";

import { useRoleUI } from "@/core/ui/role-ui-context";
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
  const { role } = useRoleUI();

  if (role === "MEDICAL_REP" || !role) {
    return (
      <section className="rounded-[16px] border border-[#E5E8EF] bg-white p-5 shadow-none">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085] mb-3">
          Forecast Overview
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:divide-x sm:divide-[#EEF1F6]">
          <div className="flex flex-col gap-1 min-w-0 sm:pr-4">
            <span className="text-xs font-medium text-[#667085] truncate">Total Products</span>
            <span className="text-xl font-bold text-[#168557]">{totalProducts}</span>
          </div>
          <div className="flex flex-col gap-1 min-w-0 sm:px-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EEF1F6]">
            <span className="text-xs font-medium text-[#667085] truncate">Total Allocation</span>
            <span className="text-xl font-bold text-[#168557]">{totalAllocation}</span>
          </div>
          <div className="flex flex-col gap-1 min-w-0 sm:px-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EEF1F6]">
            <span className="text-xs font-medium text-[#667085] truncate">My Doctors</span>
            <span className="text-xl font-bold text-[#182033]">{myDoctors}</span>
          </div>
          <div className="flex flex-col gap-1 min-w-0 sm:pl-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EEF1F6]">
            <span className="text-xs font-medium text-[#667085] truncate">Pending Approval</span>
            <span className="text-xl font-bold text-[#8A6515]">{pendingApproval}</span>
          </div>
        </div>
      </section>
    );
  }

  const data = {
    totalProducts,
    totalAllocation,
    myDoctors,
    pendingApproval,
  };

  return <StatCards stats={forecastStatsConfig} data={data} cardClassName="rounded-[14px]" />;
}
