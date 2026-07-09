import { RequestApiResponse, TRequest } from "../types";

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-light-warning text-dashboard-orange border-gold-stroke";
    case "approved":
      return "bg-light-green text-dashboard-green border-green-stroke";
    case "rejected":
      return "bg-light-red text-dashboard-red border-red-stroke";
    default:
      return "";
  }
};

export function capitalizeFirstLetter<T extends string>(value: T): T {
  if (!value) return value;
  return (value.charAt(0).toUpperCase() + value.slice(1)) as T;
}

/**
 * Transform API response to frontend TRequest format
 */
export function mapRequestApiResponseToTRequest(
  apiResponse: RequestApiResponse,
): TRequest {
  const doctors =
    apiResponse.doctors && apiResponse.doctors.length > 0
      ? apiResponse.doctors
      : (apiResponse.doctorIds ?? []).map((id) => ({
          id,
          nameAR: null,
          nameEN: null,
        }));

  const totalExpenseData =
    apiResponse.totalExpenseData ??
    apiResponse.personalExpenseItems?.map((item) => ({
      name: "",
      amount: Number(item.amount),
    })) ??
    [];

  const sampleData =
    apiResponse.sampleData ??
    apiResponse.productIds?.map((id) => ({
      productId: id,
      productName: "",
      amount: 0,
    })) ??
    [];

  return {
    id: apiResponse.id,
    userId: apiResponse.userId ?? apiResponse.user.id,
    title: apiResponse.title,
    type: apiResponse.type,
    urgency: apiResponse.urgency,
    subject: apiResponse.subject,
    amount: "", // Not provided by API
    status: apiResponse.status,
    rep: {
      name: apiResponse.user.name,
      id: apiResponse.user.id,
    },
    supervisor: {
      name: "", // Not provided by API
      id: undefined,
    },
    submittedDate: apiResponse.createdAt,
    updatedAt: apiResponse.updatedAt,
    reviewedDate: apiResponse.responseDate || "",
    handledAt: apiResponse.handledAt,
    description: apiResponse.description,
    response: apiResponse.response,
    supervisorDecision: apiResponse.response
      ? {
          decision: apiResponse.status,
          comment: apiResponse.response || "",
        }
      : undefined,
    // LEAVE-specific fields
    leaveType: apiResponse.leaveType,
    leaveStartDate: apiResponse.leaveStartDate,
    leaveEndDate: apiResponse.leaveEndDate,
    leaveDaysCount: apiResponse.leaveDaysCount,
    // EXPENSE / MARKETING fields
    doctorIds: apiResponse.doctorIds,
    doctorName: apiResponse.doctorName,
    budget: apiResponse.budget,
    // PERSONAL_EXPENSE fields
    visitedCity: apiResponse.visitedCity ?? apiResponse.visitCity,
    visitDaysCount: apiResponse.visitDaysCount,
    totalExpenseAmount: apiResponse.totalExpenseAmount,
    totalExpenseData: totalExpenseData.map((item) => ({
      name: item.name,
      amount: Number(item.amount),
    })),
    // SAMPLE fields
    sampleData: sampleData.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      amount: Number(item.amount),
    })),
    productIds: apiResponse.productIds,
    productsId: apiResponse.productsId,
    doctors,
    pdfs: apiResponse.pdfs ?? [],
  };
}
