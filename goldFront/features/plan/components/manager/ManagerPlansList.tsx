"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/utils/toast";
import type { VisitPlan } from "@/features/plan/api/get";
import { updatePlanStatusAction, rejectPlanAction } from "@/features/plan/api/handle";
import SupervisorPlanCard from "@/features/plan/components/supervisor/SupervisorPlanCard";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { ScopeInfoBanner } from "@/components/ui/ScopeInfoBanner";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";

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
    <SectionContainer className="mt-6 p-0 overflow-hidden border border-[#E5E8EF] rounded-[16px] bg-white shadow-none">
      {/* Tabs Header Toolbar */}
      <header className="flex flex-col gap-4 border-b border-[#EEF1F6] bg-[#FBFCFE]/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 shrink-0">
          <h2 className="text-base font-semibold text-[#182033]">Team Plans</h2>
          {isPending && (
            <span className="text-xs font-medium text-[#8A94A6]">Updating...</span>
          )}
        </div>

        <div className="flex w-fit flex-wrap items-center gap-1.5 rounded-[12px] bg-[#F6F8FB] border border-[#E5E8EF] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={isPending}
              className={`relative flex cursor-pointer items-center gap-2 rounded-[9px] px-3.5 py-1.5 text-xs font-semibold transition-all disabled:opacity-60 ${
                activeTab === tab.id
                  ? "bg-[#FFF8E5] text-[#8A6515] border border-[#E9DDB8] shadow-2xs"
                  : "bg-white border border-transparent text-[#667085] hover:text-[#182033]"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                    tab.id === "PENDING"
                      ? "bg-[#FFF8E5] text-[#8A6515] border border-[#F5DFAC]"
                      : tab.id === "APPROVED"
                      ? "bg-[#E9F8F1] text-[#168557] border border-[#CBEFDD]"
                      : tab.id === "REJECTED"
                      ? "bg-[#FFF1F0] text-[#B42318] border border-[#F5C9C5]"
                      : "bg-[#F6F8FB] text-[#667085] border border-[#E5E8EF]"
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
        <div className="px-5 pt-4">
          <ScopeInfoBanner onReset={() => setActiveTab("all")} resetLabel="Show all">
            Filtering currently loaded page slice by status (&quot;<strong className="text-[#182033] font-semibold">{activeTab}</strong>&quot;).
            Showing {filteredPlans.length} of {plans.length} loaded plans.
          </ScopeInfoBanner>
        </div>
      )}

      {/* Plans List Container */}
      <div className="space-y-4 p-5">
        {filteredPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-[#E5E8EF] bg-[#F9FAFB] p-10 text-center">
            <p className="text-sm font-semibold text-[#182033]">
              No plans found matching filter &quot;{activeTab}&quot;
            </p>
            <p className="text-xs text-[#667085] mt-1">
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
      <TablePaginationFooter
        page={page}
        limit={limit}
        totalCount={totalCount}
        itemLabel="plans"
        ariaLabel="Manager plans directory pagination"
      />
    </SectionContainer>
  );
}
