"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { PharmacyApiResponse } from "../lib/types";
import Pagination from "@/components/ui/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PharmaciesListProps {
  pharmacies: PharmacyApiResponse[];
  page?: number;
  limit?: number;
  totalCount?: number;
}

export default function PharmaciesList({ pharmacies, page = 1, limit = 10, totalCount = 0 }: PharmaciesListProps) {
  const [regionFilter, setRegionFilter] = useState("All Regions");
  const [q, setQ] = useState("");

  const regions = useMemo(() => {
    const set = new Set(pharmacies.map((p) => p.region).filter(Boolean));
    return ["All Regions", ...Array.from(set)];
  }, [pharmacies]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return pharmacies.filter((p) => {
      if (regionFilter !== "All Regions" && p.region !== regionFilter)
        return false;
      if (!term) return true;
      return (
        p.name?.toLowerCase().includes(term) ||
        p.city?.toLowerCase().includes(term) ||
        p.subRegion?.toLowerCase().includes(term)
      );
    });
  }, [pharmacies, regionFilter, q]);

  return (
    <section className="border-secondary-light mt-6 rounded-[14px] border-[.8px] bg-white p-6 min-[1440px]:w-270.75! lg:w-5xl">
                  <div className="mt-4 flex items-center justify-between">
        <p className="text-secondary-dark text-xs">
          Showing {filtered.length} of {totalCount || pharmacies.length} pharmacies
        </p>
        <Pagination page={page} limit={limit} totalCount={totalCount || pharmacies.length} />
      </div>
      
      
      
      {/* Filters */}
      <header className="mb-6 flex items-center gap-4">
        <h2 className="text-xl font-semibold">Pharmacy Directory</h2>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="border-secondary-light ml-auto h-9 w-44 cursor-pointer rounded-md border bg-white px-3 text-sm">
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
            placeholder="Search by name, city, or sub-region..."
            className="h-9 w-[300px] rounded-md border bg-white pl-10 text-sm"
          />
        </div>
        
      </header>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-secondary-light border-b text-left">
                  <th className="text-secondary-dark pr-4 pb-3 font-medium">#</th>
                  <th className="text-secondary-dark pr-4 pb-3 font-medium">
                    Name
                  </th>
                  <th className="text-secondary-dark pr-4 pb-3 font-medium">
                    City
                  </th>
                  <th className="text-secondary-dark pr-4 pb-3 font-medium">
                    Sub-Region
                  </th>
                  <th className="text-secondary-dark pr-4 pb-3 font-medium">
                    Region
                  </th>
                  <th className="text-secondary-dark pr-4 pb-3 font-medium">
                    Country
                  </th>
                  <th className="text-secondary-dark pb-3 font-medium">Added</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((pharmacy, index) => (
                  <tr
                    key={pharmacy.id}
                    className="border-secondary-light border-b last:border-0 hover:bg-[#f8fafc]"
                  >
                    <td className="py-3 pr-4 text-[#717182]">{index + 1}</td>
                    <td className="py-3 pr-4 font-medium text-black">
                      {pharmacy.name}
                    </td>
                    <td className="py-3 pr-4 text-[#334155]">{pharmacy.city}</td>
                    <td className="py-3 pr-4 text-[#334155]">
                      {pharmacy.subRegion}
                    </td>
                    <td className="py-3 pr-4 text-[#334155]">{pharmacy.region}</td>
                    <td className="py-3 pr-4 text-[#334155]">{pharmacy.country}</td>
                    <td className="py-3 text-[#717182]">
                      {pharmacy.createdAt
                        ? format(new Date(pharmacy.createdAt), "MMM d, yyyy")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="rounded-md border border-dashed border-slate-200 bg-white/60 p-8 text-center text-sm text-slate-500">
                No pharmacies found.
              </div>
            )}
          </div>


 
    </section>
  );
}
