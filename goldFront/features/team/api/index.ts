"use server";

import { apiFetch } from "@/services/http";
import { ApiError } from "@/services/api-error";
import { buildPaginationQuery } from "@/lib/utils";
import { cookies } from "next/headers";
import {
  User,
  UserApiResponse,
  UserDetailResponse,
  ManagerTeamResponse,
  SupervisorTeamResponse,
} from "../lib/types";
import { transformUserApiResponse } from "../lib/utils";

/**
 * Get manager's team by role
 * ! This API is used in multiple features: team, visits, hr
 * ! When modifying, ensure compatibility with all consuming features
 */
export async function getManagerTeam(
  role: "MEDICAL_REP" | "SUPERVISOR",
  page: number = 1,
  limit: number = 10,
): Promise<ManagerTeamResponse> {
  return apiFetch<ManagerTeamResponse>(
    `/api/managers/team${buildPaginationQuery({ page, limit })}${role ? `&role=${role}` : ""}`,
    {
      method: "GET",
    },
  );
}

/**
 * Server action to get manager's team (both medical reps and supervisors by default, or specific role)
 * ! This action is used in multiple features: team, visits, hr
 * ! When modifying, ensure compatibility with all consuming features
 */
export async function getManagerTeamAction(
  role?: "MEDICAL_REP" | "SUPERVISOR",
  page: number = 1,
  limit: number = 10,
): Promise<{
  success: boolean;
  medicalReps?: User[];
  supervisors?: User[];
  stats?: {
    totalMembers: number;
    supervisorsCount: number;
    repsCount: number;
  };
  medicalRepsTotalCount?: number;
  supervisorsTotalCount?: number;
  error?: {
    code: string;
    message: string;
    statusCode?: number;
  };
}> {
  try {
    // If role is specified, fetch only that role
    if (role) {
      const response = await getManagerTeam(role, page, limit);
      const members: User[] = response.data.map((member) =>
        transformUserApiResponse(member),
      );

      return {
        success: true,
        ...(role === "MEDICAL_REP"
          ? { medicalReps: members, supervisors: [] }
          : { medicalReps: [], supervisors: members }),
        medicalRepsTotalCount:
          role === "MEDICAL_REP"
            ? (response.results ?? response.data.length)
            : 0,
        supervisorsTotalCount:
          role === "SUPERVISOR"
            ? (response.results ?? response.data.length)
            : 0,
        stats: {
          supervisorsCount:
            role === "SUPERVISOR" ? response.supervisorsCount : 0,
          repsCount: role === "MEDICAL_REP" ? response.repsCount : 0,
          totalMembers:
            (response.repsCount || 0) + (response.supervisorsCount || 0),
        },
      };
    }

    // Fetch both medical reps and supervisors
    const [repsResponse, supervisorsResponse] = await Promise.all([
      getManagerTeam("MEDICAL_REP", page, limit),
      getManagerTeam("SUPERVISOR", page, limit),
    ]);

    // Transform API response to User format
    const medicalReps: User[] = repsResponse.data.map((member) =>
      transformUserApiResponse(member),
    );

    const supervisors: User[] = supervisorsResponse.data.map((member) =>
      transformUserApiResponse(member),
    );

    return {
      success: true,
      medicalReps,
      supervisors,
      medicalRepsTotalCount: repsResponse.results ?? repsResponse.data.length,
      supervisorsTotalCount:
        supervisorsResponse.results ?? supervisorsResponse.data.length,
      stats: {
        totalMembers:
          (repsResponse.data.length || 0) +
          (supervisorsResponse.data.length || 0),
        supervisorsCount: supervisorsResponse.supervisorsCount || 0,
        repsCount: repsResponse.repsCount || 0,
      },
    };
  } catch (error) {
    console.error("Get manager team error:", error);
    const err = error as ApiError;
    return {
      success: false,
      error: {
        code: err.code || "GET_TEAM_ERROR",
        message: err.message || "Failed to get team",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Get supervisor's team (Medical Reps only)
 */
export async function getSupervisorTeam(
  page: number = 1,
  limit: number = 10,
): Promise<SupervisorTeamResponse> {
  return apiFetch<SupervisorTeamResponse>(
    `/api/supervisors/team${buildPaginationQuery({ page, limit })}`,
    {
      method: "GET",
    },
  );
}

/**
 * Server action to get supervisor's team
 * ! This action is used in the coaching feature to fetch medical reps for joint visit reviews
 * ! used in plan creation for supervisors
 */
export async function getSupervisorTeamAction(
  page: number = 1,
  limit: number = 10,
) {
  try {
    const response = await getSupervisorTeam(page, limit);

    // Transform API response to User format
    const membersData = Array.isArray(response.data)
      ? response.data
      : response.data || [];

    const members: User[] = membersData.map((member) =>
      transformUserApiResponse(member),
    );

    const results = typeof response.results === "number" ? response.results : 0;

    return {
      success: true,
      members,
      totalCount: results,
      stats: {
        results,
      },
    };
  } catch (error) {
    console.error("Get supervisor team error:", error);
    const err = error as ApiError;
    return {
      success: false,
      error: {
        code: err.code || "GET_TEAM_ERROR",
        message: err.message || "Failed to get team",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Get supervisor's team member details by ID
 */
export async function getSupervisorTeamMemberById(id: string): Promise<{
  status: string;
  message: string;
  data: UserApiResponse;
}> {
  return apiFetch<{
    status: string;
    message: string;
    data: UserApiResponse;
  }>(`/api/supervisors/team/${id}`, {
    method: "GET",
  });
}

/**
 * Server action to get supervisor's team member by ID
 * Returns transformed User data ready for components
 */
export async function getSupervisorTeamMemberByIdAction(id: string) {
  try {
    const response = await getSupervisorTeamMemberById(id);

    // Transform to User format
    const user: User = transformUserApiResponse(response.data);

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("Get supervisor team member error:", error);
    const err = error as ApiError;
    return {
      success: false,
      error: {
        code: err.code || "GET_TEAM_MEMBER_ERROR",
        message: err.message || "Failed to get team member",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Get team member details by ID from /api/managers/users endpoint
 */
export async function getUserById(id: string): Promise<UserDetailResponse> {
  return apiFetch<UserDetailResponse>(`/api/managers/users?id=${id}`, {
    method: "GET",
  });
}

/**
 * Server action to get team member by ID
 * Returns transformed User data ready for components
 */
export async function getUserByIdAction(id: string) {
  try {
    const response = await getUserById(id);

    if (
      response.status !== "success" ||
      !response.data ||
      response.data.length === 0
    ) {
      return {
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
          statusCode: 404,
        },
      };
    }

    // Get the first user from the array (should only be one when querying by ID)
    const userApiData = response.data[0];

    // Transform to User format
    const user: User = transformUserApiResponse(userApiData);

    // Add supervisor/manager data if exists
    if (userApiData.supervisor) {
      user.supervisor = {
        id: userApiData.supervisor.id,
        name: userApiData.supervisor.name,
        email: userApiData.supervisor.email,
        phone: userApiData.supervisor.phone || "",
      };
      user.reportsTo = userApiData.supervisor.name;
    }

    if (userApiData.manager) {
      user.manager = {
        id: userApiData.manager.id,
        name: userApiData.manager.name,
        email: userApiData.manager.email,
        phone: userApiData.manager.phone || "",
      };
      if (!user.reportsTo) {
        user.reportsTo = userApiData.manager.name;
      }
    }

    // Calculate years of service
    const joinDate = new Date(userApiData.dateOfRecruitment);
    const now = new Date();
    const yearsOfService = Math.floor(
      (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365),
    );
    user.yearsOfService = yearsOfService;

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("Get member error:", error);
    const err = error as ApiError;
    return {
      success: false,
      error: {
        code: err.code || "GET_USERS_ERROR",
        message: err.message || "Failed to get user",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Add a new team member (Manager) using the existing multipart user endpoint.
 */
export async function addTeamMember(data: FormData): Promise<void> {
  const token = (await cookies()).get("token")?.value;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/managers/users`,
    {
      method: "POST",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: data,
    },
  );

  if (!res.ok) {
    let error: ApiError;
    try {
      error = await res.json();
    } catch {
      error = {
        statusCode: res.status,
        code: "ADD_MEMBER_ERROR",
        message: "Failed to add team member",
      };
    }
    throw error;
  }
}

/**
 * Server action to add a team member
 */
export async function addTeamMemberAction(data: FormData) {
  try {
    await addTeamMember(data);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Add team member error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "ADD_MEMBER_ERROR",
        message: err.message || "Failed to add team member",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Delete a team member
 */
export async function deleteTeamMember(userId: string): Promise<{
  status: string;
  message: string;
}> {
  return apiFetch<{ status: string; message: string }>(
    `/api/managers/users/${userId}`,
    {
      method: "DELETE",
    },
  );
}

/**
 * Server action to delete a team member
 */
export async function deleteTeamMemberAction(userId: string) {
  try {
    const response = await deleteTeamMember(userId);

    if (response.status === "success") {
      return {
        success: true,
        message: response.message,
      };
    }

    return {
      success: false,
      error: {
        code: "DELETE_MEMBER_ERROR",
        message: response.message || "Failed to delete team member",
        statusCode: 500,
      },
    };
  } catch (error) {
    console.error("Delete team member error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "DELETE_MEMBER_ERROR",
        message: err.message || "Failed to delete team member",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Update a team member
 */
export async function updateTeamMember(
  userId: string,
  data: Record<string, string | boolean | undefined>,
  currentUserRole: "MANAGER" | "SUPERVISOR",
): Promise<{
  status: string;
  message: string;
}> {
  const endpoint =
    currentUserRole === "MANAGER"
      ? `/api/managers/users/${userId}`
      : `/api/supervisors/users/${userId}`;

  return apiFetch<{ status: string; message: string }>(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Server action to update a team member
 */
export async function updateTeamMemberAction(
  userId: string,
  data: Record<string, string | boolean | undefined>,
  currentUserRole: "MANAGER" | "SUPERVISOR",
) {
  try {
    const response = await updateTeamMember(userId, data, currentUserRole);

    if (response.status === "success") {
      return {
        success: true,
        message: response.message,
      };
    }

    return {
      success: false,
      error: {
        code: "UPDATE_MEMBER_ERROR",
        message: response.message || "Failed to update team member",
        statusCode: 500,
      },
    };
  } catch (error) {
    console.error("Update team member error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "UPDATE_MEMBER_ERROR",
        message: err.message || "Failed to update team member",
        statusCode: err.statusCode || 500,
      },
    };
  }
}
