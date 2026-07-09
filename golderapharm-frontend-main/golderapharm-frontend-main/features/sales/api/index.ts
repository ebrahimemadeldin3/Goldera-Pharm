"use server";

import { apiFetch } from "@/services/http";
import { ApiError } from "@/services/api-error";
import { cookies } from "next/headers";
import type { SalesQueryParams } from "../lib/types";

function buildSalesQueryString(params?: SalesQueryParams) {
  if (!params) return "";
  const query = new URLSearchParams();

  if (params.date) {
    query.set("date", params.date);
  }
  if (params.sheetName) {
    query.set("sheetName", params.sheetName);
  }
  if (typeof params.page !== "undefined") {
    query.set("page", String(params.page));
  }
  if (typeof params.limit !== "undefined") {
    query.set("limit", String(params.limit));
  }

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Fetch all sales
 */
export async function fetchSales(params?: SalesQueryParams): Promise<unknown> {
  return apiFetch<unknown>(`/api/sales${buildSalesQueryString(params)}`, {
    method: "GET",
  });
}

export async function fetchManagerRepSales(
  repId: string,
  params?: SalesQueryParams,
): Promise<unknown> {
  return apiFetch<unknown>(
    `/api/sales/reps/${repId}${buildSalesQueryString(params)}`,
    {
      method: "GET",
    },
  );
}

export async function fetchRepSales(
  params?: SalesQueryParams,
): Promise<unknown> {
  return apiFetch<unknown>(`/api/sales/reps${buildSalesQueryString(params)}`, {
    method: "GET",
  });
}

/**
 * Upload sales Excel file
 */
export async function uploadSalesFile(formData: FormData): Promise<unknown> {
  const token = (await cookies()).get("token")?.value;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sales`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Do NOT set Content-Type — let fetch set it automatically for FormData
    },
    body: formData,
  });
  if (!res.ok) {
    let error: ApiError;
    try {
      error = await res.json();
    } catch {
      error = {
        statusCode: res.status,
        code: "UPLOAD_ERROR",
        message: "Failed to upload sales file",
      };
    }
    throw error;
  }
  return res.json();
}

/**
 * Server action to get all sales
 */
export async function getSalesAction(params?: SalesQueryParams) {
  try {
    const response = await fetchSales(params);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    const err = error as ApiError;
    console.error("Sales fetch error:", err);
    return {
      success: false,
      error: {
        code: err.code || "FETCH_ERROR",
        message: err.message || "Failed to fetch sales",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

export async function getManagerRepSalesAction(
  repId: string,
  params?: SalesQueryParams,
) {
  try {
    const response = await fetchManagerRepSales(repId, params);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    const err = error as ApiError;
    console.error("Manager rep sales fetch error:", err);
    return {
      success: false,
      error: {
        code: err.code || "FETCH_ERROR",
        message: err.message || "Failed to fetch rep sales",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

export async function getRepSalesAction(params?: SalesQueryParams) {
  try {
    const response = await fetchRepSales(params);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    const err = error as ApiError;
    console.error("Rep sales fetch error:", err);
    return {
      success: false,
      error: {
        code: err.code || "FETCH_ERROR",
        message: err.message || "Failed to fetch rep sales",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Server action to upload sales Excel file
 */
export async function uploadSalesAction(formData: FormData) {
  try {
    const response = await uploadSalesFile(formData);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    const err = error as ApiError;
    console.error("Sales upload error:", err);
    return {
      success: false,
      error: {
        code: err.code || "UPLOAD_ERROR",
        message: err.message || "Failed to upload sales file",
        statusCode: err.statusCode || 500,
      },
    };
  }
}
