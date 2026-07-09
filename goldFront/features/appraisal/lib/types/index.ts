export type Review = {
  id: string;
  name: string;
  initials: string;
  role: "Supervisor" | "Medical Rep";
  email: string;
  department?: string;
  location?: string;
  period: string;
  statusBadge?: "Excellent" | "Good" | "Improving";
  lastReview: string;
  overallCurrent: number;
  overallPrevious?: number;
  kpis: { label: string; value: number }[];
  feedbackComments?: string;
  repId: string;
  managerId: string;
  managerName: string;
};

// Export API types
export * from "./api";
