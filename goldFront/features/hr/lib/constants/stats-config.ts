import {
  CalendarCheck2,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { HRStats } from "../types";

export type HRStatCardConfig = {
  id: string;
  label: string;
  dataKey: keyof HRStats;
  helper: string;
  icon: LucideIcon;
  tone: "gold" | "navy" | "green" | "neutral";
  suffix?: string;
};

export const hrStatsConfig: HRStatCardConfig[] = [
  {
    id: "total-members",
    label: "Total Members",
    dataKey: "totalMembers",
    helper: "Directory entries on this page",
    icon: UsersRound,
    tone: "gold",
  },
  {
    id: "medical-reps",
    label: "Medical Reps",
    dataKey: "repsCount",
    helper: "Field team on this page",
    icon: UserRoundCheck,
    tone: "navy",
  },
  {
    id: "supervisors",
    label: "Supervisors",
    dataKey: "supervisorsCount",
    helper: "Leadership on this page",
    icon: ShieldCheck,
    tone: "navy",
  },
  {
    id: "avg-vacation",
    label: "Avg. Approved Leave",
    dataKey: "avgVacationUsed",
    helper: "Cumulative days per member shown",
    icon: CalendarCheck2,
    tone: "gold",
    suffix: "days",
  },
];
