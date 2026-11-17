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
  dateFilter?: { fromDate?: string; toDate?: string },
): Promise<VisitReportsResponse> {
  const query = buildPaginationQuery({
    page,
    limit,
    ...(dateFilter?.fromDate ? { fromDate: dateFilter.fromDate } : {}),
    ...(dateFilter?.toDate ? { toDate: dateFilter.toDate } : {}),
  });
  const endpoint =
    scope === "all"
      ? `/api/visits/all-visit-reports${query}`
      : `/api/visits/visit-reports${query}`;

  return apiFetch<VisitReportsResponse>(endpoint, {
    method: "GET",
  });
}

function mapVisitReport(report: VisitReportApiResponse): VisitReport {
  return {
    id: report.id,
    visitId: report.visitId,
    doctorNameAR: report.visit.doctor.nameAR,
    doctorNameEN: report.visit.doctor.nameEN,
    representativeName: report.visit.createdBy?.name,
    representativeId: report.visit.createdBy?.id || report.userId,
    visitDate: format(new Date(report.visit.date), "MMM dd, yyyy"),
    visitTime: report.visit.time ?? null,
    companionType: report.visit.companionType ?? null,
    accompanyingManagerName: report.visit.accompanyingManager?.name ?? null,
    creationSource: report.visit.creationSource ?? null,
    duration: report.duration,
    rating: report.rating,
    discussedTopics: report.discussedTopics,
    doctorFeedback: report.doctorFeedback,
    visitPurpose: report.visitPurpose,
    notes: report.notes,
    samplesProvided: report.samplesProvided,
    createdAt: format(new Date(report.createdAt), "MMM dd, yyyy 'at' h:mm a"),
  };
}

/**
 * Server action to get all visit reports
 * Used in manager, supervisor, and rep reports pages
 */
export async function getVisitReportsAction(
  page?: number,
  limit?: number,
  dateFilter?: { fromDate?: string; toDate?: string },
): Promise<VisitReportsActionResult> {
  try {
    const response = await getVisitReports("own", page, limit, dateFilter);
    const normalized = normalizeVisitReportsResponse(response);

    const reports: VisitReport[] = normalized.reports.map(mapVisitReport);

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
  dateFilter?: { fromDate?: string; toDate?: string },
): Promise<VisitReportsActionResult> {
  try {
    const response = await getVisitReports("all", page, limit, dateFilter);
    const normalized = normalizeVisitReportsResponse(response);

    const reports: VisitReport[] = normalized.reports.map(mapVisitReport);

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
