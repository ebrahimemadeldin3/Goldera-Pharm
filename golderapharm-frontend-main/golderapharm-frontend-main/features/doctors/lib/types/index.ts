import type { VisitApiResponse } from "@/features/visits/lib/types/api";
import type { PlanApiResponse } from "@/features/plan/api/get";
import type { CoachingReportApiResponse } from "@/features/coaching/api";

export type DoctorCardData = {
  id: string;
  nameAR: string;
  nameEN: string;
  specialty: string;
  subRegion: string;
  phone: string;
  email: string | null;
  grade: string;
  avgPatientsPerDay: number | null;
  accountName: string;
  area: string | null;
};

export type StatCard = {
  id: string;
  title: string;
  value: number | string;
  variant?: "primary" | "default" | "accent";
};

export type RegionData = {
  name: string;
  id: string;
  subRegion: {
    name: string;
    id: string;
  };
};

export type DoctorProfileData = {
  id: string;
  nameAR: string;
  nameEN: string;
  email: string | null;
  phone: string;
  grade: string;
  avgPatientsPerDay: number | null;
  specialty: string;
  planId: string | null;
  LicenseNumber: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
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
};
