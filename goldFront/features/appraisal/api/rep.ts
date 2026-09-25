"use server";

import { ApiError } from "@/services/api-error";
import { apiFetch } from "@/services/http";
import { buildPaginationQuery } from "@/lib/utils";
import type { Review } from "../lib/types";
import type {
  AcknowledgeAppraisalDto,
  AcknowledgeAppraisalResponse,
  AppraisalApiResponse,
  GetAppraisalsResponse,
} from "../lib/types";
import { mapAppraisalToReview } from "../lib/utils";

type RepAppraisalStats = {
  totalAppraisals: number;
  latestScore: number | null;
  pendingAcknowledgement: number;
  acknowledged: number;
};

type RepAppraisalsActionResult =
  | {
      success: true;
      reviews: Review[];
      totalCount: number;
      stats: RepAppraisalStats;
      backendIntegrationPending?: boolean;
    }
  | {
      success: false;
      error: {
        message: string;
        code: string;
        statusCode?: number;
      };
    };

export async function getRepAppraisals(
  page?: number,
  limit?: number,
): Promise<GetAppraisalsResponse> {
  return apiFetch<GetAppraisalsResponse>(
    `/api/appraisals/rep${buildPaginationQuery({ page, limit })}`,
    {
      method: "GET",
    },
  );
}

export async function acknowledgeAppraisal(
  appraisalId: string,
  data: AcknowledgeAppraisalDto,
): Promise<AppraisalApiResponse> {
  const response = await apiFetch<AcknowledgeAppraisalResponse>(
    `/api/appraisals/${appraisalId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );

  return response.data;
}

function calculateRepAppraisalStats(
  reviews: Review[],
  totalCount: number,
): RepAppraisalStats {
  const latestScore = reviews[0]?.overallCurrent ?? null;
  const pendingAcknowledgement = reviews.filter(
    (review) => !review.acknowledged,
  ).length;

  return {
    totalAppraisals: totalCount,
    latestScore,
    pendingAcknowledgement,
    acknowledged: reviews.filter((review) => review.acknowledged).length,
  };
}

function logRepAppraisalApiError(label: string, error: unknown) {
  const err = error as Partial<ApiError>;

  console.error(label, {
    statusCode: err.statusCode,
    code: err.code,
    message: err.message,
  });
}

export async function getRepAppraisalReviewsAction(
  page?: number,
  limit?: number,
): Promise<RepAppraisalsActionResult> {
  try {
    const response = await getRepAppraisals(page, limit);
    const reviews = response.data.map(mapAppraisalToReview);
    const totalCount = response.results ?? reviews.length;

    return {
      success: true,
      reviews,
      totalCount,
      stats: calculateRepAppraisalStats(reviews, totalCount),
    };
  } catch (error) {
    logRepAppraisalApiError("Get rep appraisal reviews error:", error);
    const err = error as ApiError;

    if (err.statusCode === 404) {
      return {
        success: true,
        reviews: [],
        totalCount: 0,
        stats: calculateRepAppraisalStats([], 0),
        backendIntegrationPending: true,
      };
    }

    return {
      success: false,
      error: {
        code: err.code || "FETCH_REP_APPRAISALS_ERROR",
        message: err.message || "Failed to fetch performance appraisals",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

export async function acknowledgeAppraisalAction(
  appraisalId: string,
  comment: string,
) {
  try {
    const appraisal = await acknowledgeAppraisal(appraisalId, {
      comment: comment.trim() || undefined,
      accept: true,
    });

    return {
      success: true,
      review: mapAppraisalToReview(appraisal),
    };
  } catch (error) {
    logRepAppraisalApiError("Acknowledge appraisal error:", error);
    const err = error as ApiError;

    return {
      success: false,
      backendIntegrationPending: err.statusCode === 404,
      error: {
        code: err.code || "ACKNOWLEDGE_APPRAISAL_ERROR",
        message: err.message || "Failed to acknowledge appraisal",
        statusCode: err.statusCode || 500,
      },
    };
  }
}
