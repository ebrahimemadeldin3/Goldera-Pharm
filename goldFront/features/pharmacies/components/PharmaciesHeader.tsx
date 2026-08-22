"use client";

import { Store, MapPin } from "lucide-react";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { PharmacyApiResponse } from "../lib/types";
import { useMemo } from "react";
import { AddPharmacyDialog } from "./AddPharmacyDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetadataBadge } from "@/components/ui/MetadataBadge";

interface PharmaciesHeaderProps {
  pharmacies: PharmacyApiResponse[];
}

export default function PharmaciesHeader({
  pharmacies,
}: PharmaciesHeaderProps) {
  const { role } = useRoleUI();
  const isManager = role === "MANAGER";

  const { totalPharmacies, topRegions } = useMemo(() => {
    const total = pharmacies.length;

    const regionCounts: Record<string, number> = {};
    pharmacies.forEach((p) => {
      const region = p.region || "Unknown";
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });

    const top = Object.entries(regionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return { totalPharmacies: total, topRegions: top };
  }, [pharmacies]);

  return (
    <PageHeader
      title="Pharmacies Database"
      subtitle="Manage pharmacy accounts across all regions"
      metadata={
        <>
          <MetadataBadge variant="primary" icon={<Store size={14} className="text-blue-600" />}>
            {totalPharmacies} {totalPharmacies === 1 ? "Pharmacy" : "Pharmacies"}
          </MetadataBadge>

          {topRegions.map(([regionName, count]) => (
            <MetadataBadge key={regionName} variant="neutral" icon={<MapPin size={12} className="text-slate-400" />}>
              <strong>{count}</strong> in {regionName}
            </MetadataBadge>
          ))}
        </>
      }
      action={isManager ? <AddPharmacyDialog /> : undefined}
    />
  );
}
