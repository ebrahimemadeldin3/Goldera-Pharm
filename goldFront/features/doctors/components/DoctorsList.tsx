"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
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

import Pagination from "@/components/ui/Pagination";

interface DoctorsListProps {
  doctors?: DoctorApiResponse[];
  page?: number;
  limit?: number;
  totalCount?: number;
}


export default function DoctorsList({ doctors = [], page = 1, limit = 10, totalCount = 0  }: DoctorsListProps) {
  const [region, setRegion] = useState<string>("All Regions");
  const [q, setQ] = useState("");


  // Map API response to UI data format using mapper
  const doctorsData: DoctorCardData[] = useMemo(() => {
    return doctors.map(mapToDoctorCard);
  }, [doctors]);

  const regions = useMemo(() => {
    const set = new Set(doctorsData.map((d) => d.subRegion));
    return ["All Regions", ...Array.from(set)];
  }, [doctorsData]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return doctorsData.filter((d) => {
      if (region !== "All Regions" && d.subRegion !== region) return false;
      if (!term) return true;
      if (d.nameEN?.toLowerCase().includes(term)) return true;
      if (d.nameAR?.toLowerCase().includes(term)) return true;
      if (d.specialty?.toLowerCase().includes(term)) return true;
      if (d.accountName?.toLowerCase().includes(term)) return true;
      return false;
    });
  }, [region, q, doctorsData]);

  return (
    <section className="border-secondary-light mt-6 rounded-[14px] border-[.8px] bg-white p-6 min-[1440px]:w-270.75! lg:w-5xl">
      
      <div className="mt-4">
        <Pagination page={page} limit={limit} totalCount={totalCount} />
      </div>

      <header className="mb-6 flex items-center justify-start gap-4">
        <h2 className="text-xl font-semibold">Doctor Directory</h2>
        <Select value={region} onValueChange={(v) => setRegion(v)}>
          <SelectTrigger className="border-secondary-light ml-auto h-9 w-40 cursor-pointer rounded-md border bg-white px-3 text-sm">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#717182]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, specialty, or hospital..."
            className="h-9 w-85 rounded-md border bg-white pl-10 text-base"
          />
        </div>
      </header>

      <section className="flex flex-col gap-4">
        {filtered.map((d) => (
          <DoctorCard key={d.id} data={d} />
        ))}

        {filtered.length === 0 && (
          <div className="rounded-md border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-500">
            No doctors found.
          </div>
        )}
      </section>

    </section>
  );
}
