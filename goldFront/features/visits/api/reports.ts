"use server";

import { apiFetch } from "@/services/http";
import { ApiError } from "@/services/api-error";
import { cookies } from "next/headers";
import {
  CreateVisitReportDto,
  CreateVisitReportResponse,
  GetVisitReportsResponse,
  VisitReportData,
} from "../lib/types/report";
import { VisitReportFormValues } from "../lib/schemas/report";
import { FetchVisitsResponse } from "../lib/types/api";

async function visitReportsRequest<T>(
  endpoint: string,
  options: RequestInit,
): Promise<T> {
  const token = (await cookies()).get("token")?.value;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
    {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    },
  );

  if (!response.ok) {
    let error: ApiError;

    try {
      error = await response.json();
    } catch {
      error = {
        statusCode: response.status,
        code: "UNKNOWN_ERROR",
        message: "Something went wrong",
      };
    }

    throw error;
  }

  const raw = await response.text();
  return (raw ? JSON.parse(raw) : null) as T;
}

function parseListField(value?: string): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(/[\n,]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Create a visit report
 */
export async function createVisitReport(
  data: CreateVisitReportDto,
): Promise<CreateVisitReportResponse> {
  return visitReportsRequest<CreateVisitReportResponse>(
    "/api/visits/visit-reports",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

/**
 * Fetch visit reports list
 */
export async function getVisitReports(): Promise<GetVisitReportsResponse> {
  return visitReportsRequest<GetVisitReportsResponse>(
    "/api/visits/visit-reports",
    {
      method: "GET",
    },
  );
}

/**
 * Server action to create a visit report with error handling
 */
export async function createVisitReportAction(data: VisitReportFormValues) {
  try {
    const dto: CreateVisitReportDto = {
      visitId: data.visitId,
      duration: data.duration,
      rating: data.rating,
      discussedTopics: parseListField(data.discussedTopicsText),
      doctorFeedback: data.doctorFeedback,
      visitPurpose: data.visitPurpose,
      notes: data.notes,
      samplesProvided: data.samplesProvided,
    };

    await createVisitReport(dto);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Visit report creation error:", error);
    const err = error as ApiError;

    return {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        statusCode: err.statusCode,
      },
    };
  }
}

/**
 * Get visit details for report page
 */
export async function getVisitReportData(
  visitId: string,
): Promise<VisitReportData> {
  const visitsResponse = await apiFetch<FetchVisitsResponse>("/api/visits", {
    method: "GET",
  });

  const visit = visitsResponse.data.find((item) => item.id === visitId);

  if (!visit) {
    throw {
      code: "VISIT_NOT_FOUND",
      message: "Visit not found",
      statusCode: 404,
    } as ApiError;
  }

  return {
    id: visitId,
    doctor: {
      id: visit.doctor.id,
      name:
        visit.doctor.nameEN ||
        visit.doctor.nameAR ||
        visit.doctor.name ||
        "Unknown Doctor",
    },
    visitTime: visit.date,
    location: "-",
    status: visit.status,
  };
}
