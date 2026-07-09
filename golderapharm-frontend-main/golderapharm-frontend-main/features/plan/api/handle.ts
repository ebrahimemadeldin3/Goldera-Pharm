"use server";

import { apiFetch } from "@/services/http";
import type { ApiError } from "@/services/api-error";
import { PlanStatus } from "@/lib/types";

// Types specific to HANDLE operations (approve/reject)
export type HandlePlanRequest = {
  action: "APPROVE" | "REJECT";
  feedback?: string;
};

export type HandlePlanResponse = {
  success: boolean;
  message: string;
};

export type UpdatePlanStatusRequest = {
  status: PlanStatus;
};

/**
 * Approve a plan (Supervisor only)
 */
export async function approvePlanAction(
  planId: string,
  feedback?: string,
): Promise<{
  success: boolean;
  error?: ApiError;
}> {
  try {
    await apiFetch<HandlePlanResponse>(`/api/plans/${planId}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ feedback }),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error approving plan:", error);
    return {
      success: false,
      error: error as ApiError,
    };
  }
}

/**
 * Reject a plan (Supervisor only)
 */
export async function rejectPlanAction(
  planId: string,
  feedback?: string,
): Promise<{
  success: boolean;
  error?: ApiError;
}> {
  try {
    await apiFetch<HandlePlanResponse>(`/api/plans/${planId}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ feedback }),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error rejecting plan:", error);
    return {
      success: false,
      error: error as ApiError,
    };
  }
}

/**
 * Generic handler for approve/reject actions
 */
export async function handlePlanAction(
  planId: string,
  action: "APPROVE" | "REJECT",
  feedback?: string,
): Promise<{
  success: boolean;
  error?: ApiError;
}> {
  if (action === "APPROVE") {
    return approvePlanAction(planId, feedback);
  } else {
    return rejectPlanAction(planId, feedback);
  }
}

/**
 * Update one plan status by id.
 * Uses PATCH /api/plans/:id with body { status }.
 */
export async function updatePlanStatusAction(
  planId: string,
  status: PlanStatus,
): Promise<{
  success: boolean;
  error?: ApiError;
}> {
  try {
    await apiFetch<HandlePlanResponse>(`/api/plans/${planId}`, {
      method: "PATCH",
      body: JSON.stringify({ status } satisfies UpdatePlanStatusRequest),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating plan status:", error);
    return {
      success: false,
      error: error as ApiError,
    };
  }
}
