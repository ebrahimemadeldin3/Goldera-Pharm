"use server";

import { apiFetch } from "@/services/http";
import type { ApiError } from "@/services/api-error";
import type { PaginatedApiResponse } from "@/lib/types";
import { buildPaginationQuery } from "@/lib/utils";
import { PlanStatus, VisitPlanType } from "@/lib/types";
import { format } from "date-fns";
import { fetchProfile } from "@/features/profile/api";

// API Response Types
export type PlanApiResponse = {
  id: string;
  title: string;
  type: VisitPlanType;
  status: PlanStatus;
  description: string;
  startDate: string;
  endDate: string;
  targetDoctors: number;
  targetVisits: number;
  objectives: string[];
  supervisorFeedback: string | null;
  createdById: string;
  repId: string;
  createdAt: string;
  updatedAt: string;
  doctorsWithDates: Array<{
    doctorId: string;
    visitDate: string;
  }>;
  doctors: Array<{
    id: string;
    nameEN: string;
    nameAR?: string;
    accountName?: string;
    subRegion?: string;
    area?: string | null;
    visitDate?: string;
  }>;
  createdBy: {
    id: string;
    name: string;
  };
};

type GetPlansApiResponse = PaginatedApiResponse<PlanApiResponse[]>;

// Types specific to GET operations
export type RepInfo = {
  id: string;
  name: string;
  avatar?: string;
};

export type Doctor = {
  id: string;
  nameEN: string;
  nameAR?: string;
  accountName?: string;
  subRegion?: string;
  area?: string | null;
  visitDate?: string;
  specialty?: string;
};

export type SupervisorFeedback = {
  message: string;
  createdAt: string;
};

export type VisitPlan = {
  id: string;
  title: string;
  description: string;
  planType: VisitPlanType;
  status: PlanStatus;
  startDate: string;
  endDate: string;
  objectives: string[];
  selectedDoctors: Doctor[];
  submittedDate: string;
  supervisorFeedback?: SupervisorFeedback;
  // For supervisor view
  rep?: RepInfo;
  createdBy?: RepInfo;
  targetDoctors?: number;
  targetVisits?: number;
  progress?: number; // percentage 0-100
};

export type Plan = {
  id: string;
  planType: VisitPlanType;
  title: string;
  description: string;
  objectives: string[];
  startDate: string;
  endDate: string;
  targetDoctors: number;
  targetVisits: number;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
  progress?: number; // percentage 0-100
};

/**
 * Map API response to VisitPlan format
 */
function mapApiResponseToVisitPlan(apiPlan: PlanApiResponse): VisitPlan {
  return {
    id: apiPlan.id,
    title: apiPlan.title,
    description: apiPlan.description,
    planType: apiPlan.type,
    status: apiPlan.status,
    startDate: format(new Date(apiPlan.startDate), "MMM dd, yyyy"),
    endDate: format(new Date(apiPlan.endDate), "MMM dd, yyyy"),
    objectives: apiPlan.objectives,
    selectedDoctors: apiPlan.doctors.map((doc) => ({
      id: doc.id,
      nameEN: doc.nameEN,
      nameAR: doc.nameAR,
      accountName: doc.accountName,
      subRegion: doc.subRegion,
      area: doc.area,
      visitDate: doc.visitDate,
    })),
    rep: {
      id: apiPlan.createdBy.id,
      name: apiPlan.createdBy.name,
    },
    createdBy: {
      id: apiPlan.createdBy.id,
      name: apiPlan.createdBy.name,
    },
    submittedDate: format(new Date(apiPlan.createdAt), "MMM dd, yyyy"),
    supervisorFeedback: apiPlan.supervisorFeedback
      ? {
          message: apiPlan.supervisorFeedback,
          createdAt: format(new Date(apiPlan.updatedAt), "MMM dd, yyyy"),
        }
      : undefined,
    targetDoctors: apiPlan.targetDoctors,
    targetVisits: apiPlan.targetVisits,
  };
}

/**
 * Map API response to Plan format (supervisor own plans)
 */
