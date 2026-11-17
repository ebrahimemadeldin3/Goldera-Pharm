"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  Stethoscope,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getMarketingDoctorsLookupAction,
  type MarketingDoctorOption,
  type MarketingFacilityOption,
} from "@/features/requests/api";

interface MarketingTargetDoctorsSelectorProps {
  selectedDoctorIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

const PAGE_LIMIT = 15;

export function MarketingTargetDoctorsSelector({
  selectedDoctorIds,
  onChange,
  disabled = false,
}: MarketingTargetDoctorsSelectorProps) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [facilityId, setFacilityId] = useState("all");
  const [page, setPage] = useState(1);

  const [doctors, setDoctors] = useState<MarketingDoctorOption[]>([]);
  const [facilities, setFacilities] = useState<MarketingFacilityOption[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCache, setSelectedCache] = useState<
    Record<string, MarketingDoctorOption>
  >({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchDoctors = useCallback(async () => {
    const res = await getMarketingDoctorsLookupAction({
      search: debouncedSearch || undefined,
      facilityId: facilityId !== "all" ? facilityId : undefined,
      page,
      limit: PAGE_LIMIT,
    });
    return res;
  }, [debouncedSearch, facilityId, page]);

  const applyDoctorsResponse = useCallback(
    (res: Awaited<ReturnType<typeof getMarketingDoctorsLookupAction>>) => {
      if (!res.success) {
        setError(res.error || "Failed to load doctors.");
        setLoading(false);
        return;
      }

      const list = res.data || [];
      setDoctors(list);
      if (res.facilities && res.facilities.length > 0) {
        setFacilities(res.facilities);
      }
      setTotalCount(res.totalCount ?? list.length);
      setTotalPages(Math.max(1, res.pagination?.totalPages ?? 1));
      setSelectedCache((prev) => {
        const next = { ...prev };
        for (const doc of list) {
          next[doc.id] = doc;
        }
        return next;
      });
      setLoading(false);
    },
    [],
  );

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetchDoctors();
    applyDoctorsResponse(res);
  }, [applyDoctorsResponse, fetchDoctors]);

  useEffect(() => {
    let active = true;
    fetchDoctors().then((res) => {
      if (active) applyDoctorsResponse(res);
    });
    return () => {
      active = false;
    };
  }, [applyDoctorsResponse, fetchDoctors]);

  const selectedSet = useMemo(
    () => new Set(selectedDoctorIds),
    [selectedDoctorIds],
  );

  const toggleDoctor = (doctor: MarketingDoctorOption) => {
    if (disabled) return;
    setSelectedCache((prev) => ({ ...prev, [doctor.id]: doctor }));
    if (selectedSet.has(doctor.id)) {
      onChange(selectedDoctorIds.filter((id) => id !== doctor.id));
    } else {
      onChange([...selectedDoctorIds, doctor.id]);
    }
  };

  const removeDoctor = (id: string) => {
    if (disabled) return;
    onChange(selectedDoctorIds.filter((item) => item !== id));
  };

