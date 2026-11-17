import type { PaginatedApiResponse } from "@/lib/types";

/**
 * Types for forecast management (Manager/Supervisor)
 */

export interface ForecastCardSummary {
  repTerritory: string | null;
  repRegion: string | null;
  managerName: string | null;
  productCount: number;
  accountCount: number;
  totalUnits: number;
  estimatedValueSAR: number | null;
  topProducts: Array<{
    productId: string | null;
    productName: string;
    units: number;
  }>;
  extraProductsCount: number;
  comparison: {
    previousForecastId: string;
    previousPeriodDate: string;
    previousUnits: number;
    quantityChangePct: number | null;
    accountCountDiff: number;
  } | null;
  warnings: Array<{
    code: string;
    message: string;
    count: number;
  }>;
}

export interface ForecastManagementApiResponse {
  id: string;
  repId: string;
  targetType?: "DOCTOR" | "PHARMACY";
  periodType: string;
  periodDate: string;
  productForecasts: {
    productId?: string;
    doctorName: string;
    productName: string;
    productUnits: number;
  }[];
  notes: string | null;
  status: string;
  isApproved: boolean;
  supervisorFeedback: string | null;
  createdAt: string;
  updatedAt: string;
  rep: {
    id: string;
    name: string;
    email: string;
    location?: string | null;
    subRegion?: {
      id: string;
      name: string;
      region?: { name: string } | null;
    } | null;
    manager?: { id: string; name: string } | null;
  };
  summary?: ForecastCardSummary;
}

export type GetAllForecastsResponse = PaginatedApiResponse<
  ForecastManagementApiResponse[]
>;

export interface ForecastManagement {
  id: string;
  repId: string;
  targetType: "DOCTOR" | "PHARMACY";
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
  status: string;
  isApproved: boolean;
  supervisorFeedback: string | null;
  createdAt: string;
  updatedAt: string;
  totalUnits: number;
  totalDoctors: number;
  totalProducts: number;
  summary?: ForecastCardSummary;
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
