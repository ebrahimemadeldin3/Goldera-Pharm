import { RecentReport, Template } from "../types";

const REPORT_TYPES = [
  "Daily Visits Summary",
  "Weekly Visits Summary",
  "Monthly Sales & Visits",
  "Performance Overview",
  "Custom Mixed Metrics",
];

const EMPLOYEES = [
  "All",
  "Noura Al-Ahmed",
  "Fahad Al-Saeed",
  "Sara Al-Harbi",
  "Omar Al-Harbi",
];

const RECENT_REPORTS: RecentReport[] = [
  {
    id: "r1",
    title: "Ahmed's visits on Oct 18 to Dr. Mohamed",
    type: "Visit Report",
    meta: "Rep: Ahmed | Doctor: Mohamed | Date: Oct 18, 2025",
    generatedAt: "Generated 10/9/2025",
  },
  {
    id: "r2",
    title: "Ahmed's visits on Oct 18 to Dr. Mohamed",
    type: "Visit Report",
    meta: "Rep: Ahmed | Doctor: Mohamed | Date: Oct 18, 2025",
    generatedAt: "Generated 10/9/2025",
  },
];

const TEMPLATES: Template[] = [
  { id: "daily", label: "Daily Visits Summary" },
  { id: "weekly_perf", label: "Weekly Performance" },
  { id: "monthly_sales", label: "Monthly Sales Report" },
  { id: "expense", label: "Expense Overview" },
];

export { REPORT_TYPES, EMPLOYEES, RECENT_REPORTS, TEMPLATES };
