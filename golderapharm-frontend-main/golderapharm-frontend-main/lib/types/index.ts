//! this file show the most critical types used in the entire appliciation and these types must be aligned with the backend API
//! like the the features structure in the app also this file is structured in a way that each feature has its own types

// App related types
export type UserRole = "MANAGER" | "SUPERVISOR" | "MEDICAL_REP";

// Dashboard related types

// Doctors related types
export type Specialty =
  | "Cardiology"
  | "Pediatrics"
  | "Internal Medicine"
  | "Neurology"
  | "Orthopedics"
  | "Dermatology"
  | "Oncology"
  | "Gastroenterology"
  | "Endocrinology";

// Requests related types
export type RequestType =
  | "EXPENSE"
  | "MARKETING"
  | "SAMPLE"
  | "LEAVE"
  | "PERSONAL_EXPENSE";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type RequestUrgency = "low" | "medium" | "high" | "priority";
/**
 * this is related to features/requests/lib/schemas/index.ts enums data option so keep them aligned
 * */

// Target related types   Reps only
export type TargetStatus = "ontrack" | "behind" | "achieved";

// Plan
export type PlanStatus = "PENDING" | "APPROVED" | "REJECTED";
export type VisitPlanType = "WEEKLY" | "MONTHLY"; // reps

// Visits related types
export type VisitStatus =
  | "COMPLETED"
  | "SCHEDULED"
  | "CANCELLED"
  | "IN_PROGRESS";
export type VisitType = "CHECK" | "COACHING" | "MANAGER";

export type Pagination = {
  currentPage: number;
  limit: number;
  skip: number;
  totalPages: number;
  next: number | null;
  prev: number | null;
};

export type PaginatedApiResponse<T> = {
  status: string;
  message: string;
  results: number;
  pagination: Pagination;
  data: T;
};

// Forecast related types
export type ForecastPeriodType = "MONTHLY" | "QUARTERLY";
export type ForecastStatus = "PENDING" | "APPROVED" | "REJECTED";
