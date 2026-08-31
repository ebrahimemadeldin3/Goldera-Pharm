"use client";

import { useMemo, useState, useTransition } from "react";
import { Filter, RotateCcw } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import DoctorCard from "./DoctorCard";
import { DoctorCardData } from "../lib/types";
import { DoctorApiResponse } from "../lib/types/api";
import { mapToDoctorCard } from "../lib/utils/mappers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { cn } from "@/lib/utils";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SearchInput } from "@/components/ui/SearchInput";
import { ScopeInfoBanner } from "@/components/ui/ScopeInfoBanner";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";

interface DoctorsListProps {
  doctors?: DoctorApiResponse[];
  page?: number;
  limit?: number;
  totalCount?: number;
  selectedSubRegion?: string;
}

export default function DoctorsList({
  doctors = [],
  page = 1,
  limit = 10,
  totalCount = 0,
  selectedSubRegion = "",
}: DoctorsListProps) {
  const { role } = useRoleUI();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState("");

  // Map API response to UI data format using mapper
  const doctorsData: DoctorCardData[] = useMemo(() => {
    return doctors.map(mapToDoctorCard);
  }, [doctors]);

  // Handle Sub-Region change via URL parameters
  const handleSubRegionChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (value === "ALL" || value === "All Sub-Regions") {
      params.delete("subRegion");
    } else {
      params.set("subRegion", value);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleResetFilters = () => {
    setQ("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("subRegion");
    params.set("page", "1");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const currentSubRegionParam = searchParams.get("subRegion");
  const activeSubRegion = currentSubRegionParam || selectedSubRegion || "ALL";

  // Dynamic available sub-regions
  const subRegionOptions = useMemo(() => {
    const baseList = [
      { value: "ALL", label: "All Sub-Regions" },
      { value: "Riyadh 1", label: "Riyadh 1" },
      { value: "Riyadh 2", label: "Riyadh 2" },
      { value: "Jeddah 1", label: "Jeddah 1" },
      { value: "Jeddah 2", label: "Jeddah 2" },
      { value: "Eastern 1", label: "Eastern 1" },
      { value: "Eastern 2", label: "Eastern 2" },
      { value: "Southern 1", label: "Southern 1" },
      { value: "Northern 1", label: "Northern 1" },
    ];

    const set = new Set<string>();
    doctors.forEach((d) => {
      if (d.subRegion) set.add(d.subRegion);
    });
    if (activeSubRegion && activeSubRegion !== "ALL") {
      set.add(activeSubRegion);
    }

    const result = [...baseList];
    set.forEach((sr) => {
      if (!result.some((item) => item.value === sr)) {
        result.push({ value: sr, label: sr });
      }
    });

    return result;
  }, [doctors, activeSubRegion]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return doctorsData;

    return doctorsData.filter((d) => {
      if (d.nameEN?.toLowerCase().includes(term)) return true;
      if (d.nameAR?.toLowerCase().includes(term)) return true;
      if (d.specialty?.toLowerCase().includes(term)) return true;
      if (d.accountName?.toLowerCase().includes(term)) return true;
      return false;
    });
  }, [q, doctorsData]);

  const hasActiveFilters = Boolean(q.trim() || (activeSubRegion && activeSubRegion !== "ALL"));

  return (
    <SectionContainer className="p-0 overflow-hidden border border-[#E5E8EF] rounded-[16px] bg-white shadow-none">
      {/* Header & Directory Toolbar */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#EEF1F6] bg-[#FBFCFE]/60 px-5 py-4">
        <div className="flex items-center gap-3 shrink-0">
          <h2 className="text-base font-semibold text-[#182033]">Doctor Directory</h2>
          {isPending && (
            <span className="text-xs font-medium text-[#8A94A6]">Loading...</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
          {/* Sub-Region Selector */}
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-[#8A94A6] shrink-0" />
            <Select
              value={activeSubRegion}
              onValueChange={handleSubRegionChange}
              disabled={isPending}
            >
              <SelectTrigger
                className={cn(
                  "h-10 w-44 cursor-pointer rounded-[10px] border border-[#DDE3EE] bg-white px-3 text-xs font-semibold text-[#182033]",
                  role === "MEDICAL_REP"
                    ? "hover:border-gp-rep-primary-border focus-visible:ring-2 focus-visible:ring-gp-rep-primary/30"
                    : "hover:border-[#E9DDB8] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/30"
                )}
              >
                <SelectValue placeholder="All Sub-Regions" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {subRegionOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs font-medium cursor-pointer">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Filter page by name, specialty..."
            disabled={isPending}
          />

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className={cn(
                "h-10 cursor-pointer gap-1.5 text-xs font-semibold text-[#667085] px-3 rounded-[10px]",
                role === "MEDICAL_REP"
                  ? "hover:bg-gp-rep-primary-soft hover:text-gp-rep-primary"
                  : "hover:bg-[#F9FAFB] hover:text-[#182033]"
              )}
            >
              <RotateCcw size={13} />
              Reset Filters
            </Button>
          )}
        </div>
      </header>

      {/* Scope-Honest Search Info Banner */}
      {q.trim() !== "" && (
        <div className="px-5 pt-4">
          <ScopeInfoBanner onReset={() => setQ("")} resetLabel="Clear filter">
            Filtering currently loaded page slice for &quot;<strong className="text-[#182033] font-semibold">{q}</strong>&quot;.
            Showing {filtered.length} of {doctors.length} loaded records.
          </ScopeInfoBanner>
        </div>
      )}

      {/* 2-Column Doctor Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5">
        {filtered.map((d) => (
          <DoctorCard key={d.id} data={d} />
        ))}

        {/* Distinct Empty States */}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-[14px] border border-dashed border-[#E5E8EF] bg-[#F9FAFB] p-10 text-center">
            <p className="text-sm font-semibold text-[#182033]">
              {q.trim()
                ? `No doctors matching "${q}" found on page ${page}.`
                : activeSubRegion && activeSubRegion !== "ALL"
                ? `No doctors found in sub-region "${activeSubRegion}".`
                : "No doctors found in the database."}
            </p>
            {q.trim() && (
              <p className="text-xs text-[#667085]">
                Matching doctors may exist on another server page or sub-region.
              </p>
            )}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="mt-2 gap-1.5 text-xs font-semibold rounded-[10px]"
              >
                <RotateCcw size={14} />
                Reset Active Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Table Pagination Footer */}
      <TablePaginationFooter
        page={page}
        limit={limit}
        totalCount={totalCount}
        itemLabel="doctors"
        ariaLabel="Doctors directory pagination"
      />
    </SectionContainer>
  );
}
