export type CreatePlanFormData = {
  planType: string;
  title: string;
  description: string;
  objectives: string;
  startDate: string;
  endDate: string;
  targetDoctors: number;
  targetVisits: number;
};