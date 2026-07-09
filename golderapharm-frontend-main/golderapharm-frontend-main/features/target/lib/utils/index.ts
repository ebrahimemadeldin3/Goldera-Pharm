import { TargetStatus } from "@/lib/types";

export const formatCurrency = (amount: number) => {
  if (amount >= 1000) {
    return `SAR ${(amount / 1000).toFixed(1)}K`;
  }
  return `SAR ${amount}`;
};

export const getStatusBadgeStyle = (status: TargetStatus) => {
  switch (status) {
    case "ontrack":
      return "bg-dashboard-blue text-white";
    case "behind":
      return "bg-dashboard-orange text-white";
    case "achieved":
      return "bg-dashboard-green text-white";
    default:
      return "";
  }
};

export const getProgressBarColor = (status: TargetStatus) => {
  switch (status) {
    case "ontrack":
      return "bg-dashboard-blue";
    case "behind":
      return "bg-dashboard-orange";
    case "achieved":
      return "bg-dashboard-green";
    default:
      return "";
  }
};

export const formatValue = (value: number, unit: string) => {
  if (unit === "SAR") {
    return `${value} SAR`;
  }
  if (unit === "%") {
    return `${value} %`;
  }
  return `${value} ${unit}`;
};
