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
  repPlans,
  myPlans,
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

  const handleReject = (planId: string) => {
    startTransition(async () => {
      const result = await rejectPlanAction(planId);

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

  return (
    <div className="border-secondary-light mt-6 rounded-[14px] border-[0.8px] bg-white p-6">

            <div className="mt-6">
        <Pagination page={page} limit={limit} totalCount={totalCount} />
      </div>
      <div className="flex w-fit flex-wrap items-center gap-2 rounded-[14px] bg-[#F1F5F9] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            disabled={isPending}
            className={`relative flex cursor-pointer items-center gap-2 rounded-[14px] border-[0.8px] border-transparent px-2 py-1 text-sm/5 font-medium text-[#0F172A] transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
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

      <div className="mt-10 space-y-4">
        {displayPlans.length === 0 ? (
          <div className="border-secondary-light flex flex-col items-center justify-center rounded-2xl border-[0.8px] bg-white p-12 text-center">
            <p className="text-secondary-dark text-base/6 font-normal">
              No plans found
            </p>
            <p className="text-secondary-dark mt-2 text-sm/5 font-normal">
              {activeTab === "repPlans"
                ? "No plans submitted by reps for approval"
                : "You don't have any plans yet"}
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


    </div>
  );
}
