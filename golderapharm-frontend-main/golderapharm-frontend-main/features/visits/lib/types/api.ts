import { VisitStatus, VisitType } from "@/lib/types";
import type { PaginatedApiResponse } from "@/lib/types";

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
  };
  createdBy: {
    id: string;
    name: string;
  };
  visitType?: VisitType | "ROUTINE" | string;
  supervisorId?: string;
  medicalRepId?: string;
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
  products?: string;
  date: string; // ISO date string
  time: string;
  visitType?: VisitType;
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
