import { TargetStatus } from "@/lib/types";

export type Target = {
  id: string;
  name: string;
  status: TargetStatus;
  deadline: string;
  current: number;
  target: number;
  unit: string;
  progress: number;
};

export type WeekData = {
  week: number;
  achieved: number;
  target: number;
  isAchieved: boolean;
  isCurrent: boolean;
};
