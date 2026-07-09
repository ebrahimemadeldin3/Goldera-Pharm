"use server";

import { apiFetch } from "@/services/http";
import type { ApiError } from "@/services/api-error";
import { VisitPlanType } from "@/lib/types";
import { formatDateOnly } from "@/lib/utils";
import {
  CreateSupervisorPlanFormValues,
  CreateVisitPlanFormValues,
} from "../lib/schemas";

// Types specific to CREATE operations
export type CreatePlanRep = {
  title: string;
  type: VisitPlanType;
  description?: string;
  startDate: string;
  endDate: string;
  objectives: string[];
  doctorsWithDates: { doctorId: string; visitDate: string }[];
  targetVisits: number;
};

export type CreatePlanSupervisor = {
  title: string;
  type: VisitPlanType;
  description: string;
  startDate: string;
  endDate: string;
  objectives: string[];
  doctorsWithDates: { doctorId: string; visitDate: string }[];
  targetVisits: number;
  repId: string;
};

/**
 * Create a new visit plan
 */
export async function createVisitPlan(
  data: CreatePlanRep | CreatePlanSupervisor,
): Promise<void> {
  return apiFetch<void>("/api/plans", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Server action to create a visit plan (Medical Rep)
 */
export async function createVisitPlanAction(data: CreateVisitPlanFormValues) {
  try {
    // Transform data to match API expectations
    // Split objectives by newline and filter empty lines
    const objectivesArray = data.objectives
      ? data.objectives
          .split("\n")
          .map((obj: string) => obj.trim())
          .filter((obj: string) => obj.length > 0)
      : [];

    const apiData: CreatePlanRep = {
      title: data.title,
      type: data.planType,
      description: data.description || "",
      startDate: formatDateOnly(data.startDate),
      endDate: formatDateOnly(data.endDate),
      doctorsWithDates: data.doctorsWithDates.map((d) => ({
        doctorId: d.doctorId,
        visitDate: formatDateOnly(d.visitDate),
      })),
      targetVisits: data.targetVisits,
      objectives: objectivesArray,
    };

    await createVisitPlan(apiData);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Visit plan creation error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "CREATE_ERROR",
        message: err.message || "Failed to create visit plan",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Server action to create a plan (Supervisor)
 */
export async function createSupervisorPlanAction(
  data: CreateSupervisorPlanFormValues,
) {
  try {
    // Transform data to match API expectations
    // Split objectives by newline and filter empty lines
    const objectivesArray = data.objectives
      ? data.objectives
          .split("\n")
          .map((obj: string) => obj.trim())
          .filter((obj: string) => obj.length > 0)
      : [];

    const apiData: CreatePlanSupervisor = {
      title: data.title,
      type: data.planType,
      description: data.description,
      startDate: formatDateOnly(data.startDate),
      endDate: formatDateOnly(data.endDate),
      doctorsWithDates: data.doctorsWithDates.map((d) => ({
        doctorId: d.doctorId,
        visitDate: formatDateOnly(d.visitDate),
      })),
      targetVisits: data.targetVisits,
      objectives: objectivesArray,
      repId: data.repId,
    };

    await createVisitPlan(apiData);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Supervisor plan creation error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "CREATE_ERROR",
        message: err.message || "Failed to create plan",
        statusCode: err.statusCode || 500,
      },
    };
  }
}
