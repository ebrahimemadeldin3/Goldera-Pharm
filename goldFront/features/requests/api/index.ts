"use server";

import { apiFetch } from "@/services/http";
import type { PaginatedApiResponse } from "@/lib/types";
import { ApiError } from "@/services/api-error";
import { cookies } from "next/headers";
import {
  CreateRequestDto,
  UpdateRequestDto,
  RequestApiResponse,
  TRequest,
} from "../lib/types";
import { mapRequestApiResponseToTRequest } from "../lib/utils";
import {
  appendCreateRequestFields,
  appendRequestFiles,
  buildCreateRequestPayload,
} from "./request-type-payload";
import { buildPaginationQuery } from "@/lib/utils";

/**
 * Create a new request using multipart/form-data
 */
export async function createRequest(data: CreateRequestDto): Promise<void> {
  const payload = buildCreateRequestPayload(data);
  const fd = new FormData();

  appendCreateRequestFields(fd, payload);

  await createRequestMultipart(fd);
}

/**
 * Create a new request with file attachments via multipart/form-data
 */
async function createRequestMultipart(formData: FormData): Promise<void> {
  const token = (await cookies()).get("token")?.value;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/requests`,
    {
      method: "POST",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    },
  );
  if (!res.ok) {
    let error: ApiError;
    try {
      error = await res.json();
    } catch {
      error = {
        statusCode: res.status,
        code: "UNKNOWN_ERROR",
        message: "Something went wrong",
      };
    }
    throw error;
  }
}

async function createRequestJson(data: CreateRequestDto): Promise<void> {
  await apiFetch<void>("/api/requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

function appendRequestBaseFields(fd: FormData, payload: CreateRequestDto) {
  fd.append("title", payload.title);
  fd.append("subject", payload.subject);
  fd.append("description", payload.description);
  fd.append("type", payload.type);
  fd.append("urgency", payload.urgency);
}

type PersonalExpenseVariant =
  | "totalExpenseDataJson"
  | "personalExpenseItemsJson"
  | "indexedOnly";

function buildPersonalExpenseFallbackFormData(
  payload: CreateRequestDto,
  files:
    | {
        invoice?: File;
        medicalReport?: File;
        personalExpenseInvoices?: (File | null)[];
      }
    | undefined,
  variant: PersonalExpenseVariant,
) {
  const fd = new FormData();
  const totalExpenseData = payload.totalExpenseData ?? [];
  const personalExpenseItems = totalExpenseData.map((item) => ({
    amount: Number(item.amount),
  }));

  appendRequestBaseFields(fd, payload);

  if (payload.visitedCity) {
    fd.append("visitedCity", payload.visitedCity);
    fd.append("visitCity", payload.visitedCity);
  }
  if (payload.visitDaysCount != null) {
    fd.append("visitDaysCount", String(payload.visitDaysCount));
  }
  if (payload.totalExpenseAmount != null) {
    fd.append("totalExpenseAmount", String(payload.totalExpenseAmount));
  }

  if (variant === "totalExpenseDataJson") {
    fd.append("totalExpenseData", JSON.stringify(totalExpenseData));
  }

  if (variant === "personalExpenseItemsJson") {
    fd.append("personalExpenseItems", JSON.stringify(personalExpenseItems));
  }

  if (variant === "indexedOnly") {
    totalExpenseData.forEach((item, index) => {
      fd.append(`totalExpenseData[${index}][name]`, item.name);
      fd.append(`totalExpenseData[${index}][amount]`, String(item.amount));
      fd.append(`personalExpenseItems[${index}][amount]`, String(item.amount));
    });
  }

  appendRequestFiles(fd, files);
  return fd;
}

/**
 * Fetch all requests for current user
 */
export async function fetchMyRequests(
  page?: number,
  limit?: number,
): Promise<PaginatedApiResponse<RequestApiResponse[]>> {
  return apiFetch<PaginatedApiResponse<RequestApiResponse[]>>(
    `/api/requests${buildPaginationQuery({ page, limit })}`,
    {
      method: "GET",
    },
  );
}

/**
 * Fetch all requests for reps under supervisor
 */
export async function fetchSupervisorTeamRequests(
  page?: number,
  limit?: number,
): Promise<PaginatedApiResponse<RequestApiResponse[]>> {
  return apiFetch<PaginatedApiResponse<RequestApiResponse[]>>(
    `/api/supervisors/team/requests${buildPaginationQuery({ page, limit })}`,
    {
      method: "GET",
    },
  );
}

/**
 * Fetch all requests for reps under manager
 */
export async function fetchManagerTeamRequests(
  page?: number,
  limit?: number,
): Promise<PaginatedApiResponse<RequestApiResponse[]>> {
  return apiFetch<PaginatedApiResponse<RequestApiResponse[]>>(
    `/api/managers/team/requests${buildPaginationQuery({ page, limit })}`,
    {
      method: "GET",
    },
  );
}

/**
 * Update request status by ID (Manager/Supervisor only)
 */
export async function updateRequest(
  id: string,
  data: UpdateRequestDto,
): Promise<void> {
  return apiFetch<void>(`/api/requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Server Actions with error handling

/**
 * Server action to create a request.
 * Accepts a plain-object payload plus optional File attachments.
 * Requests are always sent as multipart/form-data for consistent backend parsing.
 */
export async function createRequestAction(
  data: CreateRequestDto,
  files?: {
    invoice?: File;
    medicalReport?: File;
    personalExpenseInvoices?: (File | null)[];
  },
) {
  try {
    const payload = buildCreateRequestPayload(data);
    const fd = new FormData();

    appendCreateRequestFields(fd, payload);
    appendRequestFiles(fd, files);

    try {
      await createRequestMultipart(fd);
    } catch (error) {
      const err = error as ApiError;

      const shouldRetrySampleAsJson =
        payload.type === "SAMPLE" &&
        !files?.invoice &&
        !files?.medicalReport &&
        (!files?.personalExpenseInvoices ||
          files.personalExpenseInvoices.every((f) => !f)) &&
        (err.message ?? "")
          .toLowerCase()
          .includes("at least one product is required");

      if (!shouldRetrySampleAsJson) {
        const shouldRetryPersonalExpenseMultipart =
          payload.type === "PERSONAL_EXPENSE" &&
          (err.message ?? "")
            .toLowerCase()
            .includes("total expense data is required");

        if (!shouldRetryPersonalExpenseMultipart) {
          throw error;
        }

        const variants: PersonalExpenseVariant[] = [
          "totalExpenseDataJson",
          "personalExpenseItemsJson",
          "indexedOnly",
        ];

        let lastError: unknown = error;
        for (const variant of variants) {
          try {
            const retryFd = buildPersonalExpenseFallbackFormData(
              payload,
              files,
              variant,
            );
            await createRequestMultipart(retryFd);
            return { success: true };
          } catch (retryError) {
            lastError = retryError;
          }
        }

        throw lastError;
      }

      await createRequestJson(payload);
    }

    return { success: true };
  } catch (error) {
    console.error("Request creation error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "CREATE_ERROR",
        message: err.message || "Failed to create request",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Server action to get user's requests
 */
export async function getMyRequestsAction(page?: number, limit?: number) {
  try {
    const requests = await fetchMyRequests(page, limit);
    if (!requests.data || requests.results === 0) {
      return {
        success: true,
        data: [] as TRequest[],
        totalCount: requests.results ?? 0,
      };
    }
    // Transform API response to frontend format
    console.log("requests.data", requests.data);
    const transformedData: TRequest[] = requests.data.map((request) => ({
      ...mapRequestApiResponseToTRequest(request),
      belongToWho: "me" as const,
    }));
    return {
      success: true,
      data: transformedData,
      totalCount: requests.results ?? transformedData.length,
    };
  } catch (error) {
    console.error("Requests fetch error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "FETCH_ERROR",
        message: err.message || "Failed to fetch requests",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Server action to update request status
 */
export async function updateRequestAction(id: string, data: UpdateRequestDto) {
  try {
    await updateRequest(id, data);
    return {
      success: true,
    };
  } catch (error) {
    console.error("Request update error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "UPDATE_ERROR",
        message: err.message || "Failed to update request",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Server action to get supervisor's team requests
 */
export async function getSupervisorTeamRequestsAction(
  page?: number,
  limit?: number,
) {
  try {
    const requests = await fetchSupervisorTeamRequests(page, limit);

    if (!requests.data || requests.results === 0) {
      return {
        success: true,
        data: [] as TRequest[],
        totalCount: requests.results ?? 0,
      };
    }
    // Transform API response to frontend format and assign belongsTo as "rep"
    const transformedData: TRequest[] = requests.data.map((request) => ({
      ...mapRequestApiResponseToTRequest(request),
      belongToWho: "rep" as const,
    }));

    return {
      success: true,
      data: transformedData,
      totalCount: requests.results ?? transformedData.length,
    };
  } catch (error) {
    console.error("Supervisor team requests fetch error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "FETCH_ERROR",
        message: err.message || "Failed to fetch team requests",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Server action to get manager's team requests
 */
export async function getManagerTeamRequestsAction(
  page?: number,
  limit?: number,
) {
  try {
    const requests = await fetchManagerTeamRequests(page, limit);

    if (!requests || requests.data.length === 0 || requests.results === 0) {
      return {
        success: true,
        data: [] as TRequest[],
        totalCount: requests.results ?? 0,
      };
    }
    // Transform API response to frontend format and assign belongsTo as "rep"
    const transformedData: TRequest[] = requests.data.map((request) => ({
      ...mapRequestApiResponseToTRequest(request),
    }));

    return {
      success: true,
      data: transformedData,
      totalCount: requests.results ?? transformedData.length,
    };
  } catch (error) {
    console.error("Manager team requests fetch error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "FETCH_ERROR",
        message: err.message || "Failed to fetch team requests",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Server action to approve a request (Manager/Supervisor)
 */
export async function approveRequestAction(id: string, response?: string) {
  try {
    await updateRequest(id, {
      status: "APPROVED" as UpdateRequestDto["status"],
      response,
    });
    return {
      success: true,
    };
  } catch (error) {
    console.error("Request approval error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "APPROVE_ERROR",
        message: err.message || "Failed to approve request",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Server action to reject a request (Manager/Supervisor)
 */
export async function rejectRequestAction(id: string, response?: string) {
  try {
    await updateRequest(id, {
      status: "REJECTED" as UpdateRequestDto["status"],
      response,
    });
    return {
      success: true,
    };
  } catch (error) {
    console.error("Request rejection error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code || "REJECT_ERROR",
        message: err.message || "Failed to reject request",
        statusCode: err.statusCode || 500,
      },
    };
  }
}
