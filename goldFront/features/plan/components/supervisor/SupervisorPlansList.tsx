"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/utils/toast";
import Pagination from "@/components/ui/Pagination";
import SupervisorPlanCard from "./SupervisorPlanCard";
import SupervisorOwnPlanCard from "./SupervisorOwnPlanCard";
import { Plan, VisitPlan } from "@/features/plan/api/get";
import {
  approvePlanAction,
  rejectPlanAction,
} from "@/features/plan/api/handle";

type SupervisorPlansListProps = {
  repPlans: VisitPlan[];
  myPlans: Plan[];
  page?: number;
  limit?: number;
  totalCount?: number;
};

type TabType = "repPlans" | "myPlans";

export default function SupervisorPlansList({
  repPlans = [],
  myPlans = [],
  page = 1,
  limit = 10,
  totalCount = 0,
}: SupervisorPlansListProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("repPlans");
  const [isPending, startTransition] = useTransition();

  const pendingCount = useMemo(() => {
    return repPlans.filter((p) => p.status === "PENDING").length;
  }, [repPlans]);

  const tabs: Array<{ id: TabType; label: string; count?: number }> = [
    { id: "repPlans", label: "Rep Plans to Approve", count: pendingCount },
    { id: "myPlans", label: "My Plans" },
  ];

  const displayPlans = activeTab === "repPlans" ? repPlans : myPlans;

  const handleApprove = (planId: string) => {
    startTransition(async () => {
      const result = await approvePlanAction(planId);

      if (result.success) {
        toast.success({ title: "Plan approved successfully" });
        router.refresh();
      } else {
        toast.error({
          title: "Failed to approve plan",
          description: result.error?.message || "Please try again",
        });
      }
    });
  };

  const handleReject = (planId: string, feedback?: string) => {
    startTransition(async () => {
      const result = await rejectPlanAction(planId, feedback);

      if (result.success) {
        toast.success({ title: "Plan rejected successfully" });
        router.refresh();
      } else {
        toast.error({
          title: "Failed to reject plan",
          description: result.error?.message || "Please try again",
        });
      }
    });
  };

  const startItem = totalCount > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, totalCount);

  return (
    <section className="border-secondary-light mt-6 rounded-[14px] border-[0.8px] bg-white p-5 sm:p-6">
      {/* Tabs Header Toolbar */}
      <header className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 shrink-0">
          <h2 className="text-xl font-semibold text-black">Plans Directory</h2>
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
              className={`relative flex cursor-pointer items-center gap-2 rounded-lg border-[0.8px] px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-60 ${
                activeTab === tab.id
                  ? "border-slate-200 bg-white text-slate-900 shadow-2xs"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-[11px] font-medium text-amber-800">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Plans List Container */}
      <div className="space-y-4">
        {displayPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No plans found
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === "repPlans"
                ? "No plans submitted by reps for approval on page " + page
                : "You don't have any personal plans on page " + page}
            </p>
          </div>
        ) : activeTab === "repPlans" ? (
          displayPlans.map((plan) => (
            <SupervisorPlanCard
              key={plan.id}
              plan={plan as VisitPlan}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        ) : (
          displayPlans.map((plan) => (
            <SupervisorOwnPlanCard key={plan.id} plan={plan as Plan} />
          ))
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
