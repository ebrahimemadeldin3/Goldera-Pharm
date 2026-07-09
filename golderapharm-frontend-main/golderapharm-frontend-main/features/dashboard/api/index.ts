"use server";

import { apiFetch } from "@/services/http";
import { ApiError } from "@/services/api-error";
import { formatDateOnly } from "@/lib/utils";
import {
  ManagerDashboardResponse,
  ManagerDashboardData,
  RepDashboardResponse,
  RepDashboardData,
  SupervisorDashboardResponse,
  SupervisorDashboardData,
} from "../lib/types";

/**
 * Fetch manager dashboard data
 * @returns Manager dashboard statistics and data
 */
export async function fetchManagerDashboard(): Promise<ManagerDashboardResponse> {
  return apiFetch<ManagerDashboardResponse>("/api/dashboard/managers", {
    method: "GET",
  });
}

/**
 * Server action to get manager dashboard data
 * Returns dashboard statistics, sales data, requests, and plans
 */
export async function getManagerDashboardAction(): Promise<{
  success: boolean;
  data?: ManagerDashboardData;
  error?: {
    message: string;
    code: string;
    statusCode?: number;
  };
}> {
  try {
    const response = await fetchManagerDashboard();

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const err = error as ApiError;
    console.error("Failed to fetch manager dashboard:", err);

    return {
      success: false,
      error: {
        message: err.message || "Failed to load dashboard data",
        code: err.code || "DASHBOARD_FETCH_ERROR",
        statusCode: err.statusCode,
      },
    };
  }
}

/**
 * Fetch supervisor dashboard data
 */
export async function fetchSupervisorDashboard(): Promise<SupervisorDashboardResponse> {
  return apiFetch<SupervisorDashboardResponse>("/api/dashboard/supervisors", {
    method: "GET",
  });
}

/**
 * Server action to get supervisor dashboard data
 */
export async function getSupervisorDashboardAction(): Promise<{
  success: boolean;
  data?: SupervisorDashboardData;
  error?: {
    message: string;
    code: string;
    statusCode?: number;
  };
}> {
  try {
    const response = await fetchSupervisorDashboard();

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const err = error as ApiError;
    console.error("Failed to fetch supervisor dashboard:", err);

    return {
      success: false,
      error: {
        message: err.message || "Failed to load dashboard data",
        code: err.code || "DASHBOARD_FETCH_ERROR",
        statusCode: err.statusCode,
      },
    };
  }
}

/**
 * Fetch medical rep dashboard data
 * @returns Rep dashboard statistics and data
 */
export async function fetchRepDashboard(): Promise<RepDashboardResponse> {
  const todayDate = formatDateOnly(new Date());

  return apiFetch<RepDashboardResponse>(
    `/api/dashboard/reps?date=${todayDate}`,
    {
      method: "GET",
    },
  );
}

/**
 * Server action to get medical rep dashboard data
 * Returns rep details and metrics including coverage, targets, requests, and visits
 */
export async function getRepDashboardAction(): Promise<{
  success: boolean;
  data?: RepDashboardData;
  error?: {
    message: string;
    code: string;
    statusCode?: number;
  };
}> {
  try {
    const response = await fetchRepDashboard();
    console.log(response);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const err = error as ApiError;
    console.error("Failed to fetch rep dashboard:", err);

    return {
      success: false,
      error: {
        message: err.message || "Failed to load dashboard data",
        code: err.code || "DASHBOARD_FETCH_ERROR",
        statusCode: err.statusCode,
      },
    };
  }
}
