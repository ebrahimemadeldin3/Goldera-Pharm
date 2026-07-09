"use server";

import { apiFetch } from "@/services/http";
import type { ApiError } from "@/services/api-error";
import type { Pagination } from "@/lib/types";
import { JointVisitReview, SupervisorCoachingStatsData } from "../lib/types";
import {
  buildPaginationQuery,
  formatSaudiDateDisplay,
  getSaudiYearMonthKey,
  parseDateValue,
} from "@/lib/utils";

type SupervisorCoachingReportResponse = {
  id: string;
  visitDate: string;
  visitDuration: string;
  visitLocation: string;
  performanceRating: number;
  visitPros: string[];
  visitCons: string[];
  recommendations: string;
  actionItems: string[];
  notes: string;
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

type ApiResponse = {
  status: string;
  message: string;
  results: number;
  pagination: Pagination;
  data: SupervisorCoachingReportResponse[];
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getStatus(rating: number): "Excellent" | "Needs Improvement" {
  return rating >= 4 ? "Excellent" : "Needs Improvement";
}

export async function getSupervisorCoachingReportsAction(
  page?: number,
  limit?: number,
): Promise<{
  success: boolean;
  totalCount?: number;
  data?: {
    reports: JointVisitReview[];
    stats: SupervisorCoachingStatsData;
  };
  error?: ApiError;
}> {
  try {
    const response = await apiFetch<ApiResponse>(
      `/api/coaching-reports${buildPaginationQuery({ page, limit })}`,
      {
        method: "GET",
      },
    );

    // Map API response to JointVisitReview format
    const reports: JointVisitReview[] = response.data.map((report) => ({
      id: report.id,
      repName: report.rep.name,
      repInitials: getInitials(report.rep.name),
      doctorName: report.doctor.name,
      date: formatSaudiDateDisplay(parseDateValue(report.visitDate)),
      duration: report.visitDuration,
      location: report.visitLocation,
      specialty: "General", // Not provided in API, using default
      status: getStatus(report.performanceRating),
      performanceRating: report.performanceRating,
      whatWentWell: report.visitPros,
      areasForImprovement: report.visitCons,
      recommendations: report.recommendations,
      actionItems: report.actionItems,
      overallNotes: report.notes,
    }));

    // Calculate stats
    const totalReports = reports.length;
    const thisMonth = response.data.filter((report) => {
      const reportDate = new Date(report.createdAt);
      const now = new Date();
      return getSaudiYearMonthKey(reportDate) === getSaudiYearMonthKey(now);
    }).length;

    const ratings = response.data.map((r) => r.performanceRating);
    const avgPerformance =
      ratings.length > 0
        ? `${(ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)}/5`
        : "0/5";

    const totalActionItems = reports.reduce(
      (sum, report) => sum + report.actionItems.length,
      0,
    );

    const stats: SupervisorCoachingStatsData = {
      totalReviews: totalReports,
      thisMonth,
      avgPerformance,
      actionItems: totalActionItems,
    };

    return {
      success: true,
      totalCount: response.results,
      data: { reports, stats },
    };
  } catch (error) {
    console.error("Error fetching supervisor coaching reports:", error);
    return {
      success: false,
      error: error as ApiError,
    };
  }
}
