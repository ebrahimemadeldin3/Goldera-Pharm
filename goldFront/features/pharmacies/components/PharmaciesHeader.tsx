"use client";

import { useMemo, useState } from "react";
import { Layers3, MapPinned, Plus, Store, type LucideIcon } from "lucide-react";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  UNASSIGNED_DISTRICT,
  getTerritoryLookup,
} from "@/features/plan/lib/territory";
import type { PharmacyApiResponse } from "../lib/types";
import { AddPharmacyDialog } from "./AddPharmacyDialog";

interface PharmaciesHeaderProps {
  pharmacies: PharmacyApiResponse[];
  totalCount?: number;
}

type KpiTone = "navy" | "gold";

function isClean(value?: string | null): value is string {
  return Boolean(
    value &&
    typeof value === "string" &&
    value.trim() !== "" &&
    !value.toLowerCase().includes("undefined") &&
    !value.toLowerCase().includes("null"),
  );
}

function PharmacyKpiCard({
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
  tone: KpiTone;
  index: number;
}) {
  return (
    <Card
      className="border-gp-border-default bg-gp-surface-card shadow-gp-card hover:border-gp-gold-300 [animation:plans-card-in_350ms_ease-out_forwards] gap-0 rounded-[14px] py-0 opacity-0 transition-[border-color,box-shadow,transform] duration-[200ms] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(16,29,54,0.08)] motion-reduce:transform-none motion-reduce:[animation:none] motion-reduce:opacity-100"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <CardContent className="relative flex items-center gap-3 overflow-hidden p-4">
        <span
          className={cn(
            "absolute inset-x-0 top-0 h-0.5",
            tone === "navy" ? "bg-gp-navy-900" : "bg-gp-gold-500",
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-[10px] border",
            tone === "navy"
              ? "border-gp-navy-900/10 bg-gp-navy-900 text-gp-gold-500"
              : "border-gp-warning-border bg-gp-warning-soft text-gp-gold-700",
          )}
        >
          <Icon className="size-4.5" aria-hidden="true" />
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

export default function PharmaciesHeader({
  pharmacies,
  totalCount,
}: PharmaciesHeaderProps) {
  const { role } = useRoleUI();
  const isManager = role === "MANAGER";
  const [dialogOpen, setDialogOpen] = useState(false);
  const isRep = role === "MEDICAL_REP";


  const stats = useMemo(() => {
    let centralEastern = 0;
    let westernSouthern = 0;
    const territories = new Set<string>();

    pharmacies.forEach((pharmacy) => {
      const lookup = getTerritoryLookup(pharmacy.subRegion);

      if (lookup.district === "Central & Eastern District") {
        centralEastern += 1;
      }

      if (lookup.district === "Western & Southern District") {
        westernSouthern += 1;
      }

      if (
        lookup.district !== UNASSIGNED_DISTRICT &&
        isClean(lookup.territory)
      ) {
        territories.add(lookup.territory);
      }
    });

    return {
      total: totalCount ?? pharmacies.length,
      centralEastern,
      westernSouthern,
      territories: territories.size,
      isPageSlice:
        typeof totalCount === "number" && totalCount !== pharmacies.length,
    };
  }, [pharmacies, totalCount]);

  if (isRep) {
    return null;
  }

  return (
    <>
      <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-gp-gold-700 text-[11px] font-semibold tracking-[0.14em] uppercase">
            Field Operations
          </p>
          <h1 className="text-gp-navy-900 mt-1 text-2xl leading-tight font-semibold md:text-3xl">
            Pharmacies Database
          </h1>
          <p className="text-gp-text-muted mt-1 max-w-2xl text-sm leading-6 font-medium">
            Manage pharmacy accounts, territories and commercial coverage across
            all regions.
          </p>
        </div>

        {isManager && (
          <Button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="group bg-gp-navy-900 hover:bg-gp-navy-900/95 focus-visible:ring-gp-gold-500/25 h-11 cursor-pointer rounded-[12px] px-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(16,29,54,0.16)] transition-[background-color,box-shadow,transform] duration-[180ms] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(16,29,54,0.22)] focus-visible:ring-3 focus-visible:outline-none motion-reduce:transform-none"
          >
            <Plus
              className="text-gp-gold-500 size-4 transition-transform duration-[180ms] group-hover:rotate-90 motion-reduce:transition-none"
              aria-hidden="true"
            />
            Add Pharmacy
          </Button>
        )}
      </header>

      <section
        aria-label="Pharmacies overview"
        className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <PharmacyKpiCard
          label="Total Pharmacies"
          value={stats.total}
          helper="Registered accounts"
          icon={Store}
          tone="navy"
          index={0}
        />
        <PharmacyKpiCard
          label="Central / Eastern"
          value={stats.centralEastern}
          helper={stats.isPageSlice ? "On this page" : "Loaded pharmacies"}
          icon={MapPinned}
          tone="gold"
          index={1}
        />
        <PharmacyKpiCard
          label="Western / Southern"
          value={stats.westernSouthern}
          helper={stats.isPageSlice ? "On this page" : "Loaded pharmacies"}
          icon={Layers3}
          tone="navy"
          index={2}
        />
        <PharmacyKpiCard
          label="Active Territories"
          value={stats.territories}
          helper={
            stats.isPageSlice ? "Covered on this page" : "Covered territories"
          }
          icon={MapPinned}
          tone="gold"
          index={3}
        />
      </section>

      <AddPharmacyDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
