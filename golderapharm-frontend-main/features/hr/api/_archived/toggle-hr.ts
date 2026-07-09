"use server";

import { apiFetch } from "@/services/http";
import { ApiError } from "@/services/api-error";

/**
 * ARCHIVED: Toggle HR membership for a user
 * This functionality was removed in favor of showing all users
 */
export async function toggleHRMember(
  userId: string,
  inHR: boolean,
): Promise<{ status: string; message: string }> {
  return apiFetch<{ status: string; message: string }>(
    `/api/managers/users/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify({ inHR }),
    },
  );
}

/**
 * ARCHIVED: Server action to toggle HR membership
 */
export async function toggleHRMemberAction(userId: string, inHR: boolean) {
  try {
    const response = await toggleHRMember(userId, inHR);

    if (response.status === "success") {
      return {
        success: true,
        message: response.message,
      };
    }

    return {
      success: false,
      error: {
        code: "TOGGLE_HR_ERROR",
        message: "Failed to update HR status",
        statusCode: 500,
      },
    };
  } catch (error) {
    console.error("Toggle HR member error:", error);
    const err = error as ApiError;
    return {
      success: false,
      error: {
        code: err.code || "TOGGLE_HR_ERROR",
        message: "Server failed to update HR status",
        statusCode: err.statusCode || 500,
      },
    };
  }
}
