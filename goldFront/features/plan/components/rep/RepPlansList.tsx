"use client";

import { useState, useMemo } from "react";
import Pagination from "@/components/ui/Pagination";
import RepPlanCard from "./RepPlanCard";
import { VisitPlan } from "@/features/plan/api/get";
import { RotateCcw } from "lucide-react";

type PlansListProps = {
  plans: VisitPlan[];
  page?: number;
  limit?: number;
  totalCount?: number;
};

type TabType = "all" | "PENDING" | "APPROVED";

export default function RepPlansList({
  plans = [],
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
    { id: "all", label: "All Plans", count: counts.all },
    { id: "PENDING", label: "Pending Approval", count: counts.pending },
    { id: "APPROVED", label: "Approved", count: counts.approved },
  ];

  const startItem = totalCount > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, totalCount);

  return (
    <section className="border-secondary-light mt-6 rounded-[14px] border-[0.8px] bg-white p-5 sm:p-6">
      {/* Directory Toolbar Header */}
      <header className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 shrink-0">
          <h2 className="text-xl font-semibold text-black">My Plans Directory</h2>
        </div>

        {/* Tabs */}
        <div className="flex w-fit flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex cursor-pointer items-center gap-2 rounded-lg border-[0.8px] px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "border-slate-200 bg-white text-slate-900 shadow-2xs"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1.5 text-[11px] font-medium ${
                    tab.id === "PENDING"
                      ? "bg-amber-100 text-amber-800"
                      : tab.id === "APPROVED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Scope-Honest Filter Info Pill */}
      {activeTab !== "all" && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/70 px-3.5 py-2 text-xs text-blue-700">
          <span>
            Filtering currently loaded page slice by status (&quot;<strong>{activeTab}</strong>&quot;).
            Showing {filteredPlans.length} of {plans.length} loaded plans.
          </span>
          <button
            onClick={() => setActiveTab("all")}
            className="font-medium underline hover:text-blue-900 cursor-pointer inline-flex items-center gap-1"
          >
            <RotateCcw size={12} />
            Show all
          </button>
        </div>
      )}

      {/* Plans List */}
      <div className="space-y-4">
        {filteredPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No {activeTab !== "all" ? activeTab.toLowerCase() : ""} plans found on page {page}.
            </p>
            {activeTab !== "all" && (
              <button
                onClick={() => setActiveTab("all")}
                className="mt-2 text-xs text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer font-medium"
              >
                <RotateCcw size={12} />
                Reset status filter
              </button>
            )}
          </div>
        ) : (
          filteredPlans.map((plan) => <RepPlanCard key={plan.id} plan={plan} />)
        )}
      </div>

      {/* Bottom Footer Pagination */}
      <footer className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
        <p className="text-secondary-dark text-xs font-normal">
          Showing <span className="font-medium text-slate-700">{startItem}</span> to{" "}
          <span className="font-medium text-slate-700">{endItem}</span> of{" "}
          <span className="font-medium text-slate-700">{totalCount}</span> plans
        </p>
        <Pagination page={page} limit={limit} totalCount={totalCount} />
      </footer>
    </section>
  );
}
