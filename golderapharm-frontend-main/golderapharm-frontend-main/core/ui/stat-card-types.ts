import type { LucideIcon } from "lucide-react";

export type StatCardConfig = {
  id: string;
  label: string;
  dataKey: string;
  icon: LucideIcon;
  bgColor: string;
};

export type StatCardData = Record<string, string | number>;
