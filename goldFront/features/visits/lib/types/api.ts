import { VisitStatus, VisitType } from "@/lib/types";
import type { PaginatedApiResponse } from "@/lib/types";
import type { VisitCompletionLocation } from "./location";

/**
 * API response structure for a single visit
 */
export type VisitApiResponse = {
  id: string;
  samples: Array<string | { id?: string; name?: string; title?: string }>;
  date: string; // ISO date string
  time: string;
  doctorId: string;
  userId: string;
  notes: string | null;
  status: VisitStatus;
  createdAt: string;
  updatedAt: string;
  doctor: {
    id: string;
    name?: string;
    nameEN?: string;
    nameAR?: string;
    accountName?: string;
    specialty?: string;
    subRegion?: string;
    area?: string | null;
  };
  createdBy: {
    id: string;
    name: string;
  };
  medicalRep?: {
    id: string;
    name: string;
  } | null;
  visitType?: VisitType | "ROUTINE" | string;
  companionType?: "SINGLE" | "WITH_MANAGER" | null;
  creationSource?: "SCHEDULED" | "MANUAL_HISTORY" | null;
  duration?: string | null;
  accompanyingManagerId?: string | null;
  accompanyingManager?: {
    id: string;
    name: string;
    role?: string;
  } | null;
  supervisorId?: string;
  medicalRepId?: string;
  completionLocation?: VisitCompletionLocation | null;
};

/**
 * API response for fetching all visits
 */
export type FetchVisitsResponse = PaginatedApiResponse<VisitApiResponse[]>;

/**
 * DTO for creating a visit
 */
export type CreateVisitDto = {
  doctorId: string;
  samples: string[];
  date: string; // ISO date string
  time: string;
  visitType?: VisitType;
  companionType?: "SINGLE" | "WITH_MANAGER";
  accompanyingManagerId?: string;
  duration?: string;
  supervisorId?: string;
  medicalRepId?: string;
  notes?: string;
};

/**
 * API response for visit creation
 */
export type CreateVisitResponse = {
  message: string;
  data: {
    id: string;
    doctorId: string;
    date: string;
    time: string;
    visitType?: VisitType;
    status: string;
  };
};
