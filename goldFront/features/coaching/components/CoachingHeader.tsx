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
  const { coachingStats } = useRoleUI();

  return (
    <>
      <header className="flex flex-col items-start justify-start">
        <h1 className="font-nomral text-2xl text-black md:text-[34px]">
          Coaching Reports
        </h1>
        <p className="text-secondary-dark text-[16px]">
          View coaching reports from supervisors
        </p>
      </header>
      <StatCards stats={coachingStats} data={data} />
    </>
  );
};

export default CoachingHeader;
