import { Visit } from "@/features/visits/lib/types/ui";
import {
  RequestType,
  RequestStatus,
  PlanStatus,
  VisitPlanType,
} from "@/lib/types";

/**
 * Dashboard API Response Types
 */

export interface SalesByRegion {
  [region: string]: number;
}

export interface ProductPerformance {
  [productName: string]: number;
}

export interface DashboardRequest {
  id: string;
  title: string;
  userId: string;
  type: RequestType;
  status: RequestStatus;
  urgency: "low" | "medium" | "high" | "Priority";
  subject: string;
  description: string;
  response: string | null;
  responseDate: string | null;
  handledAt: string | null;
  leaveStartDate: string | null;
  leaveEndDate: string | null;
  leaveType: string | null;
  leaveDaysCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardPlan {
  id: string;
  title: string;
  type: VisitPlanType;
  status: PlanStatus;
  description: string;
  startDate: string;
  endDate: string;
  targetDoctors: number;
  targetVisits: number;
  objectives: string[];
  supervisorFeedback: string | null;
  createdById: string;
  repId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManagerDashboardData {
  totalSales: number;
  salesByRegion: SalesByRegion;
  productPerformance: ProductPerformance;
  requestsCount: number;
  requests: DashboardRequest[];
  pendingRequestsCount: number;
  plansCount: number;
  plans: DashboardPlan[];
}

export interface ManagerDashboardResponse {
  status: "success";
  data: ManagerDashboardData;
}

export type SupervisorDashboardData = ManagerDashboardData;

export interface SupervisorDashboardResponse {
  status: "success";
  data: SupervisorDashboardData;
}

/**
 * Dashboard Stats for MainCards component
 */
export interface DashboardStats {
  totalSales: number;
  totalTeam?: number;
  activeDoctors?: number;
  totalVisits?: number;
  pendingRequests?: number;
}

/**
 * Medical Rep Dashboard Types
 */

export interface RepSubRegion {
  id: string;
  name: string;
  regionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RepDetails {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  password: string;
  dateOfBirth: string;
  dateOfRecruitment: string;
  department: string | null;
  location: string | null;
  bio: string | null;
  educationBackground: string | null;
  iqamaNumber: string;
  passportNumber: string | null;
  resume: string | null;
  certificates: string[];
  lastLogin: string;
  isActive: boolean;
  profileImage: {
    url: string;
    public_id: string;
  } | null;
  leaveStartDate: string | null;
  leaveEndDate: string | null;
  leaveDaysCountTotal: number;
  subRegionId: string | null;
  supervisorId: string | null;
  managerId: string | null;
  createdAt: string;
  updatedAt: string;
  subRegion: RepSubRegion;
}

export interface RepMetrics {
  coverage: string;
  targetAchievement: string;
  pendingRequestsCount: number;
  pendingRequests: DashboardRequest[];
  todayVisitsCount: number;
  todayVisits: Visit[];
  totalSales: number;
}

export interface RepDashboardData {
  rep: RepDetails;
  metrics: RepMetrics;
}

export interface RepDashboardResponse {
  status: "success";
  data: RepDashboardData;
}
