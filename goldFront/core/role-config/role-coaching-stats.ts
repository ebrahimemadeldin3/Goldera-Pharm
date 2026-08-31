import { UserRole } from "@/lib/types";
import {
  FileText,
  CircleAlert,
  Star,
  TrendingUp,
} from "lucide-react";
import type { StatCardConfig } from "@/core/ui/stat-card-types";

export type CoachingStatConfig = StatCardConfig;

export const roleCoachingStatsMap: Record<UserRole, CoachingStatConfig[]> = {
  MANAGER: [
    {
      id: "total-reports",
      label: "Total Reports",
      dataKey: "totalReports",
      icon: FileText,
      bgColor: "gradient-blue",
    },
    {
      id: "awaiting-rep-feedback",
      label: "Awaiting Rep Feedback",
      dataKey: "awaitingRepFeedback",
      icon: CircleAlert,
      bgColor: "gradient-orange",
    },
    {
      id: "average-rating",
      label: "Average Rating",
      dataKey: "averageRating",
      icon: Star,
      bgColor: "gradient-gold",
    },
    {
      id: "this-month",
      label: "This Month",
      dataKey: "thisMonth",
      icon: TrendingUp,
      bgColor: "gradient-green",
    },
  ],
  SUPERVISOR: [
    {
      id: "total-reviews",
      label: "Total Reviews",
      dataKey: "totalReviews",
      icon: FileText,
      bgColor: "gradient-blue",
    },
    {
      id: "action-items",
      label: "Action Items",
      dataKey: "actionItems",
      icon: CircleAlert,
      bgColor: "gradient-orange",
    },
    {
      id: "avg-performance",
      label: "Avg Performance",
      dataKey: "avgPerformance",
      icon: Star,
      bgColor: "gradient-gold",
    },
    {
      id: "this-month",
      label: "This Month",
      dataKey: "thisMonth",
      icon: TrendingUp,
      bgColor: "gradient-green",
    },
  ],
  MEDICAL_REP: [
    {
      id: "total-reports",
      label: "Total Sessions",
      dataKey: "totalReports",
      icon: FileText,
      bgColor: "bg-[#E9F8F1] border border-[#CBEFDD] text-[#168557]",
    },
    {
      id: "pending-comments",
      label: "Pending Feedback",
      dataKey: "pendingComments",
      icon: CircleAlert,
      bgColor: "bg-[#FFF8E5] border border-[#E9DDB8] text-[#B18732]",
    },
    {
      id: "average-rating",
      label: "Average Rating",
      dataKey: "averageRating",
      icon: Star,
      bgColor: "bg-[#F9FAFB] border border-[#E5E8EF] text-[#F59E0B]",
    },
    {
      id: "this-month",
      label: "This Month",
      dataKey: "thisMonth",
      icon: TrendingUp,
      bgColor: "bg-[#E9F8F1] border border-[#CBEFDD] text-[#168557]",
    },
  ],
};
