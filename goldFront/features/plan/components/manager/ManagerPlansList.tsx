"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/utils/toast";
import type { VisitPlan } from "@/features/plan/api/get";
import { updatePlanStatusAction, rejectPlanAction } from "@/features/plan/api/handle";
import SupervisorPlanCard from "@/features/plan/components/supervisor/SupervisorPlanCard";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { ScopeInfoBanner } from "@/components/ui/ScopeInfoBanner";
import { ResultsFooter } from "@/components/ui/ResultsFooter";

type ManagerPlansListProps = {
  plans: VisitPlan[];
  page?: number;
  limit?: number;
  totalCount?: number;
};

type TabType = "all" | "PENDING" | "APPROVED" | "REJECTED";

export default function ManagerPlansList({
  plans = [],
  page = 1,
  limit = 10,
  totalCount = 0,
}: ManagerPlansListProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("PENDING");
  const [isPending, startTransition] = useTransition();

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

  const handleApprove = (planId: string) => {
    startTransition(async () => {
      const result = await updatePlanStatusAction(planId, "APPROVED");
      if (result.success) {
        toast.success({ title: "Plan approved successfully" });
        router.refresh();
      } else {
        toast.error({ title: result.error?.message || "Failed to approve plan" });
      }
    });
  };

  const handleReject = (planId: string, reason?: string) => {
    startTransition(async () => {
      const result = await rejectPlanAction(planId, reason);
      if (result.success) {
        toast.success({ title: "Plan rejected successfully" });
        router.refresh();
      } else {
        toast.error({ title: result.error?.message || "Failed to reject plan" });
      }
    });
  };

  const tabs: Array<{ id: TabType; label: string; count: number }> = [
    { id: "all", label: "All Plans", count: counts.all },
    { id: "PENDING", label: "Pending", count: counts.pending },
    { id: "APPROVED", label: "Approved", count: counts.approved },
    { id: "REJECTED", label: "Rejected", count: counts.rejected },
  ];

  return (
    <SectionContainer className="mt-6">
      {/* Tabs Header Toolbar */}
      <header className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">Team Plans</h2>
          {isPending && (
            <span className="text-xs font-normal text-slate-400">Updating...</span>
          )}
        </div>

        <div className="flex w-fit flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={isPending}
              className={`relative flex cursor-pointer items-center gap-2 rounded-lg border-[0.8px] px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "border-slate-200 bg-white text-slate-900 shadow-2xs"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
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

      {/* Scope-Honest Info Banner */}
      {activeTab !== "all" && (
        <ScopeInfoBanner onReset={() => setActiveTab("all")} resetLabel="Show all">
          Filtering currently loaded page slice by status (&quot;<strong className="text-slate-700 font-medium">{activeTab}</strong>&quot;).
          Showing {filteredPlans.length} of {plans.length} loaded plans.
        </ScopeInfoBanner>
      )}

      {/* Plans List Container */}
      <div className="space-y-4">
        {filteredPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No plans found matching filter &quot;{activeTab}&quot;
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Select &quot;All Plans&quot; tab to see all loaded visit plans
            </p>
          </div>
        ) : (
          filteredPlans.map((plan) => (
            <SupervisorPlanCard
              key={plan.id}
              plan={plan}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        )}
      </div>

      {/* Bottom Pagination Footer */}
      <ResultsFooter page={page} limit={limit} totalCount={totalCount} />
    </SectionContainer>
  );
}
