import type { PaginatedApiResponse } from "@/lib/types";

/**
 * Types for forecast management (Manager/Supervisor)
 */

export interface ForecastManagementApiResponse {
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
  rep: {
    id: string;
    name: string;
    email: string;
  };
}

export type GetAllForecastsResponse = PaginatedApiResponse<
  ForecastManagementApiResponse[]
>;

export interface ForecastManagement {
  id: string;
  repId: string;
  repName: string;
  repEmail: string;
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
  totalUnits: number;
  totalDoctors: number;
  totalProducts: number;
}

export interface UpdateForecastDto {
  isApproved: boolean;
  supervisorFeedback: string;
}

export interface UpdateForecastResponse {
  status: string;
  message: string;
  data: ForecastManagementApiResponse;
}
