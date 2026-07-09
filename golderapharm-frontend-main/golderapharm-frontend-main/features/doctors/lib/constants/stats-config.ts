import { Stethoscope, MapPin } from "lucide-react";
import type { StatCardConfig } from "@/core/ui/stat-card-types";

export const doctorsStatsConfig: StatCardConfig[] = [
  {
    id: "total-doctors",
    label: "Total Doctors",
    dataKey: "totalDoctors",
    icon: Stethoscope,
    bgColor: "bg-dashboard-blue",
  },
  {
    id: "riyadh",
    label: "Riyadh",
    dataKey: "riyadh",
    icon: MapPin,
    bgColor: "bg-dashboard-blue",
  },
  {
    id: "jeddah",
    label: "Jeddah",
    dataKey: "jeddah",
    icon: MapPin,
    bgColor: "bg-dashboard-blue",
  },
  {
    id: "other-regions",
    label: "Other Regions",
    dataKey: "otherRegions",
    icon: MapPin,
    bgColor: "bg-gold",
  },
];
