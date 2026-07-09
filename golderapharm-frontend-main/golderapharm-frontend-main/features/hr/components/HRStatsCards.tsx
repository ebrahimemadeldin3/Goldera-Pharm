"use client";

import { StatCards } from "@/core/ui/StatCards";
import { hrStatsConfig } from "../lib/constants/stats-config";
import type { HRStats } from "../lib/types";

type HRStatsCardsProps = {
  stats: HRStats;
};

export function HRStatsCards({ stats }: HRStatsCardsProps) {
  return <StatCards stats={hrStatsConfig} data={stats} />;
}
