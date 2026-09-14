"use client";

import { useRoleUI } from "@/core/ui/role-ui-context";
import { CoachingStatsCards } from "./CoachingStatsCards";
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
    <>
      <header className="coaching-section-enter relative overflow-hidden">
        <span
          className="pointer-events-none absolute inset-x-0 -bottom-8 h-16 bg-[linear-gradient(100deg,rgba(201,164,76,0.14)_0%,rgba(201,164,76,0)_42%,rgba(16,29,54,0.06)_100%)]"
          aria-hidden="true"
        />
        <p className="coaching-eyebrow text-gp-gold-600 flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
          <span
            className="coaching-eyebrow-line bg-gp-gold-500 inline-block h-px w-6"
            aria-hidden="true"
          />
          Coaching
        </p>
        <h1 className="coaching-header-title text-gp-navy-900 mt-2 text-[26px] leading-tight font-semibold sm:text-[30px]">
          Coaching Reports
        </h1>
        <p className="coaching-header-subtitle text-gp-text-muted mt-1 max-w-2xl text-sm leading-6 font-medium">
          Review, document and follow up on field coaching sessions.
        </p>
      </header>
      <CoachingStatsCards stats={coachingStats} data={data} />
    </>
  );
};

export default CoachingHeader;
