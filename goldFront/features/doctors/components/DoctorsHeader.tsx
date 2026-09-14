"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  MapPinned,
  Plus,
  Stethoscope,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRoleUI } from "@/core/ui/role-ui-context";
import type { DoctorApiResponse } from "../lib/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AddDoctorDialog from "./AddDoctorDialog";
import { cn } from "@/lib/utils";
import {
  UNASSIGNED_REGION,
  getTerritoryLookup,
} from "@/features/plan/lib/territory";

function isClean(value?: string | null): value is string {
  return Boolean(
    value &&
      typeof value === "string" &&
      value.trim() !== "" &&
      !value.toLowerCase().includes("undefined") &&
      !value.toLowerCase().includes("null"),
  );
}

function uniqueCount(values: Array<string | null | undefined>) {
  return new Set(values.filter(isClean).map((value) => value.trim())).size;
}

function DoctorsKpiCard({
  label,
  value,
  helper,
  icon: Icon,
  tone,
  index,
}: {
  label: string;
  value: number;
  helper: string;
  icon: LucideIcon;
  tone: "navy" | "gold";
  index: number;
}) {
  return (
    <Card
      className="border-gp-border-default bg-gp-surface-card shadow-gp-card gap-0 rounded-[14px] py-0 opacity-0 transition-[border-color,box-shadow,transform] duration-[200ms] hover:-translate-y-0.5 hover:border-gp-gold-300 hover:shadow-[0_10px_24px_rgba(16,29,54,0.08)] [animation:plans-card-in_350ms_ease-out_forwards] motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:[animation:none]"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <CardContent className="flex items-center gap-3 p-4">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-[10px] border",
            tone === "navy"
              ? "border-gp-navy-900/10 bg-gp-navy-900 text-white"
              : "border-gp-warning-border bg-gp-warning-soft text-gp-gold-700",
          )}
        >
          <Icon
            className={cn("size-4.5", tone === "navy" && "text-gp-gold-500")}
            aria-hidden="true"
          />
        </span>
        <div className="min-w-0">
          <p className="text-gp-text-muted truncate text-[11px] font-semibold tracking-[0.06em] uppercase">
            {label}
          </p>
          <p className="text-gp-navy-900 mt-1 text-2xl leading-none font-semibold">
            {value.toLocaleString()}
          </p>
          <p className="text-gp-text-placeholder mt-1 truncate text-xs font-medium">
            {helper}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DoctorsHeader({
  doctors = [],
  totalCount,
}: {
  doctors: DoctorApiResponse[];
  totalCount?: number;
}) {
  const { features, role } = useRoleUI();
  const [dialogOpen, setDialogOpen] = useState(false);

  const addDoctorLink =
    role === "MANAGER"
      ? "/manager/doctors/add"
      : role === "SUPERVISOR"
        ? "/supervisor/doctors/add"
        : "/rep/doctors/add";

  const stats = useMemo(() => {
    const regions = new Set<string>();

    doctors.forEach((doctor) => {
      const territory = getTerritoryLookup(doctor.subRegion || doctor.area);
      if (territory.region !== UNASSIGNED_REGION) {
        regions.add(territory.region);
      }
    });

    return {
      totalDoctors: totalCount ?? doctors.length,
      regions: regions.size,
      facilities: uniqueCount(doctors.map((doctor) => doctor.accountName)),
      specialties: uniqueCount(doctors.map((doctor) => doctor.specialty)),
    };
  }, [doctors, totalCount]);

  return (
    <>
      <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-gp-gold-700 text-[11px] font-semibold tracking-[0.14em] uppercase">
            Field Operations
          </p>
          <h1 className="text-gp-navy-900 mt-1 text-2xl leading-tight font-semibold md:text-3xl">
            Doctors Database
          </h1>
          <p className="text-gp-text-muted mt-1 max-w-2xl text-sm leading-6 font-medium">
            Manage doctors, territories, facilities and visit coverage across
            the sales force.
          </p>
        </div>

        {features.doctors.canAdd && (
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="group bg-gp-navy-900 hover:bg-gp-navy-900/95 h-11 cursor-pointer rounded-[12px] px-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(16,29,54,0.16)] transition-[background-color,box-shadow,transform] duration-[180ms] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,29,54,0.22)] focus-visible:ring-3 focus-visible:ring-gp-gold-500/25 focus-visible:outline-none motion-reduce:transform-none"
            >
              <Plus
                className="size-4 text-gp-gold-500 transition-transform duration-[180ms] group-hover:rotate-90 motion-reduce:transition-none"
                aria-hidden="true"
              />
              Add Doctor
            </Button>

            <Link href={addDoctorLink} className="sr-only" tabIndex={-1}>
              Add Doctor Page
            </Link>
          </div>
        )}
      </header>

      <section
        aria-label="Doctors overview"
        className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <DoctorsKpiCard
          label="Total Doctors"
          value={stats.totalDoctors}
          helper="Registered doctors"
          icon={UsersRound}
          tone="navy"
          index={0}
        />
        <DoctorsKpiCard
          label="Regions Covered"
          value={stats.regions}
          helper="Mapped from loaded doctors"
          icon={MapPinned}
          tone="gold"
          index={1}
        />
        <DoctorsKpiCard
          label="Facilities"
          value={stats.facilities}
          helper="Unique facilities loaded"
          icon={Building2}
          tone="navy"
          index={2}
        />
        <DoctorsKpiCard
          label="Specialties"
          value={stats.specialties}
          helper="Unique specialties loaded"
          icon={Stethoscope}
          tone="gold"
          index={3}
        />
      </section>

      <AddDoctorDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
