"use client";

import { useState } from "react";
import TeamCard from "@/features/team/components/TeamCard";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/ui/Pagination";
import { Search as SearchIcon } from "lucide-react";
import { User } from "../../lib/types";

type SupervisorTeamListProps = {
  members: User[];
  page?: number;
  limit?: number;
  totalCount?: number;
};

export default function SupervisorTeamList({
  members,
  page = 1,
  limit = 10,
  totalCount = 0,
}: SupervisorTeamListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <SearchIcon className="text-secondary-dark absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search team members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-secondary-very-light pl-10"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredMembers.map((member) => (
          <TeamCard
            key={member.id}
            member={member}
            baseUrl="/supervisor/team"
          />
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-secondary-dark mt-8 text-center">
          No team members found
        </div>
      )}

      <div className="mt-6">
        <Pagination page={page} limit={limit} totalCount={totalCount} />
      </div>
    </div>
  );
}
