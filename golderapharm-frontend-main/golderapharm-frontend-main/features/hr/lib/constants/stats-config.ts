import { Users, Briefcase, Calendar } from "lucide-react";
import type { StatCardConfig } from "@/core/ui/stat-card-types";

export const hrStatsConfig: StatCardConfig[] = [
  {
    id: "total-members",
    label: "Total Members",
    dataKey: "totalMembers",
    icon: Users,
    bgColor: "bg-gold",
  },
  {
    id: "supervisors",
    label: "Supervisors",
    dataKey: "supervisorsCount",
    icon: Briefcase,
    bgColor: "bg-dashboard-blue",
  },
  {
    id: "medical-reps",
    label: "Medical Reps",
    dataKey: "repsCount",
    icon: Users,
    bgColor: "bg-dashboard-green",
  },
  {
    id: "avg-vacation",
    label: "Avg. Vacation Used",
    dataKey: "avgVacationUsed",
    icon: Calendar,
    bgColor: "bg-dashboard-red",
  },
];
