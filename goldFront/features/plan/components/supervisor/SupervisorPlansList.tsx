"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/utils/toast";
import type { VisitPlan } from "@/features/plan/api/get";
import { updatePlanStatusAction, rejectPlanAction } from "@/features/plan/api/handle";
import SupervisorPlanCard from "./SupervisorPlanCard";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";

type SupervisorPlansListProps = {
  plans?: VisitPlan[] | Record<string, unknown>[];
  myPlans?: VisitPlan[] | Record<string, unknown>[];
  repPlans?: VisitPlan[] | Record<string, unknown>[];
  page?: number;
  limit?: number;
  totalCount?: number;
};

type TabType = "all" | "myPlans" | "repPlans";

export default function SupervisorPlansList({
  plans,
  myPlans,
  repPlans = [],
  page = 1,
  limit = 10,
  totalCount = 0,
}: SupervisorPlansListProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isPending, startTransition] = useTransition();

  const ownPlans = useMemo(() => plans || myPlans || [], [plans, myPlans]);

  const allCombined = useMemo(() => {
    return [...ownPlans, ...repPlans];
  }, [ownPlans, repPlans]);

  const displayPlans = useMemo(() => {
    if (activeTab === "myPlans") return ownPlans;
    if (activeTab === "repPlans") return repPlans;
    return allCombined;
  }, [activeTab, ownPlans, repPlans, allCombined]);

  const counts = useMemo(
    () => ({
      all: allCombined.length,
      myPlans: ownPlans.length,
      repPlans: repPlans.length,
    }),
    [allCombined, ownPlans, repPlans],
  );

  const tabs: Array<{ id: TabType; label: string; count: number }> = [
    { id: "all", label: "All Plans", count: counts.all },
    { id: "myPlans", label: "My Plans", count: counts.myPlans },
    { id: "repPlans", label: "Team Rep Plans", count: counts.repPlans },
  ];

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

  return (
    <SectionContainer className="mt-6 p-0 overflow-hidden border border-[#E5E8EF] rounded-[16px] bg-white shadow-none">
      {/* Tabs Header Toolbar */}
      <header className="flex flex-col gap-4 border-b border-[#EEF1F6] bg-[#FBFCFE]/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 shrink-0">
          <h2 className="text-base font-semibold text-[#182033]">Plans Directory</h2>
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
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                    activeTab === tab.id
                      ? "bg-[#C9A44C] text-[#182033]"
                      : "bg-[#FFF8E5] text-[#8A6515] border border-[#F5DFAC]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Plans List Container */}
      <div className="space-y-4 p-5">
        {displayPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-[#E5E8EF] bg-[#F9FAFB] p-10 text-center">
            <p className="text-sm font-semibold text-[#182033]">
              No plans found
            </p>
            <p className="text-xs text-[#667085] mt-1">
              {activeTab === "repPlans"
                ? "No plans submitted by reps for approval on page " + page
                : "No visit plans available"}
            </p>
          </div>
        ) : (
          displayPlans.map((plan) => (
            <SupervisorPlanCard
              key={(plan as { id: string }).id}
              plan={plan as VisitPlan}
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
        ariaLabel="Plans directory pagination"
      />
    </SectionContainer>
  );
}
