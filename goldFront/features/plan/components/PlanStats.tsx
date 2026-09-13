"use client";

import { useRoleUI } from "@/core/ui/role-ui-context";
import { StatCards } from "@/core/ui/StatCards";
import type {
  RepStatsData,
  SupervisorStatsData,
} from "@/core/role-config/role-plan-stats";

type PlanStatsProps = {
  data: RepStatsData | SupervisorStatsData;
};

const PlanStats = ({ data }: PlanStatsProps) => {
  const { planStats, role } = useRoleUI();

  if (!planStats) {
    return null;
  }

  if (role === "MEDICAL_REP") {
    const repData = data as RepStatsData;
    return (
      <section className="mt-6 rounded-[16px] border border-[#E5E8EF] bg-white p-5 shadow-none">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085] mb-3">
          Plan Overview
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:divide-x sm:divide-[#EEF1F6]">
          <div className="flex flex-col gap-1 min-w-0 sm:pr-4">
            <span className="text-xs font-medium text-[#667085] truncate">Pending Approval</span>
            <span className="text-xl font-bold text-[#8A6515]">{repData.pendingApproval}</span>
          </div>
          <div className="flex flex-col gap-1 min-w-0 sm:px-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EEF1F6]">
            <span className="text-xs font-medium text-[#667085] truncate">Approved Plans</span>
            <span className="text-xl font-bold text-[#168557]">{repData.approvedPlans}</span>
          </div>
          <div className="flex flex-col gap-1 min-w-0 sm:px-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EEF1F6]">
            <span className="text-xs font-medium text-[#667085] truncate">Weekly Plans</span>
            <span className="text-xl font-bold text-[#182033]">{repData.weeklyPlans}</span>
          </div>
          <div className="flex flex-col gap-1 min-w-0 sm:pl-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EEF1F6]">
            <span className="text-xs font-medium text-[#667085] truncate">Monthly Plans</span>
            <span className="text-xl font-bold text-[#182033]">{repData.monthlyPlans}</span>
          </div>
        </div>
      </section>
    );
  }

  return <StatCards stats={planStats} data={data} />;
};

export default PlanStats;
