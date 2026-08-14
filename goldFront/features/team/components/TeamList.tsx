"use client";

import { useState } from "react";
import TeamCard from "@/features/team/components/TeamCard";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/ui/Pagination";
import { Search as SearchIcon } from "lucide-react";
import { User } from "../lib/types";
import { useRoleUI } from "@/core/ui/role-ui-context";

type TeamListProps = {
  members: User[];
  medicalReps?: User[];
  supervisors?: User[];
  stats?: {
    totalMembers: number;
    supervisorsCount: number;
    repsCount: number;
  };
  page?: number;
  limit?: number;
  medicalRepsTotalCount?: number;
  supervisorsTotalCount?: number;
};

export default function TeamList({
  members,
  medicalReps,
  supervisors,
  stats,
  page = 1,
  limit = 10,
  medicalRepsTotalCount = 0,
  supervisorsTotalCount = 0,
}: TeamListProps) {
  const { role } = useRoleUI();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"reps" | "supervisors">("reps");

  // For manager role, use tab-based filtering
  const isManager = role === "MANAGER";
  const displayMembers = isManager
    ? activeTab === "reps"
      ? medicalReps || []
      : supervisors || []
    : members;

  const filteredMembers = displayMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      {/* Manager-only Toggle Buttons */}
      {isManager && medicalReps && supervisors && stats && (
        <div className="mb-6 flex w-fit max-w-full flex-wrap items-center gap-2 rounded-full bg-[#EBF1FF] p-1 *:cursor-pointer">
          <button
            onClick={() => setActiveTab("reps")}
            className={`rounded-full px-4 py-1 text-sm font-medium ${
              activeTab === "reps"
                ? "bg-linear-to-b from-[#10B981] to-[#1E8A35] text-white"
                : ""
            }`}
          >
            Medical Reps ({stats.repsCount})
          </button>
          <button
            onClick={() => setActiveTab("supervisors")}
            className={`rounded-full px-4 py-1 text-sm font-medium ${
              activeTab === "supervisors" ? "gradient-blue text-white" : ""
            }`}
          >
            Supervisors ({stats.supervisorsCount})
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative mb-6 w-full max-w-md">
        <SearchIcon className="text-secondary-dark absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search team members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-secondary-very-light pl-10"
        />
      </div>

      <section className="inline-grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <TeamCard key={member.id} member={member} />
        ))}
      </section>

      {filteredMembers.length === 0 && (
        <div className="text-secondary-dark mt-8 text-center">
          {isManager
            ? `No ${activeTab === "reps" ? "medical reps" : "supervisors"} found`
            : "No team members found"}
        </div>
      )}

      <div className="mt-6">
        <Pagination
          page={page}
          limit={limit}
          totalCount={
            isManager
              ? activeTab === "reps"
                ? medicalRepsTotalCount
                : supervisorsTotalCount
              : members.length
          }
        />
      </div>
    </>
  );
}
