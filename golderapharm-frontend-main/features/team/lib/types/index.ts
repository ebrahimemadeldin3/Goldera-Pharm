import type { PaginatedApiResponse } from "@/lib/types";
import { UserRole } from "@/lib/types";

// Region data structure
export type RegionData = {
  name: string;
  id: string;
  subRegion: {
    name: string;
    id: string;
  };
};

// Main User type - used for all team member representations
export type User = {
  // Core Identity
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  password?: string;
  inHR?: boolean;

  // Location & Organization
  region: RegionData;
  department?: string;
  location?: string;

  // Relationships
  supervisorId?: string;
  managerId?: string;
  supervisor?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  manager?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };

  // Personal Information
  dateOfBirth?: string;
  bio?: string;
  education?: string;
  iqama?: string;
  passport?: string;
  avatar?: string;

  // Employment Details
  joinedDate: string;
  dateOfRecruitment?: string;
  employeeId?: string;
  yearsOfService?: number;

  // Documents
  resume?: string;
  certificates?: string;

  // Performance & Stats // did not used
  sales?: string;
  totalSales?: string;
  targetPercentage?: number;
  monthlyVisits?: number;
  pendingRequests?: number;
  repsCount?: number; // For supervisors only

  // Performance Appraisal (optional fields from backend)
  overall?: number;
  deltaLabel?: string;
  quarter?: string;
  categories?: Array<{
    id: string;
    title: string;
    value: number;
  }>;
  managerComments?: string;
  reviewedBy?: string;
  lastReview?: string;
  nextReview?: string;

  // Account & System Info
  lastLogin?: string;
  accountCreated?: string;
  createdAt?: string;
  updatedAt?: string;
  reportsTo?: string;
};

export type AddMemberFormData = {
  // Required fields
  name: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: string; // ISO 8601 DateTime string

  // Optional fields with defaults or nullable
  role?: "SUPERVISOR" | "MEDICAL_REP"; // defaults to MEDICAL_REP on backend
  dateOfRecruitment?: string; // ISO 8601 DateTime string, defaults to now() if omitted
  department?: string;
  regionId?: string;
  subRegionId?: string;
  bio?: string;
  educationBackground?: string;
  iqamaNumber?: string;
  passportNumber?: string;
  resume?: string; // URL or path
  certificates?: string; // URL or description
  lastLogin?: string; // ISO 8601 DateTime string
  supervisorId?: string; // Required for MEDICAL_REP in many flows
};

// API Response Types
export type SubRegion = {
  id: string;
  name: string;
  regionId: string;
  createdAt: string;
  updatedAt: string;
};

export type UserReference = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
};

export type UserApiResponse = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
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
  lastLogin: string | null;
  profileImage: {
    url: string;
    public_id: string;
  } | null;
  leaveStartDate: string | null;
  leaveEndDate: string | null;
  leaveDaysCountTotal: number;
  regionId?: string | null;
  subRegionId: string | null;
  subRegion: SubRegion | null;
  region?: {
    id: string;
    name: string;
    subRegion?: {
      id: string;
      name: string;
    };
  };
  supervisorId: string | null;
  managerId: string | null;
  supervisor: UserReference | null;
  manager: UserReference | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  inHR?: boolean;
};

export type UserDetailResponse = PaginatedApiResponse<UserApiResponse[]>;

export type ManagerTeamResponse = PaginatedApiResponse<UserApiResponse[]> & {
  supervisorsCount: number;
  repsCount: number;
};

export type SupervisorTeamResponse = PaginatedApiResponse<UserApiResponse[]>;
