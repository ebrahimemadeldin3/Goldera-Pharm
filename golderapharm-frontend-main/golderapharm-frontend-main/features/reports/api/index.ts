"use server";

import { apiFetch } from "@/services/http";
import { ApiError } from "@/services/api-error";
import { buildPaginationQuery } from "@/lib/utils";
import { format } from "date-fns";
import {
  VisitReportsResponse,
  VisitReport,
  VisitReportApiResponse,
} from "../lib/types";

type VisitReportsScope = "own" | "all";

type VisitReportsActionResult = {
  success: boolean;
  data?: {
    reports: VisitReport[];
    totalCount: number;
  };
  error?: {
    code: string;
    message: string;
    statusCode?: number;
  };
};

function normalizeVisitReportsResponse(response: VisitReportsResponse): {
  reports: VisitReportApiResponse[];
  totalCount: number;
} {
  // Case: response.data is an object containing { data: [], results }
  type NestedPaginated = { data: VisitReportApiResponse[]; results: number };

  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    response.data &&
    typeof response.data === "object" &&
    "data" in (response.data as object) &&
    "results" in (response.data as object)
  ) {
    const nested = response.data as unknown as NestedPaginated;
    return {
      reports: nested.data || [],
      totalCount: nested.results || 0,
    };
  }

  // Case: response follows PaginatedApiResponse<T> where data is the array and results is top-level
  if (
    response &&
    typeof response === "object" &&
    Array.isArray(response.data)
  ) {
    return {
      reports: response.data,
      totalCount: response.results ?? response.data.length,
    };
  }

  return {
    reports: [],
    totalCount: 0,
  };
}

/**
 * Fetch all visit reports
 */
export async function getVisitReports(
  scope: VisitReportsScope = "own",
  page?: number,
  limit?: number,
): Promise<VisitReportsResponse> {
  const endpoint =
    scope === "all"
      ? `/api/visits/all-visit-reports${buildPaginationQuery({ page, limit })}`
      : `/api/visits/visit-reports${buildPaginationQuery({ page, limit })}`;

  return apiFetch<VisitReportsResponse>(endpoint, {
    method: "GET",
  });
}

/**
 * Server action to get all visit reports
 * Used in manager, supervisor, and rep reports pages
 */
export async function getVisitReportsAction(
  page?: number,
  limit?: number,
): Promise<VisitReportsActionResult> {
  try {
    const response = await getVisitReports("own", page, limit);
    const normalized = normalizeVisitReportsResponse(response);

    // Transform API response to client-friendly format
    const reports: VisitReport[] = normalized.reports.map((report) => ({
      id: report.id,
      visitId: report.visitId,
      doctorNameAR: report.visit.doctor.nameAR,
      doctorNameEN: report.visit.doctor.nameEN,
      visitDate: format(new Date(report.visit.date), "MMM dd, yyyy"),
      duration: report.duration,
      rating: report.rating,
      discussedTopics: report.discussedTopics,
      doctorFeedback: report.doctorFeedback,
      visitPurpose: report.visitPurpose,
      notes: report.notes,
      samplesProvided: report.samplesProvided,
      createdAt: format(new Date(report.createdAt), "MMM dd, yyyy 'at' h:mm a"),
    }));

    return {
      success: true,
      data: {
        reports,
        totalCount: (normalized.totalCount as number) || 0,
      },
    };
  } catch (error) {
    console.error("Get visit reports error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "FETCH_REPORTS_ERROR",
        message: err.message || "Failed to fetch visit reports",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

export async function getAllVisitReportsAction(
  page?: number,
  limit?: number,
): Promise<VisitReportsActionResult> {
  try {
    const response = await getVisitReports("all", page, limit);
    const normalized = normalizeVisitReportsResponse(response);

    const reports: VisitReport[] = normalized.reports.map((report) => ({
      id: report.id,
      visitId: report.visitId,
      doctorNameAR: report.visit.doctor.nameAR,
      doctorNameEN: report.visit.doctor.nameEN,
      visitDate: format(new Date(report.visit.date), "MMM dd, yyyy"),
      duration: report.duration,
      rating: report.rating,
      discussedTopics: report.discussedTopics,
      doctorFeedback: report.doctorFeedback,
      visitPurpose: report.visitPurpose,
      notes: report.notes,
      samplesProvided: report.samplesProvided,
      createdAt: format(new Date(report.createdAt), "MMM dd, yyyy 'at' h:mm a"),
    }));

    return {
      success: true,
      data: {
        reports,
        totalCount: (normalized.totalCount as number) || 0,
      },
    };
  } catch (error) {
    console.error("Get all visit reports error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "FETCH_REPORTS_ERROR",
        message: err.message || "Failed to fetch visit reports",
        statusCode: err.statusCode || 500,
      },
    };
  }
}
