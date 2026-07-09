import { Target, WeekData } from "@/features/target/lib/types";

export const targetData = {
  target: 50000,
  achieved: 42500,
  remaining: 7500,
  dailyRequired: 750,
  progress: 85,
  month: "October 2025",
  daysRemaining: 10,
  status: "On Track",
};

export const chartData = [
  { day: "Day 1", actual: 0, target: 0 },
  { day: "Day 5", actual: 7000, target: 7000 },
  { day: "Day 10", actual: 15000, target: 16000 },
  { day: "Day 15", actual: 25000, target: 27000 },
  { day: "Day 20", actual: 35000, target: 38000 },
  { day: "Day 25", actual: 42500, target: 46000 },
  { day: "Day 31", actual: 45000, target: 50000 },
];

export const targets: Target[] = [
  {
    id: "1",
    name: "Monthly Sales",
    status: "ontrack",
    deadline: "Oct 31, 2025",
    current: 42500,
    target: 50000,
    unit: "SAR",
    progress: 85,
  },
  {
    id: "3",
    name: "New Doctors",
    status: "behind",
    deadline: "Oct 31, 2025",
    current: 3,
    target: 5,
    unit: "doctors",
    progress: 60,
  },
  {
    id: "5",
    name: "Coverage Rate",
    status: "achieved",
    deadline: "Oct 31, 2025",
    current: 92,
    target: 90,
    unit: "%",
    progress: 102,
  },
];

const COLORS = ["#3b82f6", "#14b8a6", "#10b981", "#f59e0b"];
export const salesChartData = [
  { name: "Product A", value: 18.5, fill: COLORS[0] },
  { name: "Product B", value: 12.0, fill: COLORS[1] },
  { name: "Product C", value: 8.0, fill: COLORS[2] },
  { name: "Product D", value: 4.0, fill: COLORS[3] },
];

export const weeks: WeekData[] = [
  {
    week: 1,
    achieved: 14.2,
    target: 12.5,
    isAchieved: true,
    isCurrent: false,
  },
  {
    week: 2,
    achieved: 11.8,
    target: 12.5,
    isAchieved: false,
    isCurrent: false,
  },
  {
    week: 3,
    achieved: 13.5,
    target: 12.5,
    isAchieved: true,
    isCurrent: false,
  },
  {
    week: 4,
    achieved: 3.0,
    target: 12.5,
    isAchieved: false,
    isCurrent: true,
  },
];
