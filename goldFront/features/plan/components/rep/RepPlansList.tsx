"use client";

import { useState, useMemo } from "react";
import Pagination from "@/components/ui/Pagination";

import RepPlanCard from "./RepPlanCard";
import { VisitPlan } from "@/features/plan/api/get"

type PlansListProps = {
  plans: VisitPlan[];
  page?: number;
  limit?: number;
  totalCount?: number;
};

type TabType = "all" | "PENDING" | "APPROVED";

export default function RepPlansList({
  plans,
  page = 1,
  limit = 10,
  totalCount = 0,
}: PlansListProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // Count plans by status
  const counts = useMemo(() => {
    return {
      all: plans.length,
      pending: plans.filter((p) => p.status === "PENDING").length,
      approved: plans.filter((p) => p.status === "APPROVED").length,
    };
  }, [plans]);

  // Filter plans based on active tab
  const filteredPlans = useMemo(() => {
    if (activeTab === "all") return plans;
    return plans.filter((p) => p.status === activeTab);
  }, [plans, activeTab]);

  const tabs: Array<{ id: TabType; label: string; count?: number }> = [
    { id: "all", label: "All Plans" },
    { id: "PENDING", label: "Pending Approval", count: counts.pending },
    { id: "APPROVED", label: "Approved", count: counts.approved },
  ];

  return (
    <div className="border-secondary-light mt-6 rounded-[14px] border-[0.8px] bg-white p-6">
           <div className="mt-6">
        <Pagination page={page} limit={limit} totalCount={totalCount} />
      </div>
      {/* Tabs */}
      <div className="flex w-fit flex-wrap items-center gap-2 rounded-[14px] bg-[#F1F5F9] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex cursor-pointer items-center gap-2 rounded-[14px] border-[0.8px] border-transparent px-2 py-1 text-sm/5 font-medium text-[#0F172A] transition-colors ${
              activeTab === tab.id ? "border-secondary-light bg-white" : ""
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="bg-dashboard-red flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs/4 font-medium text-white">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Plans List */}
      <div className="mt-10 space-y-4">
        {filteredPlans.length === 0 ? (
          <div className="border-secondary-light flex flex-col items-center justify-center rounded-2xl border-[0.8px] bg-white p-12 text-center">
            <p className="text-secondary-dark text-base/6 font-normal">
              No plans found
            </p>
            <p className="text-secondary-dark mt-2 text-sm/5 font-normal">
              {activeTab === "PENDING"
                ? "You don't have any pending plans"
                : activeTab === "APPROVED"
                  ? "You don't have any approved plans yet"
                  : "Create your first plan to get started"}
            </p>
          </div>
        ) : (
          filteredPlans.map((plan) => <RepPlanCard key={plan.id} plan={plan} />)
        )}
      </div>


    </div>
  );
}
