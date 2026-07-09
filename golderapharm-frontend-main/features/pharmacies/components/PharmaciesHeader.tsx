"use client";

import { Store, MapPin, Globe } from "lucide-react";
import { StatCards } from "@/core/ui/StatCards";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { PharmacyApiResponse } from "../lib/types";
import { useMemo } from "react";
import type { StatCardConfig } from "@/core/ui/stat-card-types";
import { AddPharmacyDialog } from "./AddPharmacyDialog";

interface PharmaciesHeaderProps {
  pharmacies: PharmacyApiResponse[];
}

export default function PharmaciesHeader({
  pharmacies,
}: PharmaciesHeaderProps) {
  const { role } = useRoleUI();
  const isManager = role === "MANAGER";

  const { statsConfig, data } = useMemo(() => {
    const total = pharmacies.length;

    const regionCounts: Record<string, number> = {};
    pharmacies.forEach((p) => {
      const region = p.region || "Unknown";
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });

    const topRegions = Object.entries(regionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2);

    const statsConfig: StatCardConfig[] = [
      {
        id: "total-pharmacies",
        label: "Total Pharmacies",
        dataKey: "total",
        icon: Store,
        bgColor: "bg-dashboard-blue",
      },
    ];

    const statsData: Record<string, number> = { total };
    topRegions.forEach(([regionName, count], index) => {
      const key = `region${index}`;
      statsConfig.push({
        id: `region-${index}`,
        label: regionName,
        dataKey: key,
        icon: index === 0 ? MapPin : Globe,
        bgColor: index === 0 ? "bg-dashboard-green" : "bg-gold",
      });
      statsData[key] = count;
    });

    return { statsConfig, data: statsData };
  }, [pharmacies]);

  return (
    <>
      <header className="flex items-center justify-start gap-6">
        <div>
          <h1 className="text-[34px] font-normal text-black">
            Pharmacies Database
          </h1>
          <p className="text-secondary-dark text-[16px]">
            Manage pharmacy accounts across all regions
          </p>
        </div>
        {isManager && <AddPharmacyDialog />}
      </header>
      <StatCards stats={statsConfig} data={data} />
    </>
  );
}
