"use server";

import { apiFetch } from "@/services/http";
import { ApiError } from "@/services/api-error";
import { formatDateOnly } from "@/lib/utils";

export type CreateCoachingReportDto = {
  repId: string;
  doctorId: string;
  visitDate: string; // ISO date string
  visitDuration: string;
  visitLocation: string;
  performanceRating: number;
  visitPros: string[];
  visitCons: string[];
  recommendations: string;
  actionItems: string[];
  notes?: string;
};

/**
 * Create a new coaching report
 */
export async function createCoachingReport(
  data: CreateCoachingReportDto,
): Promise<void> {
  return apiFetch<void>("/api/coaching-reports", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Server action to create coaching report
 */
export async function createCoachingReportAction(data: {
  repId: string;
  doctorId: string;
  visitDate: Date;
  visitDuration: string;
  visitLocation: string;
  performanceRating: number;
  visitPros: string;
  visitCons: string;
  recommendations: string;
  actionItems: string;
  notes?: string;
}) {
  try {
    // Transform data to match API requirements
    const payload: CreateCoachingReportDto = {
      repId: data.repId,
      doctorId: data.doctorId,
      visitDate: formatDateOnly(data.visitDate),
      visitDuration: data.visitDuration,
      visitLocation: data.visitLocation,
      performanceRating: data.performanceRating,
      // Split by newlines and filter empty lines
      visitPros: data.visitPros
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
      visitCons: data.visitCons
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
      recommendations: data.recommendations,
      actionItems: data.actionItems
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
      notes: data.notes,
    };

    await createCoachingReport(payload);

    return {
      success: true,
      message: "Coaching report submitted successfully",
    };
  } catch (error) {
    console.error("Create coaching report error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "CREATE_REPORT_ERROR",
        message: err.message || "Failed to create coaching report",
        statusCode: err.statusCode || 500,
      },
    };
  }
}
