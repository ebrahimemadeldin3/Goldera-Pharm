"use client";

import { useRoleUI } from "@/core/ui/role-ui-context";
import { StatCards } from "@/core/ui/StatCards";
import {
  ManagerCoachingStatsData,
  SupervisorCoachingStatsData,
  RepCoachingStatsData,
} from "@/features/coaching/lib/types";

type CoachingHeaderProps = {
  data:
    | ManagerCoachingStatsData
    | SupervisorCoachingStatsData
    | RepCoachingStatsData;
};

const CoachingHeader = ({ data }: CoachingHeaderProps) => {
  const { coachingStats, role } = useRoleUI();

  return (
    <div className="space-y-6">
      <header className="flex flex-col items-start justify-center">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#E9F8F1] border border-[#CBEFDD] px-2.5 py-0.5 text-[11px] font-semibold text-[#168557] uppercase tracking-wider">
            Development
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#182033] sm:text-3xl">
          Coaching & Feedback
        </h1>
        <p className="mt-0.5 text-sm text-[#667085]">
          View your coaching sessions and supervisor feedback
        </p>
      </header>

      <StatCards
        stats={coachingStats}
        data={data}
        cardClassName={role === "MEDICAL_REP" ? "rounded-[14px]" : undefined}
      />
    </div>
  );
};

export default CoachingHeader;
