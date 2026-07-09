import { ForecastPeriodType, ForecastStatus, Specialty } from "@/lib/types";
import type { PaginatedApiResponse } from "@/lib/types";

/**
 * Backend API types
 */
export interface ForecastApiResponse {
  id: string;
  repId: string;
  periodType: string;
  periodDate: string;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  productForecasts: {
    id: string;
    forecastId: string;
    productName: string;
    productUnits: number;
    doctorName: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

export type GetForecastsResponse = PaginatedApiResponse<ForecastApiResponse[]>;

export interface CreateForecastApiDto {
  periodType: string;
  periodDate: string;
  productForecasts: {
    productName: string;
    productUnits: number;
    doctorName: string;
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
  periodType: ForecastPeriodType;
  period: string;
  month?: string;
  quarter?: string;
  year: number;
  status: ForecastStatus;
  totalUnitsPlanned: number;
  doctorsCovered: number;
  productsUsed: number;
  totalDistribution: number;
  products: ProductAllocation[];
  distributions: DoctorDistribution[];
  notes?: string;
  supervisorFeedback?: string;
  createdAt: string;
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
  specialty: Specialty;
  hospital: string;
};
