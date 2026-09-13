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

  if (role === "MEDICAL_REP") {
    const repData = data as RepCoachingStatsData;
    return (
      <div className="space-y-6">
        <section className="rounded-[16px] border border-[#E5E8EF] bg-white p-5 shadow-none">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085] mb-3">
            Coaching Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:divide-x sm:divide-[#EEF1F6]">
            <div className="flex flex-col gap-1 min-w-0 sm:pr-4">
              <span className="text-xs font-medium text-[#667085] truncate">Total Sessions</span>
              <span className="text-xl font-bold text-[#168557]">{repData.totalReports}</span>
            </div>
            <div className="flex flex-col gap-1 min-w-0 sm:px-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EEF1F6]">
              <span className="text-xs font-medium text-[#667085] truncate">Pending Feedback</span>
              <span className="text-xl font-bold text-[#8A6515]">{repData.pendingComments}</span>
            </div>
            <div className="flex flex-col gap-1 min-w-0 sm:px-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EEF1F6]">
              <span className="text-xs font-medium text-[#667085] truncate">Average Rating</span>
              <span className="text-xl font-bold text-[#168557]">{repData.averageRating}</span>
            </div>
            <div className="flex flex-col gap-1 min-w-0 sm:pl-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EEF1F6]">
              <span className="text-xs font-medium text-[#667085] truncate">This Month</span>
              <span className="text-xl font-bold text-[#182033]">{repData.thisMonth}</span>
            </div>
          </div>
        </section>
      </div>
    );
  }

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
      />
    </div>
  );
};

export default CoachingHeader;
