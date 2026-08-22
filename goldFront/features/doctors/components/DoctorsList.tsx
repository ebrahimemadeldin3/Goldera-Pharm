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
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SearchInput } from "@/components/ui/SearchInput";
import { ScopeInfoBanner } from "@/components/ui/ScopeInfoBanner";
import { ResultsFooter } from "@/components/ui/ResultsFooter";

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

  const currentSubRegionParam = searchParams.toString() ? new URLSearchParams(searchParams.toString()).get("subRegion") : null;
  const activeSubRegion = currentSubRegionParam || selectedSubRegion || "ALL";

  // Available sub-regions
  const subRegionOptions = [
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

  const hasActiveFilters = Boolean(q.trim() || selectedSubRegion);

  return (
    <SectionContainer>
      {/* Header & Directory Toolbar */}
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-3 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">Doctor Directory</h2>
          {isPending && (
            <span className="text-xs font-normal text-slate-400">Loading...</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
          {/* Sub-Region Selector */}
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400 shrink-0" />
            <Select
              value={activeSubRegion}
              onValueChange={handleSubRegionChange}
              disabled={isPending}
            >
              <SelectTrigger className="border-secondary-light h-8.5 w-40 cursor-pointer rounded-md border bg-white px-3 text-xs font-medium">
                <SelectValue placeholder="All Sub-Regions" />
              </SelectTrigger>
              <SelectContent>
                {subRegionOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
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
              className="h-8.5 cursor-pointer gap-1.5 text-xs text-slate-600 hover:bg-slate-100 px-2.5"
            >
              <RotateCcw size={13} />
              Reset Filters
            </Button>
          )}
        </div>
      </header>

      {/* Scope-Honest Search Info Banner */}
      {q.trim() !== "" && (
        <ScopeInfoBanner onReset={() => setQ("")} resetLabel="Clear filter">
          Filtering currently loaded page slice for &quot;<strong className="text-slate-700 font-medium">{q}</strong>&quot;.
          Showing {filtered.length} of {doctors.length} loaded records.
        </ScopeInfoBanner>
      )}

      {/* 2-Column Doctor Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {filtered.map((d) => (
          <DoctorCard key={d.id} data={d} />
        ))}

        {/* Distinct Empty States */}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              {q.trim()
                ? `No doctors matching "${q}" found on page ${page}.`
                : selectedSubRegion
                ? `No doctors found in sub-region "${selectedSubRegion}".`
                : "No doctors found in the database."}
            </p>
            {q.trim() && (
              <p className="text-xs text-slate-500">
                Matching doctors may exist on another server page or sub-region.
              </p>
            )}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="mt-2 gap-1.5 text-xs"
              >
                <RotateCcw size={14} />
                Reset Active Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Subtle Inline Results Pagination Footer */}
      <ResultsFooter page={page} limit={limit} totalCount={totalCount} />
    </SectionContainer>
  );
}
