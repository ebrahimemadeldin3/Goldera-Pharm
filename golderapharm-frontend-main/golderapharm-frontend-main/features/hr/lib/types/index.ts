import type { PaginatedApiResponse } from "@/lib/types";
import { UserRole } from "@/lib/types";

// SubRegion and Region types
export type SubRegion = {
  id: string;
  name: string;
  regionId: string;
  createdAt: string;
  updatedAt: string;
};

// Visit type
export type Visit = {
  id: string;
  visitType: string;
  samples: string[];
  date: string;
  time: string;
  doctorId: string;
  userId: string;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

// Request type
export type Request = {
  id: string;
  title: string;
  userId: string;
  type: string;
  status: string;
  urgency: string;
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
};

// Visit Report type
export type VisitReport = {
  id: string;
  visitId: string;
  userId: string;
  duration: string;
  rating: string;
  discussedTopics: string[];
  doctorFeedback: string | null;
  visitPurpose: string;
  notes: string;
  samplesProvided: string[];
  createdAt: string;
  updatedAt: string;
};

// Plan type
export type Plan = {
  id: string;
  title: string;
  type: string;
  status: string;
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
};

// Forecast type
export type Forecast = {
  id: string;
  repId: string;
  periodType: string;
  periodDate: string;
  productForecasts: {
    doctorName: string;
    productName: string;
    productUnits: number;
  }[];
  notes: string | null;
  isApproved: boolean;
  supervisorFeedback: string | null;
  createdAt: string;
  updatedAt: string;
};

// Appraisal type
export type Appraisal = {
  id: string;
  period: string;
  salesPerformance: number;
  customerRelationships: number;
  productKnowledge: number;
  complianceAndRegulations: number;
  teamworkAndCollaboration: number;
  feedbackComments: string;
  repId: string;
  managerId: string;
  createdAt: string;
  updatedAt: string;
};

// Manager/Supervisor reference type (simplified)
export type UserReference = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

// Main HR Member type with all details
export type HRMember = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
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
  lastLogin: string | null;
  isActive: boolean;
  profileImage: {
    url: string;
    public_id: string;
  } | null;
  leaveStartDate: string | null;
  leaveEndDate: string | null;
  leaveDaysCountTotal: number;
  regions: unknown[]; // Regions array for managers/supervisors
  subRegion: SubRegion | null;
  subRegionId: string | null;
  supervisorId: string | null;
  managerId: string | null;
  supervisor: UserReference | null;
  manager: UserReference | null;
  reps: unknown[]; // Team reps for supervisors
  users: unknown[]; // Team users for managers
  visits: Visit[];
  requests: Request[];
  visitReports: VisitReport[];
  plans: Plan[];
  repPlans: Plan[];
  forecasts: Forecast[];
  coachings: unknown[]; // Coaching sessions given
  repCoachings: unknown[]; // Coaching sessions received
  appraisalsByManager: Appraisal[];
  appraisalsForRep: Appraisal[];
  createdAt: string;
  updatedAt: string;
};

export type HRStats = {
  totalMembers: number;
  supervisorsCount: number;
  repsCount: number;
  avgVacationUsed: number;
};

export type HRUsersApiResponse = PaginatedApiResponse<HRMember[]>;
