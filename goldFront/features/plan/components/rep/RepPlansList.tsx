"use client";

import { useMemo, useState } from "react";
import type { VisitPlan } from "@/features/plan/api/get";
import RepPlanCard from "./RepPlanCard";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { ScopeInfoBanner } from "@/components/ui/ScopeInfoBanner";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";

type RepPlansListProps = {
  plans: VisitPlan[];
  page?: number;
  limit?: number;
  totalCount?: number;
};

type TabType = "all" | "PENDING" | "APPROVED" | "REJECTED";

export default function RepPlansList({
  plans = [],
  page = 1,
  limit = 10,
  totalCount = 0,
}: RepPlansListProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const counts = useMemo(
    () => ({
      all: plans.length,
      pending: plans.filter((p) => p.status === "PENDING").length,
      approved: plans.filter((p) => p.status === "APPROVED").length,
      rejected: plans.filter((p) => p.status === "REJECTED").length,
    }),
    [plans],
  );

  const filteredPlans = useMemo(() => {
    if (activeTab === "all") {
      return plans;
    }
    return plans.filter((p) => p.status === activeTab);
  }, [activeTab, plans]);

  const tabs: Array<{ id: TabType; label: string; count?: number }> = [
    { id: "all", label: "All Plans", count: counts.all },
    { id: "PENDING", label: "Pending", count: counts.pending },
    { id: "APPROVED", label: "Approved", count: counts.approved },
    { id: "REJECTED", label: "Rejected", count: counts.rejected },
  ];

  return (
    <SectionContainer className="mt-6">
      {/* Directory Toolbar Header */}
      <header className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">My Plans Directory</h2>
        </div>

        {/* Tabs */}
        <div className="flex w-fit flex-wrap items-center gap-1.5 rounded-[12px] bg-[#F6F8FB] p-1 border border-[#E5E8EF]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            const activeClass =
              tab.id === "PENDING"
                ? "bg-[#FFF8E5] border-[#E9DDB8] text-[#B18732]"
                : tab.id === "APPROVED"
                ? "bg-[#E9F8F1] border-[#CBEFDD] text-[#168557]"
                : tab.id === "REJECTED"
                ? "bg-[#FEF3F2] border-[#FECDCA] text-[#D92D20]"
                : "bg-[#E9F8F1] border-[#CBEFDD] text-[#168557]";

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex cursor-pointer items-center gap-2 rounded-[9px] px-3 py-1.5 text-xs font-semibold transition-all border ${
                  isActive
                    ? `${activeClass} shadow-2xs`
                    : "bg-white border-[#E5E8EF] text-[#667085] hover:text-[#182033] hover:border-[#DDE3EE]"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                      tab.id === "PENDING"
                        ? "bg-[#FFF8E5] text-[#B18732] border border-[#E9DDB8]"
                        : tab.id === "APPROVED"
                        ? "bg-[#E9F8F1] text-[#168557] border border-[#CBEFDD]"
                        : tab.id === "REJECTED"
                        ? "bg-[#FEF3F2] text-[#D92D20] border border-[#FECDCA]"
                        : "bg-[#F6F8FB] text-[#344054] border border-[#E5E8EF]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Scope-Honest Filter Info Banner */}
      {activeTab !== "all" && (
        <ScopeInfoBanner onReset={() => setActiveTab("all")} resetLabel="Show all">
          Filtering currently loaded page slice by status (&quot;<strong className="text-slate-700 font-medium">{activeTab}</strong>&quot;).
          Showing {filteredPlans.length} of {plans.length} loaded plans.
        </ScopeInfoBanner>
      )}

      {/* Plans List: 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filteredPlans.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No plans found matching status &quot;{activeTab}&quot;
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Select &quot;All Plans&quot; tab to see all your visit plans on page {page}
            </p>
          </div>
        ) : (
          filteredPlans.map((plan) => (
            <RepPlanCard key={plan.id} plan={plan} />
          ))
        )}
      </div>

      {/* Bottom Pagination Footer */}
      <TablePaginationFooter
        page={page}
        limit={limit}
        totalCount={totalCount}
        itemLabel="plans"
        ariaLabel="Plans pagination"
        pageNavAriaLabel="Plan pages"
      />
    </SectionContainer>
  );
}
