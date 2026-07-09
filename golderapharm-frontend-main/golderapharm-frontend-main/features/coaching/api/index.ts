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

// API Response Types
export type CoachingReportApiResponse = {
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
    name: string;
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

type GetAllCoachingReportsResponse = {
  status: string;
  message: string;
  results: number;
  pagination: Pagination;
  data: CoachingReportApiResponse[];
};

type CoachingReportsActionResult =
  | {
      success: true;
      reports: CoachingReport[];
      totalCount: number;
      stats: {
        totalReports: number;
        awaitingRepFeedback: number;
        averageRating: number;
        thisMonth: number;
      };
      error?: ApiError;
    }
  | {
      success: false;
      error: ApiError;
    };

/**
 * Fetch all coaching reports for manager
 */
export async function getAllCoachingReports(
  page?: number,
  limit?: number,
): Promise<GetAllCoachingReportsResponse> {
  return apiFetch<GetAllCoachingReportsResponse>(
    `/api/coaching-reports/all${buildPaginationQuery({ page, limit })}`,
    {
      method: "GET",
    },
  );
}

/**
 * Server action to get all coaching reports for manager
 * ! This action is used in the manager coaching dashboard
 */
export async function getAllCoachingReportsAction(
  page?: number,
  limit?: number,
): Promise<CoachingReportsActionResult> {
  try {
    const response = await getAllCoachingReports(page, limit);

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
      const status: "Completed" | "Pending Feedback" = report.repComment
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
        doctor: report.doctor.name,
        hospital: report.visitLocation,
        date: formattedDate,
        visitType: "Joint Visit", // Default to Joint Visit as per the form
        status,
        rating: report.performanceRating,
        strengths: report.visitPros,
        improvements: report.visitCons,
        actionPlan: report.actionItems.join(", "),
        supervisorComments: report.recommendations,
        repResponse: report.repComment || "No response yet",
      };
    });

    return {
      success: true,
      reports,
      totalCount: response.results,
      stats: {
        totalReports: response.results,
        awaitingRepFeedback: response.data.filter((r) => !r.repComment).length,
        averageRating:
          response.data.reduce((sum, r) => sum + r.performanceRating, 0) /
          (response.results || 1),
        thisMonth: response.data.filter((r) => {
          const reportDate = new Date(r.createdAt);
          const now = new Date();
          return getSaudiYearMonthKey(reportDate) === getSaudiYearMonthKey(now);
        }).length,
      },
    };
  } catch (error) {
    console.error("Get all coaching reports error:", error);
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
