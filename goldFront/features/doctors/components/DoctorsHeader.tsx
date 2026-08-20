"use client";

import { Stethoscope, MapPin } from "lucide-react";
import { StatCards } from "@/core/ui/StatCards";
import Link from "next/link";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { DoctorApiResponse } from "../lib/types/api";
import { useMemo } from "react";
import type { StatCardConfig } from "@/core/ui/stat-card-types";

export default function DoctorsHeader({
  doctors = [],
  totalCount,
}: {
  doctors: DoctorApiResponse[];
  totalCount?: number;
}) {
  const { features, role } = useRoleUI();

  // Determine add doctor link based on role
  const getAddDoctorLink = () => {
    if (role === "MANAGER") return "/manager/doctors/add";
    if (role === "SUPERVISOR") return "/supervisor/doctors/add";
    return "/rep/doctors/add";
  };

  // Calculate dynamic stats and generate stat configs
  const { statsConfig, data } = useMemo(() => {
    const totalDoctors = totalCount ?? doctors.length;

    // Count doctors by subRegion
    const regionCounts: Record<string, number> = {};
    doctors.forEach((doctor) => {
      const region = doctor.subRegion || "Unknown";
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });

    // Get top 3 regions by doctor count
    const topRegions = Object.entries(regionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    // Build dynamic stat configs
    const statsConfig: StatCardConfig[] = [
      {
        id: "total-doctors",
        label: "Total Doctors",
        dataKey: "totalDoctors",
        icon: Stethoscope,
        bgColor: "bg-dashboard-blue",
      },
    ];

    // Add top 3 regions to stats config
    const statsData: Record<string, number> = { totalDoctors };
    topRegions.forEach(([regionName, count], index) => {
      const dataKey = `region${index}`;
      statsConfig.push({
        id: `region-${index}`,
        label: regionName,
        dataKey,
        icon: MapPin,
        bgColor: index === 2 ? "bg-gold" : "bg-dashboard-blue",
      });
      statsData[dataKey] = count;
    });

    return { statsConfig, data: statsData };
  }, [doctors, totalCount]);

  return (
    <>
      <header className="flex flex-wrap items-center justify-start gap-6">
        <div>
          <h1 className="font-nomral text-2xl text-black md:text-[34px]">
            Doctors Database
          </h1>
          <p className="text-secondary-dark text-[16px]">
            Manage doctor contacts, locations, and visit history across all
            regions
          </p>
        </div>
        {features.doctors.canAdd && (
          <Link
            href={getAddDoctorLink()}
            type="button"
            className="bg-system-primary hover:text-system-primary hover:border-system-primary ml-auto inline-flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-transparent"
          >
            <Stethoscope className="h-4 w-4" />
            Add Doctor
          </Link>
        )}
      </header>

      <StatCards stats={statsConfig} data={data} />
    </>
  );
}
