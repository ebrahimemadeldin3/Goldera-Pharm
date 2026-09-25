"use server";

import { ApiError } from "@/services/api-error";
import { apiFetch } from "@/services/http";
import { buildPaginationQuery } from "@/lib/utils";
import { mapAppraisalToReview } from "../lib/utils";
import type {
  Review,
  AppraisalApiResponse,
  GetAppraisalsResponse,
  CreateAppraisalDto,
  CreateAppraisalResponse,
} from "../lib/types";

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
  success: true;
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
export async function getAppraisalReviewsAction(
  page?: number,
  limit?: number,
): Promise<
  | {
      success: true;
      reviews: Review[];
      totalCount: number;
      stats: {
        avgScore: number;
        excellentCount: number;
        improvingCount: number;
        totalReviews: number;
      };
    }
  | {
      success: false;
      error: {
        message: string;
        code: string;
        statusCode?: number;
      };
      reviews: never[];
      totalCount: number;
      stats: {
        avgScore: number;
        excellentCount: number;
        improvingCount: number;
        totalReviews: number;
      };
    }
> {
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
