import { UserRole } from "@/lib/types";
import { CalendarDays, ScrollText, UserPlus, FileText } from "lucide-react";
import { LucideIcon } from "lucide-react";

export type QuickAction = {
  id: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  href: string;
};

export const roleQuickActionsMap: Record<UserRole, QuickAction[]> = {
  MANAGER: [
    {
      id: "add-member",
      title: "Add new member",
      desc: "Register a new team member",
      icon: UserPlus,
      href: "/manager/team?openDialog=true",
    },
    {
      id: "schedule-visit",
      title: "Schedule Visit",
      desc: "Plan a doctor visit",
      icon: CalendarDays,
      href: "/manager/visits/add",
    },
    {
      id: "generate-report",
      title: "Generate Report",
      desc: "View performance analytics",
      icon: ScrollText,
      href: "/manager/reports",
    },
  ],
  SUPERVISOR: [
    {
      id: "view-team",
      title: "View My Team",
      desc: "Monitor your medical representatives",
      icon: UserPlus,
      href: "/supervisor/team",
    },
    {
      id: "schedule-visit",
      title: "Schedule Visit",
      desc: "Plan a doctor visit",
      icon: CalendarDays,
      href: "/supervisor/visits/add",
    },
    {
      id: "generate-report",
      title: "Generate Report",
      desc: "View performance analytics",
      icon: ScrollText,
      href: "/supervisor/reports",
    },
  ],
  MEDICAL_REP: [
    {
      id: "add-request",
      title: "Add new Request",
      desc: "Submit a new request",
      icon: FileText,
      href: "/rep/requests",
    },
    {
      id: "schedule-visit",
      title: "Schedule Visit",
      desc: "Plan a doctor visit",
      icon: CalendarDays,
      href: "/rep/visits/add",
    },
    {
      id: "generate-report",
      title: "Generate Report",
      desc: "View performance analytics",
      icon: ScrollText,
      href: "/rep/reports",
    },
  ],
};
