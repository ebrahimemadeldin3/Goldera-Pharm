type RecentReport = {
  id: string;
  title: string;
  type: string;
  meta: string;
  generatedAt: string;
};
type ReportFormValues = {
  reportType: string;
  fromDate?: Date | null;
  toDate?: Date | null;
  employee?: string;
  doctor?: string;
  region?: string;
  include: {
    visits: boolean;
    sales: boolean;
    expenses: boolean;
    performance: boolean;
  };
};

type Template = {
  id: string;
  label: string;
  description?: string;
};

export type { ReportFormValues, RecentReport, Template };
