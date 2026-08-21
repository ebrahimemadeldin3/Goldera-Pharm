"use client";

import { useState, useMemo } from "react";
import { Stethoscope, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { DoctorApiResponse } from "../lib/types/api";
import { Button } from "@/components/ui/button";
import AddDoctorDialog from "./AddDoctorDialog";

export default function DoctorsHeader({
  doctors = [],
  totalCount,
}: {
  doctors: DoctorApiResponse[];
  totalCount?: number;
}) {
  const { features, role } = useRoleUI();
  const [dialogOpen, setDialogOpen] = useState(false);

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
      <header className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-normal text-2xl text-black md:text-[32px]">
            Doctors Database
          </h1>
          <p className="text-secondary-dark text-sm mt-0.5">
            Manage doctor contacts, locations, and visit history across all regions
          </p>

          {/* Compact Inline Metadata Summary */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">
              <Stethoscope size={14} className="text-dashboard-blue" />
              {totalDoctors} {totalDoctors === 1 ? "Doctor" : "Doctors"}
            </span>

            {topRegions.map(([regionName, count]) => (
              <span
                key={regionName}
                className="inline-flex items-center gap-1.5 bg-slate-100/80 border border-slate-200/60 px-2 py-0.5 rounded-md text-slate-700"
              >
                <MapPin size={12} className="text-slate-400" />
                <span>
                  <strong>{count}</strong> in {regionName}
                </span>
              </span>
            ))}
          </div>
        </div>

        {features.doctors.canAdd && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="bg-system-primary hover:bg-blue-700 cursor-pointer inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Doctor
            </Button>

            {/* Fallback direct link accessible via screen readers or right-click */}
            <Link
              href={getAddDoctorLink()}
              className="sr-only"
              tabIndex={-1}
            >
              Add Doctor Page
            </Link>
          </div>
        )}
      </header>

      {/* Add Doctor Modal Overlay */}
      <AddDoctorDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