  const clearSearch = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setPage(1);
  };

  const clearFacilityFilter = () => {
    setFacilityId("all");
    setPage(1);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="text-sm font-semibold text-[#182033]">
          Target Doctors ({selectedDoctorIds.length} Selected)
        </Label>
        <span className="text-xs font-medium text-[#667085]">
          {totalCount} active {totalCount === 1 ? "doctor" : "doctors"} found
        </span>
      </div>

      {/* Selected Doctors Summary */}
      {selectedDoctorIds.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900">
              Selected Doctors ({selectedDoctorIds.length})
            </span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange([])}
              className="text-xs font-semibold text-emerald-700 hover:underline disabled:opacity-50"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedDoctorIds.map((id) => {
              const doc = selectedCache[id];
              const label = doc
                ? doc.nameEN && doc.nameAR
                  ? `${doc.nameEN} / ${doc.nameAR}`
                  : doc.displayName
                : id;
              return (
                <span
                  key={id}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-emerald-300 bg-white px-2.5 py-1 text-xs font-medium text-emerald-950"
                  dir="auto"
                >
                  <span className="whitespace-normal break-words">{label}</span>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeDoctor(id)}
                    aria-label={`Remove ${label}`}
                    className="shrink-0 rounded-full p-0.5 text-emerald-700 hover:bg-emerald-100"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Facility Filter Controls */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
        <div className="relative sm:col-span-6">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98A2B3]"
            aria-hidden="true"
          />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search doctors by name..."
            aria-label="Search doctors by name"
            disabled={disabled}
            className="h-10 pr-8 pl-9 text-sm"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear doctor search"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-[#98A2B3] hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:col-span-6">
          <Select
            value={facilityId}
            onValueChange={(val) => {
              setFacilityId(val);
              setPage(1);
            }}
            disabled={disabled}
          >
            <SelectTrigger
              aria-label="Filter by hospital or clinic"
              className="h-10 w-full text-sm"
            >
              <Building2 className="mr-1.5 size-4 shrink-0 text-[#98A2B3]" />
              <SelectValue placeholder="Filter by hospital or clinic" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">All facilities</SelectItem>
              {facilities.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {facilityId !== "all" && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearFacilityFilter}
              aria-label="Reset facility filter"
              className="h-10 w-10 shrink-0"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Results List */}
      <div className="rounded-xl border border-[#DDE3EE] bg-white">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#667085]">
            <Loader2 className="size-4 animate-spin text-[#168557]" />
            Loading active doctors...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-2.5 p-6 text-center">
            <AlertCircle className="size-6 text-red-500" />
            <p className="text-sm font-medium text-red-700">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadDoctors}
              className="gap-1.5"
            >
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
          </div>
        ) : doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
            <Stethoscope className="size-7 text-[#98A2B3]" />
            <p className="text-sm font-semibold text-[#182033]">
              No matching doctors found
            </p>
            <p className="text-xs text-[#667085]">
              Try adjusting your search or hospital/clinic filter.
            </p>
            {(debouncedSearch || facilityId !== "all") && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  clearSearch();
                  clearFacilityFilter();
                }}
              >
                Reset filters
              </Button>
            )}
          </div>
        ) : (
          <div className="max-h-80 divide-y divide-[#EEF1F6] overflow-y-auto">
            {doctors.map((doctor) => {
              const isSelected = selectedSet.has(doctor.id);
              return (
                <button
                  key={doctor.id}
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  disabled={disabled}
                  onClick={() => toggleDoctor(doctor)}
                  className={cn(
                    "flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-[#168557]/30 focus-visible:outline-none",
                    isSelected
                      ? "bg-[#E9F8F1]/60 hover:bg-[#E9F8F1]"
                      : "bg-white hover:bg-[#F9FAFB]",
                  )}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      {doctor.nameEN && (
                        <span
                          className="text-sm font-semibold text-[#182033] whitespace-normal break-words"
                          dir="ltr"
                        >
                          {doctor.nameEN}
                        </span>
                      )}
                      {doctor.nameAR && (
                        <span
                          className="text-sm font-semibold text-[#182033] whitespace-normal break-words"
                          dir="rtl"
                        >
                          {doctor.nameAR}
                        </span>
                      )}
                      {!doctor.nameEN && !doctor.nameAR && (
                        <span
                          className="text-sm font-semibold text-[#182033] whitespace-normal break-words"
                          dir="auto"
                        >
                          {doctor.displayName}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#667085]">
                      {doctor.specialty && (
                        <span className="rounded bg-[#F4F6FA] px-2 py-0.5 font-medium text-[#344054]">
                          {doctor.specialty}
                        </span>
                      )}
                      {doctor.facilities.map((facility) => (
                        <span
                          key={facility.id}
                          className="inline-flex items-center gap-1 rounded border border-[#E5E8EF] bg-white px-2 py-0.5 font-medium text-[#475467] whitespace-normal break-words"
                          dir="auto"
                        >
                          <Building2 className="size-3 shrink-0 text-[#98A2B3]" />
                          <span>{facility.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <span
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
                      isSelected
                        ? "border-[#168557] bg-[#168557] text-white"
                        : "border-[#D0D5DD] bg-white",
                    )}
                    aria-hidden="true"
                  >
                    {isSelected && <Check className="size-3.5" />}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#EEF1F6] bg-[#FBFCFE] px-4 py-2.5 text-xs text-[#667085]">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || disabled}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-7 px-2"
              >
                <ChevronLeft className="size-3.5" />
                Prev
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || disabled}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 px-2"
              >
                Next
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
