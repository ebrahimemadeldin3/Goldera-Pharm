"use server";

import { ApiError } from "@/services/api-error";
import { apiFetch } from "@/services/http";
import {
  buildPaginationQuery,
  formatSaudiDateDisplay,
  getSaudiDateParts,
  getInitials,
  parseDateValue,
} from "@/lib/utils";
import type {
  Review,
  AppraisalApiResponse,
  GetAppraisalsResponse,
  CreateAppraisalDto,
  CreateAppraisalResponse,
} from "../lib/types";

/**
 * Map API appraisal response to Review display format
 */
function mapAppraisalToReview(appraisal: AppraisalApiResponse): Review {
  // Calculate overall score from all performance metrics
  const scores = [
    appraisal.presentationSkills,
    appraisal.sellingSkills,
    appraisal.reporting,
    appraisal.productInformation,
    appraisal.competitorsInformation,
    appraisal.organizationalValueAwareness,
    appraisal.properUtilizationOfResources,
    appraisal.reliabilityAndCredibility,
    appraisal.independenceAndJudgment,
    appraisal.teamSpirit,
    appraisal.personalDrive,
    appraisal.creativityAndInitiative,
    appraisal.broadProspective,
    appraisal.communicationSkills,
    appraisal.planningAndOrganizing,
    appraisal.appearance,
    appraisal.attitude,
    appraisal.timing,
  ];
  const overallCurrent = Math.round(
    scores.reduce((acc, score) => acc + (score ?? 0), 0) / scores.length,
  );

  // Determine status badge based on overall score
  let statusBadge: "Excellent" | "Good" | "Improving" | undefined;
  if (overallCurrent >= 90) statusBadge = "Excellent";
  else if (overallCurrent >= 70) statusBadge = "Good";
  else statusBadge = "Improving";

  // Format period date
  const periodDate = parseDateValue(appraisal.period);
  const { year, month } = getSaudiDateParts(periodDate);
  const quarter = `Q${Math.ceil(Number(month) / 3)}`;

  return {
    id: appraisal.id,
    repId: appraisal.repId,
    managerId: appraisal.managerId,
    name: appraisal.rep?.name || "Unknown",
    initials: getInitials(appraisal.rep?.name || "Unknown"),
    role: appraisal.rep?.role === "SUPERVISOR" ? "Supervisor" : "Medical Rep",
    email: appraisal.rep?.email || "N/A",
    department: appraisal.rep?.department || undefined,
    location: appraisal.rep?.location || undefined,
    period: `${quarter} ${year}`,
    statusBadge,
    lastReview: formatSaudiDateDisplay(new Date(appraisal.createdAt)),
    overallCurrent,
    kpis: [
      // Job Related Skills
      {
        label: "Presentation Skills",
        value: appraisal.presentationSkills ?? 0,
      },
      { label: "Selling Skills", value: appraisal.sellingSkills ?? 0 },
      { label: "Reporting", value: appraisal.reporting ?? 0 },
      // Job Knowledge Skills
      {
        label: "Product Information",
        value: appraisal.productInformation ?? 0,
      },
      {
        label: "Competitors Information",
        value: appraisal.competitorsInformation ?? 0,
      },
      // Organizational Skills
      {
        label: "Org. Value & Policy Awareness",
        value: appraisal.organizationalValueAwareness ?? 0,
      },
      {
        label: "Utilization of Resources",
        value: appraisal.properUtilizationOfResources ?? 0,
      },
      // Interpersonal Skills
      {
        label: "Reliability & Credibility",
        value: appraisal.reliabilityAndCredibility ?? 0,
      },
      {
        label: "Independence & Judgment",
        value: appraisal.independenceAndJudgment ?? 0,
      },
      { label: "Team Spirit", value: appraisal.teamSpirit ?? 0 },
      { label: "Personal Drive", value: appraisal.personalDrive ?? 0 },
      {
        label: "Creativity & Initiative",
        value: appraisal.creativityAndInitiative ?? 0,
      },
      { label: "Broad Prospective", value: appraisal.broadProspective ?? 0 },
      {
        label: "Communication Skills",
        value: appraisal.communicationSkills ?? 0,
      },
      {
        label: "Planning & Organizing",
        value: appraisal.planningAndOrganizing ?? 0,
      },
      // General Factors
      { label: "Appearance", value: appraisal.appearance ?? 0 },
      { label: "Attitude", value: appraisal.attitude ?? 0 },
      { label: "Timing", value: appraisal.timing ?? 0 },
    ],
    feedbackComments: appraisal.feedbackComments || undefined,
    managerName: appraisal.manager?.name || "Manager",
  };
}

/**
 * Get all appraisals from the backend
 */
export async function getAppraisals(
  page?: number,
  limit?: number,
): Promise<GetAppraisalsResponse> {
  return apiFetch<GetAppraisalsResponse>(
    `/api/appraisals${buildPaginationQuery({ page, limit })}`,
    {
      method: "GET",
    },
  );
}

/**
 * Create a new appraisal
 */
export async function createAppraisal(
  data: CreateAppraisalDto,
): Promise<AppraisalApiResponse> {
  const response = await apiFetch<CreateAppraisalResponse>("/api/appraisals", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.data;
}

/**
 * Get all appraisal reviews
 */
export async function getAppraisalReviews(
  page?: number,
  limit?: number,
): Promise<{
  success: boolean;
  reviews: Review[];
  totalCount: number;
  stats: {
    avgScore: number;
    excellentCount: number;
    improvingCount: number;
    totalReviews: number;
  };
}> {
  try {
    const response = await getAppraisals(page, limit);
    const appraisals = response.data;
    const reviews = appraisals.map(mapAppraisalToReview);

    // Calculate stats
    const avgScore =
      reviews.length > 0
        ? Math.round(
            reviews.reduce((acc, r) => acc + r.overallCurrent, 0) /
              reviews.length,
          )
        : 0;

    const excellentCount = reviews.filter(
      (r) => r.statusBadge === "Excellent",
    ).length;

    const improvingCount = reviews.filter(
      (r) => r.statusBadge === "Improving",
    ).length;

    return {
      success: true,
      reviews,
      totalCount: response.results ?? reviews.length,
      stats: {
        avgScore,
        excellentCount,
        improvingCount,
        totalReviews: reviews.length,
      },
    };
  } catch (error) {
    console.error("Error fetching appraisal reviews:", error);
    throw error;
  }
}

/**
 * Server action to get appraisal reviews
 */
export async function getAppraisalReviewsAction(page?: number, limit?: number) {
  try {
    return await getAppraisalReviews(page, limit);
  } catch (error) {
    const err = error as ApiError;
    return {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        statusCode: err.statusCode,
      },
      reviews: [],
      totalCount: 0,
      stats: {
        avgScore: 0,
        excellentCount: 0,
        improvingCount: 0,
        totalReviews: 0,
      },
    };
  }
}

/**
 * Server action to create a new appraisal
 */
export async function createAppraisalAction(data: CreateAppraisalDto): Promise<{
  success: boolean;
  data?: AppraisalApiResponse;
  error?: {
    message: string;
    code: string;
    statusCode?: number;
  };
}> {
  try {
    const appraisal = await createAppraisal(data);
    return {
      success: true,
      data: appraisal,
    };
  } catch (error) {
    const err = error as ApiError;
    console.error("Failed to create appraisal:", err);

    return {
      success: false,
      error: {
        message: err.message || "Failed to create appraisal",
        code: err.code || "CREATE_ERROR",
        statusCode: err.statusCode,
      },
    };
  }
}
