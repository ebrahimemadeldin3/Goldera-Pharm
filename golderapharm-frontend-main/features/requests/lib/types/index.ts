import { RequestType, RequestStatus, RequestUrgency } from "@/lib/types";

export type TbelongToWho = "me" | "rep";

export type TRequest = {
  id: string;
  userId?: string;
  title: string;
  type: RequestType;
  amount: string;
  status: RequestStatus;
  urgency: RequestUrgency;
  subject: string;
  rep: {
    name: string;
    id: string;
  };
  supervisor: {
    name: string;
    id?: string;
  };
  submittedDate: string;
  updatedAt?: string;
  reviewedDate: string;
  handledAt: string | null;
  description: string;
  response: string | null;
  belongToWho?: TbelongToWho;
  supervisorDecision?: {
    decision: RequestStatus;
    comment: string;
  };
  // LEAVE-specific fields
  leaveType?: string | null;
  leaveStartDate?: string | null;
  leaveEndDate?: string | null;
  leaveDaysCount?: number | null;
  // EXPENSE / MARKETING fields
  doctorIds?: string[] | null;
  doctorName?: string | null;
  budget?: number | null;
  // PERSONAL_EXPENSE fields
  visitedCity?: string | null;
  visitDaysCount?: number | null;
  totalExpenseAmount?: number | null;
  totalExpenseData?: { name: string; amount: number }[] | null;
  // SAMPLE fields
  sampleData?:
    | {
        productId: string;
        productName: string;
        amount: number;
      }[]
    | null;
  productIds?: string[] | null;
  productsId?: string[] | null;
  doctors?: {
    id: string;
    nameAR?: string | null;
    nameEN?: string | null;
  }[];
  pdfs?: {
    url: string;
    name: string;
    public_id: string;
  }[];
};

// API DTOs
export type CreateRequestDto = {
  title: string;
  subject: string;
  description: string;
  type: RequestType;
  urgency: RequestUrgency;
  // LEAVE-specific fields
  leaveType?: string;
  leaveStartDate?: string;
  leaveEndDate?: string;
  // EXPENSE / MARKETING fields
  doctorIds?: string[];
  budget?: number;
  // PERSONAL_EXPENSE fields
  visitedCity?: string;
  visitDaysCount?: number;
  totalExpenseAmount?: number;
  totalExpenseData?: { name: string; amount: number }[];
  // SAMPLE fields
  sampleData?: {
    productId: string;
    productName: string;
    amount: number;
  }[];
  productIds?: string[];
};

export type UpdateRequestDto = {
  status: RequestStatus;
  response?: string;
};

export type RequestApiResponse = {
  id: string;
  title: string;
  userId?: string;
  subject: string;
  description: string;
  type: RequestType;
  urgency: RequestUrgency;
  status: RequestStatus;
  response: string | null;
  responseDate: string | null;
  handledAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  };
  // LEAVE-specific fields
  leaveType?: string | null;
  leaveStartDate?: string | null;
  leaveEndDate?: string | null;
  leaveDaysCount?: number | null;
  // EXPENSE / MARKETING fields
  doctorIds?: string[] | null;
  doctorName?: string | null;
  budget?: number | null;
  // PERSONAL_EXPENSE fields
  visitedCity?: string | null;
  visitDaysCount?: number | null;
  totalExpenseAmount?: number | null;
  totalExpenseData?: { name: string; amount: number }[] | null;
  // SAMPLE fields
  sampleData?:
    | {
        productId: string;
        productName: string;
        amount: number;
      }[]
    | null;
  productIds?: string[] | null;
  productsId?: string[] | null;
  doctors?: {
    id: string;
    nameAR?: string | null;
    nameEN?: string | null;
  }[];
  pdfs?: {
    url: string;
    name: string;
    public_id: string;
  }[];
  // Legacy aliases
  visitCity?: string | null;
  personalExpenseItems?: { amount: number }[] | null;
};
