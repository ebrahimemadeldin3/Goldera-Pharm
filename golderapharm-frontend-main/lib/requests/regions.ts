"use server";

import { apiFetch } from "@/services/http";
import { Region, RegionsApiResponse } from "@/lib/types/regions";

/**
 * Fetch all regions from the backend
 * @returns Promise with regions data or error
 */
export async function getRegionsAction(): Promise<{
  success: boolean;
  regions?: Region[];
  error?: string;
}> {
  try {
    const response = await apiFetch<RegionsApiResponse>("/api/regions", {
      method: "GET",
    });

    if (response.status === "success" && response.data) {
      return {
        success: true,
        regions: response.data,
      };
    }

    return {
      success: false,
      error: response.message || "Failed to fetch regions",
    };
  } catch (error) {
    console.error("Error fetching regions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
