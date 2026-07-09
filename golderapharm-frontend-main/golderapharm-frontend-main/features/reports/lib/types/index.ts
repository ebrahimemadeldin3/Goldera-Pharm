// Visit Report Types
export interface VisitReportApiResponse {
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
  visit: {
    id: string;
    date: string;
    doctor: {
      id: string;
      nameAR: string;
      nameEN: string;
    };
  };
}

import type { PaginatedApiResponse } from "@/lib/types";

export type VisitReportsResponse = PaginatedApiResponse<
  VisitReportApiResponse[]
>;

export interface VisitReport {
  id: string;
  visitId: string;
  visitDate: string;
  duration: string;
  rating: string;
  discussedTopics: string[];
  doctorFeedback: string | null;
  visitPurpose: string;
  notes: string;
  samplesProvided: string[];
  createdAt: string;
}
