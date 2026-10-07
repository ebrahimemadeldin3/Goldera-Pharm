"use server";
import { apiFetch } from "@/services/http";
import type { ApiError } from "@/services/api-error";
import type { ManagerOverview, OverviewQuery, OverviewResult } from "./types";

export async function getManagerOverview(
  query: Partial<OverviewQuery> = {},
): Promise<OverviewResult> {
  try {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query))
      if (value && value !== "all") params.set(key, value);
    const response = await apiFetch<{ data: ManagerOverview }>(
      `/api/dashboard/managers/overview${params.size ? `?${params}` : ""}`,
      { method: "GET", signal: AbortSignal.timeout(25000) },
    );
    return { success: true, data: response.data };
  } catch (error) {
    const failure = error as ApiError;
    console.error("Manager overview request failed", {
      code: failure.code ?? "FETCH_ERROR",
      status: failure.statusCode,
    });
    return {
      success: false,
      error: {
        message:
          failure.message ||
          "The dashboard could not be reached. Please try again.",
        code: failure.code || "FETCH_ERROR",
        statusCode: failure.statusCode,
      },
    };
  }
}
