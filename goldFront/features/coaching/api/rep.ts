"use server";

import { apiFetch } from "@/services/http";
import type { Pagination } from "@/lib/types";
import { ApiError } from "@/services/api-error";
import { CoachingReport } from "../lib/types";
import {
  buildPaginationQuery,
  formatSaudiDateDisplay,
  getSaudiYearMonthKey,
  parseDateValue,
} from "@/lib/utils";

// API Response Types (shared with manager)
type CoachingReportApiResponse = {
  id: string;
  visitDate: string;
  visitDuration: string;
  visitLocation: string;
  performanceRating: number;
  visitPros: string[];
  visitCons: string[];
  recommendations: string;
  actionItems: string[];
  notes: string | null;
  repComment: string | null;
  repAccepted: boolean;
  createdAt: string;
  rep: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  doctor: {
    id: string;
    nameAR?: string | null;
    nameEN?: string | null;
    email: string;
    phone: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
};

type GetRepCoachingReportsResponse = {
  status: string;
  message: string;
  results: number;
  pagination: Pagination;
  data: CoachingReportApiResponse[];
};

type RepCoachingReportsActionResult =
  | {
      success: true;
      reports: CoachingReport[];
      totalCount: number;
      stats: {
        totalReports: number;
        pendingComments: number;
        averageRating: number;
        thisMonth: number;
      };
      error?: ApiError;
    }
  | {
      success: false;
      error: ApiError;
    };

type AddRepCommentDto = {
  comment?: string;
  accept?: boolean;
};

function calculateRepCoachingStats(reports: CoachingReportApiResponse[]) {
  const totalReports = reports.length;

  return {
    totalReports,
    pendingComments: reports.filter((report) => !report.repAccepted).length,
    averageRating:
      totalReports > 0
        ? reports.reduce((sum, report) => sum + report.performanceRating, 0) /
          totalReports
        : 0,
    thisMonth: reports.filter((report) => {
      const reportDate = new Date(report.createdAt);
      const now = new Date();
      return getSaudiYearMonthKey(reportDate) === getSaudiYearMonthKey(now);
    }).length,
  };
}

function getDoctorDisplayName(doctor: CoachingReportApiResponse["doctor"]) {
  return doctor.nameEN || doctor.nameAR || "Unknown doctor";
}

async function getRepCoachingStatsSource(
  response: GetRepCoachingReportsResponse,
) {
  if (response.results <= response.data.length) {
    return response.data;
  }

  const statsResponse = await getRepCoachingReports(1, response.results);
  return statsResponse.data;
}

/**
 * Fetch coaching reports for the logged-in rep
 */
export async function getRepCoachingReports(
  page?: number,
  limit?: number,
): Promise<GetRepCoachingReportsResponse> {
  return apiFetch<GetRepCoachingReportsResponse>(
    `/api/coaching-reports/rep${buildPaginationQuery({ page, limit })}`,
    {
      method: "GET",
    },
  );
}

/**
 * Add rep comment to a coaching report
 */
export async function addRepComment(
  reportId: string,
  data: AddRepCommentDto,
): Promise<void> {
  return apiFetch<void>(`/api/coaching-reports/${reportId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Server action to get coaching reports for rep
 * ! This action is used in the rep coaching dashboard
 */
export async function getRepCoachingReportsAction(
  page?: number,
  limit?: number,
): Promise<RepCoachingReportsActionResult> {
  try {
    const response = await getRepCoachingReports(page, limit);
    const statsSource = await getRepCoachingStatsSource(response);

    // Map API response to CoachingReport type
    const reports: CoachingReport[] = response.data.map((report) => {
      // Get initials from rep name
      const getInitials = (name: string) => {
        return name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
      };

      // Determine status based on rep response
      const status: "Completed" | "Pending Feedback" = report.repAccepted
        ? "Completed"
        : "Pending Feedback";

      // Format date
      const formattedDate = formatSaudiDateDisplay(
        parseDateValue(report.visitDate),
      );

      return {
        id: report.id,
        rep: {
          name: report.rep.name,
          initials: getInitials(report.rep.name),
        },
        supervisor: report.createdBy.name,
        doctor: getDoctorDisplayName(report.doctor),
        hospital: report.visitLocation,
        date: formattedDate,
        visitType: "Joint Visit",
        status,
        rating: report.performanceRating,
        strengths: report.visitPros,
        improvements: report.visitCons,
        actionPlan: report.actionItems.join(", "),
        supervisorComments: report.recommendations,
        repResponse: report.repComment || "Accepted without comment",
      };
    });

    return {
      success: true,
      reports,
      totalCount: response.results,
      stats: {
        ...calculateRepCoachingStats(statsSource),
        totalReports: response.results,
      },
    };
  } catch (error) {
    console.error("Get rep coaching reports error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "FETCH_REPORTS_ERROR",
        message: err.message || "Failed to fetch coaching reports",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Server action to add rep comment to a coaching report
 */
export async function addRepCommentAction(reportId: string, comment: string) {
  try {
    const trimmed = comment.trim();
    await addRepComment(
      reportId,
      trimmed ? { comment: trimmed } : { accept: true },
    );

    return {
      success: true,
      message: "Comment added successfully",
    };
  } catch (error) {
    console.error("Add rep comment error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "ADD_COMMENT_ERROR",
        message: err.message || "Failed to add comment",
        statusCode: err.statusCode || 500,
      },
    };
  }
}
