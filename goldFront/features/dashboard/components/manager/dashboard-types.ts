import type { SaleApiResponse } from "@/features/sales/lib/types";
import type { VisitApiResponse } from "@/features/visits/lib/types/api";
import type { UserApiResponse } from "@/features/team/lib/types";
import type { CoachingReportApiResponse } from "@/features/coaching/api";
import type { AppraisalApiResponse } from "@/features/appraisal/lib/types";

export type Period = "today" | "week" | "month" | "year" | "all";
export type Dataset<T> = { data: T[]; error: boolean };
export type DashboardData = {
  sales: Dataset<SaleApiResponse>;
  visits: Dataset<VisitApiResponse>;
  team: Dataset<UserApiResponse>;
  coaching: Dataset<CoachingReportApiResponse>;
  appraisals: Dataset<AppraisalApiResponse>;
  asOf: string;
};
