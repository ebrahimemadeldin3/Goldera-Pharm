import { Package, Link, Users, Clock4 } from "lucide-react";
import type { StatCardConfig } from "@/core/ui/stat-card-types";

export const forecastStatsConfig: StatCardConfig[] = [
  {
    id: "total-products",
    label: "Total Products",
    dataKey: "totalProducts",
    icon: Package,
    bgColor: "bg-[#E9F8F1] text-[#168557] border border-[#CBEFDD]",
  },
  {
    id: "total-allocation",
    label: "Total Allocation",
    dataKey: "totalAllocation",
    icon: Link,
    bgColor: "bg-[#E9F8F1] text-[#168557] border border-[#CBEFDD]",
  },
  {
    id: "my-doctors",
    label: "My Doctors",
    dataKey: "myDoctors",
    icon: Users,
    bgColor: "bg-[#F6F8FB] text-[#344054] border border-[#E5E8EF]",
  },
  {
    id: "pending-approval",
    label: "Pending Approval",
    dataKey: "pendingApproval",
    icon: Clock4,
    bgColor: "bg-[#FFF8E5] text-[#B18732] border border-[#E9DDB8]",
  },
];
