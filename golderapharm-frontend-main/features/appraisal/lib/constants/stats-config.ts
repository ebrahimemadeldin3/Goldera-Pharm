import { Star, Award, TrendingUp, Calendar } from "lucide-react";
import type { StatCardConfig } from "@/core/ui/stat-card-types";

export const appraisalStatsConfig: StatCardConfig[] = [
  {
    id: "avg-score",
    label: "Average Score",
    dataKey: "avgScore",
    icon: Star,
    bgColor: "gradient-gold",
  },
  {
    id: "excellent-ratings",
    label: "Excellent Ratings",
    dataKey: "excellentCount",
    icon: Award,
    bgColor: "gradient-gold",
  },
  {
    id: "improving",
    label: "Improving",
    dataKey: "improvingCount",
    icon: TrendingUp,
    bgColor: "gradient-gold",
  },
  {
    id: "total-reviews",
    label: "Total Reviews",
    dataKey: "totalReviews",
    icon: Calendar,
    bgColor: "gradient-gold",
  },
];
