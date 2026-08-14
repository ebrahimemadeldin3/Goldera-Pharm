"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/utils/toast";
import Pagination from "@/components/ui/Pagination";
import type { VisitPlan } from "@/features/plan/api/get";
import { updatePlanStatusAction } from "@/features/plan/api/handle";
import SupervisorPlanCard from "@/features/plan/components/supervisor/SupervisorPlanCard";

type ManagerPlansListProps = {
  plans: VisitPlan[];
  page?: number;
  limit?: number;
  totalCount?: number;
};

type TabType = "all" | "PENDING" | "APPROVED" | "REJECTED";

export default function ManagerPlansList({
  plans,
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
        toast.error({
          title: "Failed to approve plan",
          description: result.error?.message || "Please try again",
        });
      }
    });
  };

  const handleReject = (planId: string) => {
    startTransition(async () => {
      const result = await updatePlanStatusAction(planId, "REJECTED");

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

  const tabs: Array<{ id: TabType; label: string; count: number }> = [
    { id: "all", label: "All Plans", count: counts.all },
    { id: "PENDING", label: "Pending", count: counts.pending },
    { id: "APPROVED", label: "Approved", count: counts.approved },
    { id: "REJECTED", label: "Rejected", count: counts.rejected },
  ];

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
            {tab.count > 0 && (
              <span className="bg-dashboard-red flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs/4 font-medium text-white">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-10 space-y-4">
        {filteredPlans.length === 0 ? (
          <div className="border-secondary-light flex flex-col items-center justify-center rounded-2xl border-[0.8px] bg-white p-12 text-center">
            <p className="text-secondary-dark text-base/6 font-normal">
              No plans found
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


    </div>
  );
}
