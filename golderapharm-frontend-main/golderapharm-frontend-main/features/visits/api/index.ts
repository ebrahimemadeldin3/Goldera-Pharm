"use server";

import { apiFetch } from "@/services/http";
import { ApiError } from "@/services/api-error";
import {
  buildPaginationQuery,
  formatDateOnly,
  isSameCalendarDate,
} from "@/lib/utils";
import { VisitFormValues } from "@/features/visits/lib/schemas";
import {
  FetchVisitsResponse,
  CreateVisitDto,
  CreateVisitResponse,
} from "@/features/visits/lib/types/api";
import { transformVisitApiResponse } from "@/features/visits/lib/utils";
import { Visit } from "@/features/visits/lib/types/ui";

/**
 * Fetch visits for medical rep from API
 */
export async function fetchRepVisits(
  page?: number,
  limit?: number,
  paginate: boolean = true,
): Promise<FetchVisitsResponse> {
  return apiFetch<FetchVisitsResponse>(
    `/api/visits${buildPaginationQuery({ page, limit, paginate })}`,
    {
      method: "GET",
    },
  );
}

/**
 * Fetch all visits for manager from API
 */
export async function fetchAllVisits(
  page?: number,
  limit?: number,
  paginate: boolean = true,
): Promise<FetchVisitsResponse> {
  return apiFetch<FetchVisitsResponse>(
    `/api/visits/all${buildPaginationQuery({ page, limit, paginate })}`,
    {
      method: "GET",
    },
  );
}

/**
 * Server action to get all visits with data transformation
 */
export async function getVisitsAction(
  page?: number,
  limit?: number,
  paginate: boolean = true,
) {
  try {
    const response = await fetchRepVisits(page, limit, paginate);

    // Transform API response to UI format
    const visits: Visit[] = response.data.map(transformVisitApiResponse);

    return {
      success: true,
      visits,
      totalCount: response.results,
      stats: {
        total: response.results,
      },
    };
  } catch (error) {
    console.error("Visits fetch error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "FETCH_ERROR",
        message: err.message || "Failed to fetch visits",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Server action to get all visits for supervisor (team scope)
 */
export async function getSupervisorVisitsAction(
  page?: number,
  limit?: number,
  paginate: boolean = true,
) {
  return getManagerVisitsAction(page, limit, paginate);
}

/**
 * Server action to get all visits for manager
 */
export async function getManagerVisitsAction(
  page?: number,
  limit?: number,
  paginate: boolean = true,
) {
  try {
    const response = await fetchAllVisits(page, limit, paginate);

    const visits: Visit[] = response.data.map(transformVisitApiResponse);

    return {
      success: true,
      visits,
      totalCount: response.results,
      stats: {
        total: response.results,
      },
    };
  } catch (error) {
    console.error("Manager visits fetch error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "FETCH_ERROR",
        message: err.message || "Failed to fetch manager visits",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Server action to get today's visits
 */
export async function getTodayVisitsAction() {
  try {
    const response = await fetchRepVisits();

    // Transform API response to UI format
    const allVisits: Visit[] = response.data.map(transformVisitApiResponse);

    // Filter for today's visits
    const today = new Date();
    const todayVisits = allVisits.filter((visit) => {
      return isSameCalendarDate(visit.date, today);
    });

    return {
      success: true,
      visits: todayVisits,
      stats: {
        total: todayVisits.length,
      },
    };
  } catch (error) {
    console.error("Today's visits fetch error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "FETCH_ERROR",
        message: err.message || "Failed to fetch today's visits",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Create a new visit via API
 */
export async function createVisit(
  data: CreateVisitDto,
): Promise<CreateVisitResponse> {
  return apiFetch<CreateVisitResponse>("/api/visits", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Server action to create a visit with error handling
 */
export async function createVisitAction(data: VisitFormValues) {
  try {
    // Transform form data to API DTO
    const dto: CreateVisitDto = {
      doctorId: data.doctorId,
      products: data.products,
      date: formatDateOnly(data.date),
      time: data.time,
      notes: data.notes,
    };

    // Add role-specific fields
    if ("visitType" in data && data.visitType) {
      dto.visitType = data.visitType;
    }

    if ("supervisorId" in data && data.supervisorId) {
      dto.supervisorId = data.supervisorId;
    }

    if ("medicalRepId" in data && data.medicalRepId) {
      dto.medicalRepId = data.medicalRepId;
    }

    const response = await createVisit(dto);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Visit creation error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        statusCode: err.statusCode,
      },
    };
  }
}