function mapApiResponseToPlan(apiPlan: PlanApiResponse): Plan {
  return {
    id: apiPlan.id,
    planType: apiPlan.type,
    title: apiPlan.title,
    description: apiPlan.description,
    objectives: apiPlan.objectives,
    startDate: format(new Date(apiPlan.startDate), "MMM dd, yyyy"),
    endDate: format(new Date(apiPlan.endDate), "MMM dd, yyyy"),
    targetDoctors: apiPlan.targetDoctors,
    targetVisits: apiPlan.targetVisits,
    status: apiPlan.status,
    createdAt: format(new Date(apiPlan.createdAt), "MMM dd, yyyy"),
    updatedAt: format(new Date(apiPlan.updatedAt), "MMM dd, yyyy"),
  };
}

/**
 * Get all plans for rep
 */
export async function getRepPlansAction(
  page?: number,
  limit?: number,
): Promise<{
  success: boolean;
  data?: VisitPlan[];
  totalCount?: number;
  error?: ApiError;
}> {
  try {
    const response = await apiFetch<GetPlansApiResponse>(
      `/api/plans${buildPaginationQuery({ page, limit })}`,
      {
        method: "GET",
      },
    );

    // Map API response to VisitPlan format
    const plans = response.data.map(mapApiResponseToVisitPlan);

    return {
      success: true,
      data: plans,
      totalCount: response.results,
    };
  } catch (error) {
    console.error("Error fetching plans:", error);
    return {
      success: false,
      error: error as ApiError,
    };
  }
}

/**
 * Get all plans for manager
 */
export async function getManagerPlansAction(
  page?: number,
  limit?: number,
): Promise<{
  success: boolean;
  data?: VisitPlan[];
  totalCount?: number;
  error?: ApiError;
}> {
  try {
    const response = await apiFetch<GetPlansApiResponse>(
      `/api/plans/all${buildPaginationQuery({ page, limit })}`,
      {
        method: "GET",
      },
    );

    const plans = response.data.map(mapApiResponseToVisitPlan);

    return {
      success: true,
      data: plans,
      totalCount: response.results,
    };
  } catch (error) {
    console.error("Error fetching manager plans:", error);
    return {
      success: false,
      error: error as ApiError,
    };
  }
}

/**
 * Get plans for supervisor (team rep plans + own plans)
 */
export async function getSupervisorPlansAction(
  page?: number,
  limit?: number,
): Promise<{
  success: boolean;
  repPlans?: VisitPlan[];
  myPlans?: Plan[];
  totalCount?: number;
  error?: ApiError;
}> {
  try {
    const [response, profile] = await Promise.all([
      apiFetch<GetPlansApiResponse>(
        `/api/plans${buildPaginationQuery({ page, limit })}`,
        {
          method: "GET",
        },
      ),
      fetchProfile().catch(() => null),
    ]);

    const supervisorId = profile?.id;
    const visitPlans = response.data.map(mapApiResponseToVisitPlan);

    const repPlans = supervisorId
      ? visitPlans.filter((plan) => plan.createdBy?.id !== supervisorId)
      : visitPlans;

    const myPlans = supervisorId
      ? response.data
          .filter((plan) => plan.createdById === supervisorId)
          .map(mapApiResponseToPlan)
      : [];

    return {
      success: true,
      repPlans,
      myPlans,
      totalCount: response.results,
    };
  } catch (error) {
    console.error("Error fetching supervisor plans:", error);
    return {
      success: false,
      error: error as ApiError,
    };
  }
}

/**
 * Get a specific plan by ID
 */
export async function getPlanByIdAction(planId: string): Promise<{
  success: boolean;
  data?: VisitPlan;
  error?: ApiError;
}> {
  try {
    const plan = await apiFetch<PlanApiResponse>(`/api/plans/${planId}`, {
      method: "GET",
    });

    return {
      success: true,
      data: mapApiResponseToVisitPlan(plan),
    };
  } catch (error) {
    console.error("Error fetching plan:", error);
    return {
      success: false,
      error: error as ApiError,
    };
  }
}
