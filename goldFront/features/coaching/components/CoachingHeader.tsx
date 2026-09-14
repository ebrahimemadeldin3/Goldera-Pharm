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
  const { coachingStats } = useRoleUI();

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
