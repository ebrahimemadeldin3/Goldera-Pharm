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
  const { planStats } = useRoleUI();

  if (!planStats) {
    return null;
  }

  return <StatCards stats={planStats} data={data} />;
};

export default PlanStats;
