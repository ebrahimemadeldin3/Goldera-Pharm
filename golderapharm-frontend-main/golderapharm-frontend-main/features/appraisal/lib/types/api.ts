import type { PaginatedApiResponse } from "@/lib/types";

/**
 * API response type for a single appraisal
 */
export interface AppraisalApiResponse {
  id: string;
  repId: string;
  managerId: string;
  period: string; // ISO date string
  // Job Related Skills
  presentationSkills: number;
  sellingSkills: number;
  reporting: number;
  // Job Knowledge Skills
  productInformation: number;
  competitorsInformation: number;
  // Organizational Skills
  organizationalValueAwareness: number;
  properUtilizationOfResources: number;
  // Interpersonal Skills
  reliabilityAndCredibility: number;
  independenceAndJudgment: number;
  teamSpirit: number;
  personalDrive: number;
  creativityAndInitiative: number;
  broadProspective: number;
  communicationSkills: number;
  planningAndOrganizing: number;
  // General Factors
  appearance: number;
  attitude: number;
  timing: number;
  feedbackComments: string | null;
  createdAt: string;
  updatedAt: string;
  rep?: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    department: string | null;
    location: string | null;
    subRegionId: string | null;
    iqamaNumber: string | null;
  };
  manager?: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Request body for creating a new appraisal
 */
export interface CreateAppraisalDto {
  repId: string;
  period: string; // ISO date string (e.g., "2026-02-01")
  // Job Related Skills
  presentationSkills: number;
  sellingSkills: number;
  reporting: number;
  // Job Knowledge Skills
  productInformation: number;
  competitorsInformation: number;
  // Organizational Skills
  organizationalValueAwareness: number;
  properUtilizationOfResources: number;
  // Interpersonal Skills
  reliabilityAndCredibility: number;
  independenceAndJudgment: number;
  teamSpirit: number;
  personalDrive: number;
  creativityAndInitiative: number;
  broadProspective: number;
  communicationSkills: number;
  planningAndOrganizing: number;
  // General Factors
  appearance: number;
  attitude: number;
  timing: number;
  feedbackComments?: string;
}

/**
 * Complete API response for GET /api/appraisals
 */
export type GetAppraisalsResponse = PaginatedApiResponse<
  AppraisalApiResponse[]
>;

/**
 * API response for POST /api/appraisals
 */
export interface CreateAppraisalResponse {
  success: boolean;
  data: AppraisalApiResponse;
}
