"use server";

import { apiFetch } from "@/services/http";
import { ApiError } from "@/services/api-error";
import { buildPaginationQuery } from "@/lib/utils";
import type {
  GetPharmaciesResponse,
  PharmacyApiResponse,
  CreatePharmacyDto,
} from "../lib/types";

/**
 * Fetch all pharmacies
 */
export async function fetchPharmacies(
  page?: number,
  limit?: number,
): Promise<GetPharmaciesResponse> {
  return apiFetch<GetPharmaciesResponse>(
    `/api/pharmacies${buildPaginationQuery({ page, limit })}`,
    {
      method: "GET",
    },
  );
}

/**
 * Create a new pharmacy
 */
export async function createPharmacy(
  data: CreatePharmacyDto,
): Promise<PharmacyApiResponse> {
  return apiFetch<PharmacyApiResponse>("/api/pharmacies", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Server action to get all pharmacies
 */
export async function getPharmaciesAction(
  page: number = 1,
  limit: number = 10,
) {
  try {
    const response = await fetchPharmacies(page, limit);
    return {
      success: true,
      data: response.data,
      results: response.results,
      pagination: response.pagination,
    };
  } catch (error) {
    const err = error as ApiError;
    console.error("Pharmacies fetch error:", err);
    return {
      success: false,
      error: {
        code: err.code || "FETCH_ERROR",
        message: err.message || "Failed to fetch pharmacies",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Server action to create a pharmacy
 */
export async function createPharmacyAction(data: CreatePharmacyDto) {
  try {
    const response = await createPharmacy(data);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    const err = error as ApiError;
    console.error("Pharmacy create error:", err);
    return {
      success: false,
      error: {
        code: err.code || "CREATE_ERROR",
        message: err.message || "Failed to create pharmacy",
        statusCode: err.statusCode || 500,
      },
    };
  }
}
