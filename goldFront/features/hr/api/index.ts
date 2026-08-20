"use server";

import { apiFetch } from "@/services/http";
import { ApiError } from "@/services/api-error";
import { buildPaginationQuery } from "@/lib/utils";
import { HRMember, HRStats, HRUsersApiResponse } from "../lib/types";

/**
 * Fetch all users from /api/managers/users endpoint
 */
export async function fetchAllUsers(
  page?: number,
  limit?: number,
): Promise<HRUsersApiResponse> {
  return apiFetch<HRUsersApiResponse>(
    `/api/managers/users${buildPaginationQuery({ page, limit })}`,
    {
      method: "GET",
    },
  );
}

/**
 * Get all HR members with stats
 */
export async function getHRMembersAction(
  page?: number,
  limit?: number,
): Promise<{
  success: boolean;
  data?: {
    members: HRMember[];
    stats: HRStats;
  };
  totalCount?: number;
  error?: {
    message: string;
    code: string;
    statusCode?: number;
  };
}> {
  try {
    const response = await fetchAllUsers(page, limit);

    if (response.status !== "success") {
      return {
        success: false,
        error: {
          message: response.message || "Failed to fetch users",
          code: "FETCH_ERROR",
        },
      };
    }

    // Filter to only show supervisors and medical reps (exclude managers)
    const members = response.data.filter(
      (user) => user.role === "SUPERVISOR" || user.role === "MEDICAL_REP",
    );

    // Calculate stats
    const totalMembers = members.length;
    const supervisorsCount = members.filter(
      (m) => m.role === "SUPERVISOR",
    ).length;
    const repsCount = members.filter((m) => m.role === "MEDICAL_REP").length;

    // Calculate average vacation used
    const totalVacationUsed = members.reduce(
      (acc, m) => acc + m.leaveDaysCountTotal,
      0,
    );
    const avgVacationUsed =
      totalMembers > 0 ? Math.round(totalVacationUsed / totalMembers) : 0;

    const stats: HRStats = {
      totalMembers,
      supervisorsCount,
      repsCount,
      avgVacationUsed,
    };

    return {
      success: true,
      data: {
        members,
        stats,
      },
      totalCount: response.results,
    };
  } catch (error) {
    const err = error as ApiError;
    console.error("Failed to fetch HR members:", err);

    return {
      success: false,
      error: {
        message: err.message || "Failed to load HR members",
        code: err.code || "FETCH_ERROR",
        statusCode: err.statusCode,
      },
    };
  }
}
