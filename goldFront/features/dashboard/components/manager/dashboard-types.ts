import type { SaleApiResponse } from "@/features/sales/lib/types";
import type { VisitApiResponse } from "@/features/visits/lib/types/api";
import type { UserApiResponse } from "@/features/team/lib/types";
import type { CoachingReportApiResponse } from "@/features/coaching/api";
import type { AppraisalApiResponse } from "@/features/appraisal/lib/types";
import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import type { PharmacyApiResponse } from "@/features/pharmacies/lib/types";
import type { RequestApiResponse } from "@/features/requests/lib/types";

export type Period = "today" | "week" | "month" | "quarter" | "year" | "custom";
export type DashboardFilters = {
  period: Period;
  customFrom: string;
  customTo: string;
  district: string;
  region: string;
  territory: string;
  repId: string;
};
export type Dataset<T> = { data: T[]; error: boolean };
export type DashboardData = {
  sales: Dataset<SaleApiResponse>;
  visits: Dataset<VisitApiResponse>;
  team: Dataset<UserApiResponse>;
  coaching: Dataset<CoachingReportApiResponse>;
  appraisals: Dataset<AppraisalApiResponse>;
  doctors: Dataset<DoctorApiResponse>;
  pharmacies: Dataset<PharmacyApiResponse>;
  requests: Dataset<RequestApiResponse>;
  asOf: string;
};
