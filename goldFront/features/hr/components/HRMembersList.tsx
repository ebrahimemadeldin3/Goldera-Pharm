"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { HRMember } from "../lib/types";
import { HRMemberCard } from "./HRMemberCard";

type HRMembersListProps = {
  members: HRMember[];
  page?: number;
  limit?: number;
  totalCount?: number;
};

export function HRMembersList({
  members,
  page = 1,
  limit = 10,
  totalCount = 0,
}: HRMembersListProps) {
  const [tab, setTab] = useState<"all" | "supervisors" | "reps">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return members.filter((m) => {
      if (tab === "supervisors" && m.role !== "SUPERVISOR") return false;
      if (tab === "reps" && m.role !== "MEDICAL_REP") return false;
      if (!term) return true;
      return (
        m.name.toLowerCase().includes(term) ||
        m.department?.toLowerCase().includes(term) ||
        m.subRegion?.name?.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        m.iqamaNumber?.toLowerCase().includes(term)
      );
    });
  }, [tab, q, members]);

  return (
    <section className="mt-6 rounded-lg border-[.8px] border-[#E6EEF8] bg-white p-6">
      {/* Filter bar */}
      <div className="flex flex-col items-start gap-5">
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <h2 className="text-[20px]/6 font-semibold">Members Directory</h2>
          <div className="relative w-full sm:w-90">
            <span className="text-secondary-text absolute top-1/2 left-3 -translate-y-1/2">
              <Search className="h-4 w-4" />
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, region, or email..."
              className={`bg-secondary-very-light placeholder:text-secondary-text h-10 w-full rounded-md border-[.8px] border-[#E2E8F0] px-4 pl-10 placeholder:text-sm placeholder:font-normal`}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-full bg-[#EBF1FF] p-1 *:cursor-pointer">
          <button
            onClick={() => setTab("all")}
            className={`rounded-full px-4 py-1 text-sm font-medium ${
              tab === "all" ? "bg-dashboard-blue text-white" : ""
            }`}
          >
            All Members ({members.length})
          </button>
          <button
            onClick={() => setTab("supervisors")}
            className={`rounded-full px-4 py-1 text-sm font-medium ${
              tab === "supervisors" ? "bg-dashboard-blue text-white" : ""
            }`}
          >
            Supervisors ({members.filter((m) => m.role === "SUPERVISOR").length}
            )
          </button>
          <button
            onClick={() => setTab("reps")}
            className={`rounded-full px-4 py-1 text-sm font-medium ${
              tab === "reps" ? "bg-dashboard-blue text-white" : ""
            }`}
          >
            Medical Reps (
            {members.filter((m) => m.role === "MEDICAL_REP").length})
          </button>
        </div>
      </div>

      {/* Members cards */}
      <div className="mt-6 flex flex-col gap-4">
        {filtered.map((member) => (
          <HRMemberCard key={member.id} member={member} />
        ))}

        {filtered.length === 0 && (
          <div className="rounded-md border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-500">
            No members found.
          </div>
        )}
      </div>

      <div className="mt-6">
        <Pagination page={page} limit={limit} totalCount={totalCount} />
      </div>
    </section>
  );
}
