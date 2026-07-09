"use server";

import { apiFetch } from "@/services/http";
import { Hospital, HospitalsApiResponse } from "@/lib/types/hospitals";

/**
 * Fetch all hospitals from the backend
 * @returns Promise with hospitals data or error
 */
export async function getHospitalsAction(): Promise<{
  success: boolean;
  hospitals?: Hospital[];
  error?: string;
}> {
  try {
    const response = await apiFetch<HospitalsApiResponse>("/api/hospitals", {
      method: "GET",
    });

    if (response.status === "success" && response.data) {
      return {
        success: true,
        hospitals: response.data,
      };
    }

    return {
      success: false,
      error: response.message || "Failed to fetch hospitals",
    };
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
