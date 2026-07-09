import { Package, Link, Users, Clock4 } from "lucide-react";
import type { StatCardConfig } from "@/core/ui/stat-card-types";

export const forecastStatsConfig: StatCardConfig[] = [
  {
    id: "total-products",
    label: "Total Products",
    dataKey: "totalProducts",
    icon: Package,
    bgColor: "gradient-green",
  },
  {
    id: "total-allocation",
    label: "Total Allocation",
    dataKey: "totalAllocation",
    icon: Link,
    bgColor: "gradient-blue",
  },
  {
    id: "my-doctors",
    label: "My Doctors",
    dataKey: "myDoctors",
    icon: Users,
    bgColor: "gradient-gold",
  },
  {
    id: "pending-approval",
    label: "Pending Approval",
    dataKey: "pendingApproval",
    icon: Clock4,
    bgColor: "gradient-orange",
  },
];
