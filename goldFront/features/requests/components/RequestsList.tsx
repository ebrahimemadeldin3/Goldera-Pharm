"use client";

import { useState } from "react";
import { FilterBar } from "@/components/forms/filter-bar";
import RequestCard from "@/features/requests/components/RequestCard";
import { UserRole } from "@/lib/types";
import { TbelongToWho, TRequest } from "@/features/requests/lib/types";

import Pagination from "@/components/ui/Pagination";

interface RequestsListProps {
  requestsData: TRequest[];
  role: UserRole;
  page?: number;
  limit?: number;
  totalCount?: number;
}

export default function RequestsList({
  requestsData,
  role,
  page = 1,
  limit = 10,
  totalCount = 0,
}: RequestsListProps) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState<TbelongToWho>("me");

  const filteredRequests = requestsData.filter((request) => {
    const matchesType =
      typeFilter === "all" ||
      request.type.toLowerCase() === typeFilter.toLowerCase();
    const matchesStatus =
      statusFilter === "all" ||
      request.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.rep.name.toLowerCase().includes(searchQuery.toLowerCase());

    // For supervisor role, filter by tab
    const matchesTab =
      role === "SUPERVISOR" ? request.belongToWho === tab : true;

    return matchesType && matchesStatus && matchesSearch && matchesTab;
  });

  if (role === "MANAGER")
    return (
      <main className="border-secondary-light flex flex-col gap-7.5 rounded-[14px] border bg-white p-6">
        <section className="flex items-center">
          <h3 className="text-base/4 font-normal text-black">All Requests</h3>
          <FilterBar
            filters={[
              {
                value: typeFilter,
                onChange: setTypeFilter,
                placeholder: "All Types",
                options: [
                  { value: "all", label: "All Types" },
                  { value: "EXPENSE", label: "Expense" },
                  { value: "MARKETING", label: "Marketing" },
                  { value: "SAMPLE", label: "Sample" },
                  { value: "LEAVE", label: "Leave" },
                ],
              },
              {
                value: statusFilter,
                onChange: setStatusFilter,
                placeholder: "All Status",
                options: [
                  { value: "all", label: "All Status" },
                  { value: "PENDING", label: "Pending" },
                  { value: "APPROVED", label: "Approved" },
                  { value: "REJECTED", label: "Rejected" },
                ],
              },
            ]}
            searchConfig={{
              value: searchQuery,
              onChange: setSearchQuery,
              placeholder: "Search requests...",
              width: "320px",
            }}
          />
        </section>
        <div className="flex flex-col gap-4">
          {filteredRequests.map((request) => (
            <RequestCard key={request.id} request={request} role={role} />
          ))}
        </div>
        <div className="mt-4">
          <Pagination page={page} limit={limit} totalCount={totalCount} />
        </div>
      </main>
    );

  if (role === "SUPERVISOR")
    return (
      <main className="border-secondary-light flex flex-col gap-7.5 rounded-[14px] border bg-white p-6">
                <div className="mt-4">
          <Pagination page={page} limit={limit} totalCount={totalCount} />
        </div>
        
        <section className="flex items-center">
          <h3 className="text-base/4 font-normal text-black">
            {tab === "me" ? "My Requests" : "Reps Requests"}
          </h3>
          <FilterBar
            filters={[
              {
                value: typeFilter,
                onChange: setTypeFilter,
                placeholder: "All Types",
                options: [
                  { value: "all", label: "All Types" },
                  { value: "EXPENSE", label: "Expense" },
                  { value: "MARKETING", label: "Marketing" },
                  { value: "SAMPLE", label: "Sample" },
                  { value: "LEAVE", label: "Leave" },
                ],
              },
              {
                value: statusFilter,
                onChange: setStatusFilter,
                placeholder: "All Status",
                options: [
                  { value: "all", label: "All Status" },
                  { value: "pending", label: "Pending" },
                  { value: "approved", label: "Approved" },
                  { value: "rejected", label: "Rejected" },
                ],
              },
            ]}
            searchConfig={{
              value: searchQuery,
              onChange: setSearchQuery,
              placeholder: "Search requests...",
              width: "320px",
            }}
          />
        </section>

        {/* Tab switcher for supervisor */}
        <div className="flex w-fit items-center gap-1 rounded-[14px] bg-[#F1F5F9] p-1 text-sm/5 font-medium *:cursor-pointer *:rounded-[14px] *:border-[0.8px] *:px-4 *:py-2">
          <button
            className={`${
              tab === "me"
                ? "border-[#E2E8F0] bg-white text-black"
                : "text-secondary-text border-transparent bg-transparent"
            }`}
            onClick={() => setTab("me")}
          >
            My Requests
          </button>
          <button
            className={`${
              tab === "rep"
                ? "border-[#E2E8F0] bg-white text-black"
                : "text-secondary-text border-transparent bg-transparent"
            }`}
            onClick={() => setTab("rep")}
          >
            Reps Requests
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <RequestCard key={request.id} request={request} role={role} />
            ))
          ) : (
            <div className="text-secondary-dark py-8 text-center text-sm">
              No requests found
            </div>
          )}
        </div>

      </main>
    );
}
