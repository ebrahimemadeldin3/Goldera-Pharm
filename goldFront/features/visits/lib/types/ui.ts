import { VisitStatus } from "@/lib/types";

/**
 * UI Visit type for displaying in components
 * used in dashboard
 */
export type Visit = {
  id: string;
  date: Date;
  person: string; // Doctor name
  place: string;
  timeLabel: string; // e.g., "09:30 AM"
  duration: string;
  status: VisitStatus;
  statusLabel: string; // UI label
  badge?: string;
  notes?: string;
  createdBy: string; // Name of person who created
  samples: string[]; // Products/samples
  visitType?: string;
  doctorId: string;
  userId: string;
  doctor?: {
    id: string;
    nameAR: string;
    nameEN: string;
    accountName: string;
  };
  doctorNameEN?: string;
  doctorNameAR?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Extended visit details from API
 */
export type VisitDetails = {
  id: string;
  doctorId: string;
  doctorName: string;
  products?: string;
  date: string; // ISO date string
  time: string;
  visitType?: string;
  supervisorId?: string;
  supervisorName?: string;
  medicalRepId?: string;
  medicalRepName?: string;
  notes?: string;
  status: VisitStatus;
  createdAt: string;
  updatedAt: string;
};

// Re-export API types for convenience
export type {
  VisitApiResponse,
  FetchVisitsResponse,
  CreateVisitDto,
  CreateVisitResponse,
} from "./api";
