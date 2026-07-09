import type { VisitApiResponse } from "@/features/visits/lib/types/api";
import type { PlanApiResponse } from "@/features/plan/api/get";
import type { CoachingReportApiResponse } from "@/features/coaching/api";

// Types for API requests/responses
export interface CreateDoctorDto {
  nameEN: string;
  nameAR: string;
  email?: string;
  phone: string;
  grade: string;
  avgPatientsPerDay?: number;
  specialty: string;
  LicenseNumber?: string;
  accountName: string;
  subRegion: string;
  area?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateDoctorDto {
  nameEN?: string;
  nameAR?: string;
  email?: string;
  phone?: string;
  avgPatientsPerDay?: number;
  specialty?: string;
  grade?: string;
  LicenseNumber?: string;
  accountName?: string;
  subRegion?: string;
  area?: string;
  isActive?: boolean;
  latitude?: number;
  longitude?: number;
}

// ! this interface is used in visits feature ( the creation form ) so be careful when modifying it ( only name , id are needed)
export interface DoctorApiResponse {
  id: string;
  name?: string; // Deprecated - use nameEN or nameAR
  nameAR: string;
  nameEN: string;
  email: string | null;
  phone: string;
  grade: string;
  avgPatientsPerDay: number | null;
  dateOfBirth?: string | null;
  specialty: string;
  planId: string | null;
  LicenseNumber: string | null;
  isActive: boolean;
  latitude: number | null;
  longitude: number | null;
  accountName: string;
  subRegion: string;
  area: string | null;
  accountsId: string | null;
  createdAt: string;
  updatedAt: string;
  // Extended properties (only in detail view)
  visits?: VisitApiResponse[];
  plan?: PlanApiResponse;
  coachings?: CoachingReportApiResponse[];
}
