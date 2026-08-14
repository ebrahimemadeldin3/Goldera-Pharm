"use client";

import { FileText } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { planTypeConfig, statusConfig } from "../../lib/constants";
import { Plan } from "@/features/plan/api/get";

type SupervisorOwnPlanCardProps = {
  plan: Plan;
};

export default function SupervisorOwnPlanCard({
  plan,
}: SupervisorOwnPlanCardProps) {
  return (
    <div className="border-secondary-light flex flex-wrap gap-4 rounded-2xl border-[0.8px] bg-white p-6">
      {/* Header */}
      <div className="gradient-blue flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px]">
        <FileText size={24} className="text-white" />
      </div>
      <div className="min-w-0 max-w-[828px] flex-1">
        <header className="flex flex-col items-start gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base/6 font-normal text-black">{plan.title}</h3>
            <span
              className={`rounded-md px-2 py-0.5 text-xs/4 font-medium text-white ${
                planTypeConfig[plan.planType].className
              }`}
            >
              {planTypeConfig[plan.planType].label}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-xs/4 font-medium text-white ${
                statusConfig[plan.status].className
              }`}
            >
              {statusConfig[plan.status].label}
            </span>
          </div>
          <p className="text-secondary-dark text-sm/5 font-normal">
            {plan.description}
          </p>
        </header>

        {/* Objectives */}
        <div className="mt-4">
          <p className="text-sm/5 font-medium text-black">Objectives:</p>
          <ul className="mt-2 space-y-1">
            {plan.objectives.map((objective, index) => (
              <li
                key={index}
                className="text-secondary-dark text-sm/5 font-normal"
              >
                {objective}
              </li>
            ))}
          </ul>
        </div>

        {/* Info Grid */}
        <div className="*:bg-secondary-very-light mt-4 grid grid-cols-1 gap-4 *:rounded-md *:p-2 sm:grid-cols-2">
          <div>
            <p className="text-secondary-dark text-xs/4 font-normal">Period</p>
            <p className="mt-1 text-sm/5 font-normal text-black">
              {format(new Date(plan.startDate), "MM/dd/yyyy")} -{" "}
              {format(new Date(plan.endDate), "MM/dd/yyyy")}
            </p>
          </div>
          <div>
            <p className="text-secondary-dark text-xs/4 font-normal">Created</p>
            <p className="mt-1 text-sm/5 font-normal text-black">
              {format(new Date(plan.createdAt), "MM/dd/yyyy")}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-secondary-dark text-xs/4 font-normal">
              Progress
            </p>
            <p className="text-xs/4 font-normal text-black">{plan.progress}%</p>
          </div>
          <Progress
            value={plan.progress}
            className="bg-secondary-light *:bg-dashboard-blue h-2"
          />
        </div>
      </div>
      <footer>
        <Button
          variant="outline"
          className="hover:bg-secondary-light border-secondary-light cursor-pointer border-[0.8px] text-sm/5 font-medium"
        >
          View Details
        </Button>
      </footer>
    </div>
  );
}
