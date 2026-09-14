import type { LucideIcon } from "lucide-react";

export type StatTone = "navy" | "gold" | "amber" | "green";

export type StatCardConfig = {
  id: string;
  label: string;
  helper?: string;
  dataKey: string;
  icon: LucideIcon;
  bgColor: string;
  tone?: StatTone;
};

export type StatCardData = Record<string, string | number>;
