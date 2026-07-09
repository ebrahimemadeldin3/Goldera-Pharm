import { UserRole } from "@/lib/types";
import {
  Clock,
  CheckCircle,
  Calendar,
  FileText,
  Users,
} from "lucide-react";
import type { StatCardConfig } from "@/core/ui/stat-card-types";

export type RepStatsData = {
  pendingApproval: number;
  approvedPlans: number;
  weeklyPlans: number;
  monthlyPlans: number;
};

export type SupervisorStatsData = {
  pendingApprovals: number;
  activePlans: number;
  approvedThisWeek: number;
  teamMembers: number;
};

export type PlanStatConfig = StatCardConfig;

export const rolePlanStatsMap: Record<
  Exclude<UserRole, "MANAGER">,
  PlanStatConfig[]
> = {
  MEDICAL_REP: [
    {
      id: "pending-approval",
      label: "Pending Approval",
      dataKey: "pendingApproval",
      icon: Clock,
      bgColor: "gradient-orange",
    },
    {
      id: "approved-plans",
      label: "Approved Plans",
      dataKey: "approvedPlans",
      icon: CheckCircle,
      bgColor: "gradient-green",
    },
    {
      id: "weekly-plans",
      label: "Weekly Plans",
      dataKey: "weeklyPlans",
      icon: Calendar,
      bgColor: "gradient-green",
    },
    {
      id: "monthly-plans",
      label: "Monthly Plans",
      dataKey: "monthlyPlans",
      icon: FileText,
      bgColor: "gradient-blue",
    },
  ],
  SUPERVISOR: [
    {
      id: "pending-approvals",
      label: "Pending Approvals",
      dataKey: "pendingApprovals",
      icon: Clock,
      bgColor: "gradient-orange",
    },
    {
      id: "active-plans",
      label: "Active Plans",
      dataKey: "activePlans",
      icon: CheckCircle,
      bgColor: "gradient-green",
    },
    {
      id: "approved-this-week",
      label: "Approved This Week",
      dataKey: "approvedThisWeek",
      icon: FileText,
      bgColor: "gradient-blue",
    },
    {
      id: "team-members",
      label: "Team Members",
      dataKey: "teamMembers",
      icon: Users,
      bgColor: "gradient-brown",
    },
  ],
};
