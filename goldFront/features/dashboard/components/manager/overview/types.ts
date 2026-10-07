export type OverviewQuery = {
  from: string;
  to: string;
  repId: string;
  district: string;
  regionId: string;
  territoryId: string;
};
export type SectionError = {
  source: string;
  code: string;
  message: string;
  requestId: string;
};
export type OverviewSection<T> =
  | { status: "ready"; data: T; error: null }
  | { status: "error"; data: null; error: SectionError };
export type VisitRecord = {
  id: string;
  date: string;
  time: string | null;
  status: string;
  doctorId: string;
  doctor: string;
  territory: string | null;
  repId: string;
  rep: string;
};
export type VisitOverview = {
  total: number;
  completed: number;
  scheduled: number;
  cancelled: number;
  completionRate: number | null;
  statuses: { status: string; count: number }[];
  byRep: { id: string; status: string; count: number }[];
  trend: { date: string; total: number; completed: number }[];
  coveredDoctors: number;
  overdue: number;
  upcomingCount: number;
  upcoming: VisitRecord[];
  recent: VisitRecord[];
  byTerritory: {
    id: string | null;
    name: string | null;
    total: number;
    completed: number;
  }[];
};
export type SalesOverview = {
  total: number;
  quantity: number;
  records: number;
  currency: string;
  trend: { date: string; amount: number }[];
  products: { id: string; name: string; amount: number; quantity: number }[];
  recent: {
    id: string;
    customer: string;
    date: string;
    product: string;
    amount: number;
    quantity: number;
  }[];
  scope: string;
  representativeFilterApplied: boolean;
  unmatchedRecords: number;
  ambiguousAccounts: number;
};
export type DirectoryOverview = {
  doctors: number;
  activeDoctors: number;
  pharmacies: number;
  facilities: number;
  missingEmail: number;
  missingPhone: number;
  missingCity: number;
  specialties: { name: string; count: number }[];
  coverage: {
    id: string;
    name: string;
    region: string;
    district: string;
    reps: { id: string; name: string }[];
  }[];
  unassignedTerritories: number;
  scope: string;
};
export type TeamMember = {
  inCurrentScope: boolean;
  id: string;
  name: string;
  role: "MEDICAL_REP" | "SUPERVISOR";
  active: boolean | null;
  supervisor: string | null;
  territories: string[];
  territoryIds: string[];
  lastLogin: string | null;
  leaveDays: number | null;
};
export type TeamOverview = {
  members: TeamMember[];
  performanceMembers: TeamMember[];
  total: number;
  active: number;
  reps: number;
  supervisors: number;
  missingTerritory: number;
  recentLogins: number;
  leaveDays: number | null;
};
export type CoachingOverview = {
  total: number;
  scored: number;
  average: number | null;
  accepted: number;
  followUps: number;
  lowRatings: number;
  excluded: number;
  distribution: { rating: number; count: number }[];
  byRep: { id: string; average: number | null; count: number }[];
  recent: { id: string; date: string; employee: string; rating: number }[];
};
export type AppraisalOverview = {
  total: number;
  scored: number;
  average: number | null;
  excluded: number;
  distribution: { label: string; count: number }[];
  recent: {
    id: string;
    date: string;
    employee: string;
    acknowledged: boolean;
  }[];
};
export type WorkflowRecord = {
  id: string;
  title: string;
  status: string;
  type?: string;
  date: string;
  employee: string;
};
export type WorkflowOverview = {
  requests: { status: string; count: number }[];
  plans: { status: string; count: number }[];
  pendingRequests: number;
  pendingPlans: number;
  target: number;
  completed: number;
  achievement: number | null;
  byRep: { id: string; target: number; completed: number }[];
  recentRequests: WorkflowRecord[];
  recentPlans: WorkflowRecord[];
};
export type OverviewOptions = {
  districts: string[];
  regions: {
    id: string;
    name: string;
    district: string;
    territories: { id: string; name: string }[];
  }[];
  reps: { id: string; name: string; territoryId: string | null }[];
};
export type ManagerOverview = {
  generatedAt: string;
  requestId: string;
  range: {
    from: string;
    to: string;
    bucket: "day" | "month";
    timeZone: string;
  };
  filters: Omit<OverviewQuery, "from" | "to">;
  options: OverviewOptions;
  sections: {
    visits: OverviewSection<VisitOverview>;
    sales: OverviewSection<SalesOverview>;
    directory: OverviewSection<DirectoryOverview>;
    team: OverviewSection<TeamOverview>;
    coaching: OverviewSection<CoachingOverview>;
    appraisals: OverviewSection<AppraisalOverview>;
    workflow: OverviewSection<WorkflowOverview>;
  };
};
export type OverviewResult =
  | { success: true; data: ManagerOverview }
  | {
      success: false;
      error: { message: string; code: string; statusCode?: number };
    };
