// Joint Visit Review Types for Supervisor
export type JointVisitReview = {
  id: string;
  repName: string;
  repInitials: string;
  doctorName: string;
  date: string;
  duration: string;
  location: string;
  specialty: string;
  status: "Excellent" | "Needs Improvement";
  performanceRating: number;
  whatWentWell: string[];
  areasForImprovement: string[];
  recommendations: string;
  actionItems: string[];
  overallNotes: string;
};

export type CoachingReport = {
  id: string;
  rep: { name: string; initials: string };
  supervisor: string;
  doctor: string;
  hospital: string;
  date: string; // ISO string or display
  visitType: "Joint Visit" | "Solo Visit";
  status: "Completed" | "Pending Feedback";
  rating: number; // 0-5
  strengths: string[];
  improvements: string[];
  actionPlan: string;
  supervisorComments: string;
  repResponse: string;
};

// Stats Data Types
export type ManagerCoachingStatsData = {
  totalReports: number;
  awaitingRepFeedback: number;
  averageRating: number;
  thisMonth: number;
};

export type SupervisorCoachingStatsData = {
  totalReviews: number;
  thisMonth: number;
  avgPerformance: string;
  actionItems: number;
};

export type RepCoachingStatsData = {
  totalReports: number;
  pendingComments: number;
  averageRating: number;
  thisMonth: number;
};
