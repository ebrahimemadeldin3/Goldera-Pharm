"use server";

import { apiFetch } from "@/services/http";
import { ApiError } from "@/services/api-error";
import { buildPaginationQuery } from "@/lib/utils";
import type {
  ForecastManagementApiResponse,
  GetAllForecastsResponse,
  ForecastManagement,
  UpdateForecastDto,
  UpdateForecastResponse,
} from "../lib/types/management";

/**
 * Transform API forecast to UI forecast
 */
function transformForecast(
  apiForecast: ForecastManagementApiResponse,
): ForecastManagement {
  // Calculate totals
  const totalUnits = apiForecast.productForecasts.reduce(
    (sum, pf) => sum + pf.productUnits,
    0,
  );

  const uniqueDoctors = new Set(
    apiForecast.productForecasts.map((pf) => pf.doctorName),
  );
  const uniqueProducts = new Set(
    apiForecast.productForecasts.map((pf) => pf.productName),
  );

  return {
    id: apiForecast.id,
    repId: apiForecast.repId,
    repName: apiForecast.rep.name,
    repEmail: apiForecast.rep.email,
    periodType: apiForecast.periodType,
    periodDate: apiForecast.periodDate,
    productForecasts: apiForecast.productForecasts,
    notes: apiForecast.notes,
    isApproved: apiForecast.isApproved,
    supervisorFeedback: apiForecast.supervisorFeedback,
    createdAt: apiForecast.createdAt,
    updatedAt: apiForecast.updatedAt,
    totalUnits,
    totalDoctors: uniqueDoctors.size,
    totalProducts: uniqueProducts.size,
  };
}

/**
 * Fetch all forecasts from API
 */
export async function getAllForecasts(
  page?: number,
  limit?: number,
): Promise<GetAllForecastsResponse> {
  return apiFetch<GetAllForecastsResponse>(
    `/api/forecasts/all${buildPaginationQuery({ page, limit })}`,
    {
      method: "GET",
    },
  );
}

/**
 * Server action to get all forecasts
 */
export async function getAllForecastsAction(
  page?: number,
  limit?: number,
): Promise<{
  success: boolean;
  data?: {
    data: ForecastManagement[];
    results: number;
  };
  totalCount?: number;
  error?: {
    message: string;
    code: string;
    statusCode?: number;
  };
}> {
  try {
    const response = await getAllForecasts(page, limit);

    const forecasts = response.data.map(transformForecast);

    return {
      success: true,
      data: {
        data: forecasts,
        results: response.results,
      },
      totalCount: response.results,
    };
  } catch (error) {
    const err = error as ApiError;
    console.error("Failed to fetch forecasts:", err);

    return {
      success: false,
      error: {
        message: err.message || "Failed to load forecasts",
        code: err.code || "FETCH_ERROR",
        statusCode: err.statusCode,
      },
    };
  }
}

/**
 * Update forecast (approve/reject)
 */
export async function updateForecast(
  forecastId: string,
  data: UpdateForecastDto,
): Promise<UpdateForecastResponse> {
  return apiFetch<UpdateForecastResponse>(`/api/forecasts/${forecastId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Server action to update forecast
 */
export async function updateForecastAction(
  forecastId: string,
  isApproved: boolean,
  feedback: string,
): Promise<{
  success: boolean;
  data?: ForecastManagementApiResponse;
  error?: {
    message: string;
    code: string;
    statusCode?: number;
  };
}> {
  try {
    const response = await updateForecast(forecastId, {
      isApproved,
      supervisorFeedback: feedback,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const err = error as ApiError;
    console.error("Failed to update forecast:", err);

    return {
      success: false,
      error: {
        message: err.message || "Failed to update forecast",
        code: err.code || "UPDATE_ERROR",
        statusCode: err.statusCode,
      },
    };
  }
}
