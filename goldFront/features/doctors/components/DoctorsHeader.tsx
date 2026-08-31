"use client";

import { useState, useMemo } from "react";
import { Stethoscope, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { DoctorApiResponse } from "../lib/types/api";
import { Button } from "@/components/ui/button";
import AddDoctorDialog from "./AddDoctorDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetadataBadge } from "@/components/ui/MetadataBadge";

export default function DoctorsHeader({
  doctors = [],
  totalCount,
}: {
  doctors: DoctorApiResponse[];
  totalCount?: number;
}) {
  const { features, role } = useRoleUI();
  const [dialogOpen, setDialogOpen] = useState(false);
  const isRep = role === "MEDICAL_REP";

  // Determine add doctor fallback link based on role
  const getAddDoctorLink = () => {
    if (role === "MANAGER") return "/manager/doctors/add";
    if (role === "SUPERVISOR") return "/supervisor/doctors/add";
    return "/rep/doctors/add";
  };

  // Calculate dynamic stats for inline summary
  const { totalDoctors, topRegions } = useMemo(() => {
    const total = totalCount ?? doctors.length;

    // Count doctors by subRegion
    const regionCounts: Record<string, number> = {};
    doctors.forEach((doctor) => {
      const region = doctor.subRegion || "Unknown";
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });

    // Get top 3 regions by doctor count
    const top = Object.entries(regionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return { totalDoctors: total, topRegions: top };
  }, [doctors, totalCount]);

  return (
    <>
      <PageHeader
        title={isRep ? "Doctors" : "Doctors Database"}
        subtitle={
          isRep
            ? "Personal territory doctor directory & contact list"
            : "Manage doctor contacts, locations, and visit history across all regions"
        }
        metadata={
          <>
            <MetadataBadge
              variant="primary"
              icon={
                <Stethoscope
                  size={14}
                  className={isRep ? "text-[#168557]" : "text-blue-600"}
                />
              }
            >
              {totalDoctors} {totalDoctors === 1 ? "Doctor" : "Doctors"}
            </MetadataBadge>

            {topRegions.map(([regionName, count]) => (
              <MetadataBadge key={regionName} variant="neutral" icon={<MapPin size={12} className="text-slate-400" />}>
                <strong>{count}</strong> in {regionName}
              </MetadataBadge>
            ))}
          </>
        }
        action={
          features.doctors.canAdd ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="h-10 px-5 rounded-[10px] bg-[#C9A44C] hover:bg-[#B18732] text-white text-sm font-semibold shadow-[0_4px_14px_rgba(201,164,76,0.25)] transition-all duration-170 hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(201,164,76,0.3)] cursor-pointer inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A44C]/30 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                Add Doctor
              </Button>

              <Link
                href={getAddDoctorLink()}
                className="sr-only"
                tabIndex={-1}
              >
                Add Doctor Page
              </Link>
            </div>
          ) : undefined
        }
      />

      {/* Add Doctor Modal Overlay */}
      <AddDoctorDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
