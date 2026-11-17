import { ForecastPeriodType, ForecastStatus, Specialty } from "@/lib/types";
import type { PaginatedApiResponse } from "@/lib/types";

/**
 * Backend API types
 */
export type ForecastTargetType = "DOCTOR" | "PHARMACY";

export interface ForecastApiResponse {
  id: string;
  repId: string;
  targetType?: ForecastTargetType;
  periodType: string;
  periodDate: string;
  notes: string | null;
  status: string;
  isApproved?: boolean;
  supervisorFeedback?: string | null;
  createdAt: string;
  updatedAt: string;
  summary?: Forecast["summary"];
  productForecasts: {
    id?: string;
    forecastId?: string;
    productId?: string;
    productName: string;
    productUnits: number;
    doctorId?: string;
    doctorName: string;
    pharmacyId?: string;
    pharmacyName?: string;
    targetId?: string;
    targetName?: string;
    city?: string;
    subRegion?: string;
    createdAt?: string;
    updatedAt?: string;
  }[];
}

export type GetForecastsResponse = PaginatedApiResponse<ForecastApiResponse[]>;

export interface CreateForecastApiDto {
  targetType: ForecastTargetType;
  periodType: string;
  periodDate: string;
  status?: "DRAFT" | "PENDING";
  productForecasts: {
    productId?: string;
    productName: string;
    productUnits: number;
    doctorId?: string;
    doctorName: string;
    pharmacyId?: string;
    pharmacyName?: string;
    targetId?: string;
    targetName?: string;
    city?: string;
    subRegion?: string;
  }[];
  notes?: string;
}

export interface CreateForecastApiResponse {
  success: boolean;
  data: ForecastApiResponse;
}

/**
 * Backend API response for products
 */
export interface ProductApiResponse {
  id: string;
  name: string;
  internalRef: string;
  salesPrice: number;
  createdAt: string;
  updatedAt: string;
}

export type GetProductsResponse = PaginatedApiResponse<ProductApiResponse[]>;

/**
 * Backend API response for doctors
 */
export interface DoctorApiResponse {
  id: string;
  nameEN: string;
  nameAR: string;
  email: string | null;
  phone: string;
  specialty: string;
  accountName: string;
  subRegion: string;
  area: string | null;
  isActive: boolean;
}

export type GetDoctorsResponse = PaginatedApiResponse<DoctorApiResponse[]>;

/**
 * UI types
 */
export type ProductAllocation = {
  productId: string;
  productName: string;
  category: string;
  totalUnits: number;
  allocatedUnits: number;
  remainingUnits: number;
};

export type DoctorDistribution = {
  doctorId: string;
  doctorName: string;
  specialty: Specialty;
  hospital: string;
  allocations: {
    productId: string;
    units: number;
  }[];
};

export type Forecast = {
  id: string;
  targetType: ForecastTargetType;
  periodType: ForecastPeriodType;
  period: string;
  month?: string;
  quarter?: string;
  year: number;
  status: ForecastStatus;
  rawStatus?: string;
  totalUnitsPlanned: number;
  doctorsCovered: number;
  productsUsed: number;
  totalDistribution: number;
  products: ProductAllocation[];
  distributions: DoctorDistribution[];
  productForecasts?: ForecastApiResponse["productForecasts"];
  summary?: {
    productCount: number;
    accountCount: number;
    totalUnits: number;
    estimatedValueSAR: number | null;
    topProducts: Array<{
      productId: string | null;
      productName: string;
      units: number;
      accountCount?: number;
    }>;
    extraProductsCount: number;
    warnings?: Array<{ code: string; message: string; count: number }>;
  };
  notes?: string;
  supervisorFeedback?: string;
  createdAt: string;
  updatedAt?: string;
  submittedAt?: string;
  approvedAt?: string;
};

export type CreateForecastDto = {
  periodType: ForecastPeriodType;
  month?: string;
  quarter?: string;
  year: number;
  distributions: {
    doctorId: string;
    allocations: {
      productId: string;
      units: number;
    }[];
  }[];
  notes?: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  totalUnits: number;
  internalRef?: string;
  salesPrice?: number;
};

export type Doctor = {
  id: string;
  name: string;
  nameAR?: string;
  nameEN?: string;
  specialty: Specialty;
  hospital: string;
  city?: string;
  subRegion?: string;
  targetType?: ForecastTargetType;
};
