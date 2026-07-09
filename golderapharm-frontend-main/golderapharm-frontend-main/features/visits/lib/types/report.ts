export type VisitReportData = {
  id: string;
  doctor: {
    id: string;
    name: string;
  };
  visitTime: string;
  location: string;
  status?: string;
};

export type VisitReport = {
  id: string;
  visitId: string;
  userId: string;
  duration: string;
  rating: string;
  discussedTopics: string[];
  doctorFeedback?: string | null;
  visitPurpose: string;
  notes?: string | null;
  samplesProvided: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateVisitReportDto = {
  visitId: string;
  duration: string;
  rating: string;
  discussedTopics: string[];
  doctorFeedback?: string;
  visitPurpose: string;
  notes?: string;
  samplesProvided: string[];
};

export type CreateVisitReportResponse = {
  id?: string;
  message?: string;
} | null;

export type GetVisitReportsResponse =
  | VisitReport[]
  | { data: VisitReport[] }
  | null;
