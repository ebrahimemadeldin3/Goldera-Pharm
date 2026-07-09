"use server";

import { apiFetch } from "@/services/http";
import type { PaginatedApiResponse } from "@/lib/types";
import { buildPaginationQuery } from "@/lib/utils";
import { ApiError } from "@/services/api-error";
import {
  DoctorApiResponse,
  CreateDoctorDto,
  UpdateDoctorDto,
} from "../lib/types/api";

/**
 * Fetch all doctors
 */
export async function fetchDoctors(
  page?: number,
  limit?: number,
  paginate?: boolean,
): Promise<PaginatedApiResponse<DoctorApiResponse[]>> {
  const params = new URLSearchParams();

  if (paginate === false) {
    params.append("paginate", "false");
  } else {
    if (page !== undefined) {
      params.append("page", String(page));
    }

    if (limit !== undefined) {
      params.append("limit", String(limit));
    }
  }

  const endpoint = `/api/doctors${params.toString() ? `?${params.toString()}` : ""}`;

  console.log(endpoint);

  return apiFetch<PaginatedApiResponse<DoctorApiResponse[]>>(endpoint, {
    method: "GET",
  });
}

/**
 * Fetch doctors with optional sub-region filter
 */
export async function fetchDoctorsWithFilter(
  subRegion?: string,
  page?: number,
  limit?: number,
  paginate: boolean = true,
): Promise<PaginatedApiResponse<DoctorApiResponse[]>> {
  const params = new URLSearchParams();

  if (subRegion) {
    params.append("subRegion", subRegion);
  }

  if (paginate === false) {
    params.append("paginate", "false");
  } else {
    if (page !== undefined) {
      params.append("page", String(page));
    }

    if (limit !== undefined) {
      params.append("limit", String(limit));
    }
  }

  const endpoint = `/api/doctors${params.toString() ? `?${params.toString()}` : ""}`;

  console.log(endpoint);

  return apiFetch<PaginatedApiResponse<DoctorApiResponse[]>>(endpoint, {
    method: "GET",
  });
}

/**
 * Fetch single doctor by ID
 * ! This function is used in visits feature (the creation form) and coaching feature so be careful when modifying it
 */
export async function fetchDoctorById(id: string): Promise<{
  data: DoctorApiResponse;
}> {
  return apiFetch<{
    data: DoctorApiResponse;
  }>(`/api/doctors/${id}`, {
    method: "GET",
  });
}

/**
 * Create new doctor
 */
export async function createDoctor(
  data: CreateDoctorDto,
): Promise<DoctorApiResponse> {
  return apiFetch<DoctorApiResponse>("/api/doctors", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Update doctor by ID
 */
export async function updateDoctor(
  id: string,
  data: UpdateDoctorDto,
): Promise<DoctorApiResponse> {
  return apiFetch<DoctorApiResponse>(`/api/doctors/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Delete doctor by ID
 */
export async function deleteDoctor(id: string): Promise<void> {
  return apiFetch<void>(`/api/doctors/${id}`, {
    method: "DELETE",
  });
}

// Server Actions with error handling

/**
 * Server action to get all doctors
 * ! This action is used in the coaching feature to fetch doctors for joint visit reviews
 */
export async function getDoctorsAction(
  subRegion?: string,
  page?: number,
  limit?: number,
  paginate: boolean = true,
) {
  try {
    const response = await fetchDoctorsWithFilter(
      subRegion,
      page,
      limit,
      paginate,
    );

    return {
      success: true,
      data: response.data,
      results: response.results,
      pagination: response.pagination,
    };
  } catch (error) {
    console.error("Doctors fetch error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "FETCH_ERROR",
        message: err.message || "Failed to fetch doctors",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Server action to get single doctor
 */
export async function getDoctorByIdAction(id: string) {
  try {
    const doctor = await fetchDoctorById(id);
    return {
      success: true,
      data: doctor,
    };
  } catch (error) {
    console.error("Doctor fetch error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "FETCH_ERROR",
        message: err.message || "Failed to fetch doctor",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Server action to create doctor
 */
export async function createDoctorAction(data: CreateDoctorDto) {
  try {
    const doctor = await createDoctor(data);
    return {
      success: true,
      data: doctor,
    };
  } catch (error) {
    console.error("Doctor creation error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "CREATE_ERROR",
        message: err.message || "Failed to create doctor",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Server action to update doctor
 */
export async function updateDoctorAction(id: string, data: UpdateDoctorDto) {
  try {
    const doctor = await updateDoctor(id, data);
    return {
      success: true,
      data: doctor,
    };
  } catch (error) {
    console.error("Doctor update error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "UPDATE_ERROR",
        message: /*err.message ||*/ "server failed to update doctor",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Server action to toggle doctor active status
 */
export async function toggleDoctorActiveAction(id: string, isActive: boolean) {
  try {
    const doctor = await updateDoctor(id, { isActive });
    return {
      success: true,
      data: doctor,
    };
  } catch (error) {
    console.error("Doctor status update error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "UPDATE_ERROR",
        message: err.message || "Failed to update doctor status",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Server action to delete doctor
 */
export async function deleteDoctorAction(id: string) {
  try {
    await deleteDoctor(id);
    return {
      success: true,
    };
  } catch (error) {
    console.error("Doctor deletion error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "DELETE_ERROR",
        message: err.message || "Failed to delete doctor",
        statusCode: err.statusCode || 500,
      },
    };
  }
}
