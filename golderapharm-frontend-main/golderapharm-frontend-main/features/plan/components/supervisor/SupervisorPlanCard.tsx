"use client";

import { CheckCircle, Stethoscope } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getInitials } from "@/lib/utils";
import { planTypeConfig, statusConfig } from "../../lib/constants";
import { VisitPlan } from "@/features/plan/api/get";
import { groupSelectedDoctorsByDay } from "../../lib/utils";

type SupervisorPlanCardProps = {
  plan: VisitPlan;
  onApprove: (planId: string) => void;
  onReject: (planId: string) => void;
};

export default function SupervisorPlanCard({
  plan,
  onApprove,
  onReject,
}: SupervisorPlanCardProps) {
  const repName = plan.rep?.name || "Unknown Rep";
  const doctorGroups = groupSelectedDoctorsByDay(plan.selectedDoctors);
  const selectedDoctorsCount = doctorGroups.reduce(
    (count, group) => count + group.doctors.length,
    0,
  );

  return (
    <div className="border-secondary-light flex gap-4 rounded-2xl border-[0.8px] bg-white p-6">
      <div
        className={`gradient-green flex h-12 w-12 shrink-0 items-center justify-center rounded-full`}
      >
        <span className="text-base/6 font-normal text-white">
          {getInitials(repName)}
        </span>
      </div>
      <main className="max-w-[828px] flex-1">
        <header className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
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
          <p className="mt-1 text-sm/5 font-normal text-black">
            Rep:
            <span className="text-secondary-dark">{repName}</span>
          </p>
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
        <div className="*:bg-secondary-very-light mt-4 flex items-center gap-4 *:w-[169px] *:rounded-md *:p-2">
          <div>
            <p className="text-secondary-dark text-xs/4 font-normal">
              Target Doctors
            </p>
            <p className="mt-1 text-sm/5 font-normal text-black">
              {plan.targetDoctors || 0}
            </p>
          </div>
          <div>
            <p className="text-secondary-dark text-xs/4 font-normal">
              Target Visits
            </p>
            <p className="mt-1 text-sm/5 font-normal text-black">
              {plan.targetVisits || 0}
            </p>
          </div>
          <div>
            <p className="text-secondary-dark text-xs/4 font-normal">
              Start Date
            </p>
            <p className="mt-1 text-sm/5 font-normal text-black">
              {format(new Date(plan.startDate), "MM/dd/yyyy")}
            </p>
          </div>
          <div>
            <p className="text-secondary-dark text-xs/4 font-normal">
              End Date
            </p>
            <p className="mt-1 text-sm/5 font-normal text-black">
              {format(new Date(plan.endDate), "MM/dd/yyyy")}
            </p>
          </div>
        </div>

        {/* Progress Bar (if progress is available) */}
        {plan.progress !== undefined && (
          <div className="mt-4">
            <p className="mb-2 flex items-center justify-between">
              <span className="text-secondary-dark text-xs/4 font-normal">
                Progress
              </span>
              <span className="text-xs/4 font-normal text-black">
                {plan.progress}%
              </span>
            </p>
            <Progress
              value={plan.progress}
              className="bg-secondary-light *:bg-dashboard-green h-2"
            />
          </div>
        )}

        {/* Selected Doctors */}
        {plan.selectedDoctors && plan.selectedDoctors.length > 0 && (
          <div className="mt-4">
            <p className="mb-3 text-sm/5 font-normal text-black">
              Selected Doctors: {selectedDoctorsCount} selected
            </p>
            <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
              {doctorGroups.map((group) => (
                <div key={`${plan.id}-${group.day}`}>
                  <p className="text-secondary-dark mb-2 text-xs/4 font-medium">
                    {group.day === "No Date"
                      ? "No Date"
                      : format(new Date(group.day), "EEE, MMM d, yyyy")}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {group.doctors.map((doctor) => (
                      <div
                        key={`${group.day}-${doctor.id}`}
                        className="border-green-stroke flex w-full max-w-[240px] flex-col gap-1.5 rounded-md border-[0.8px] bg-[#F0FDF4] p-3"
                      >
                        <div className="flex items-start gap-2">
                          <Stethoscope
                            size={14}
                            className="text-dashboard-green mt-0.5 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm/5 font-normal text-black">
                              {doctor.nameEN} - {doctor.nameAR}
                            </p>
                            <p className="text-secondary-dark truncate text-xs/4 font-normal">
                              {doctor.accountName || "Unassigned hospital"}
                            </p>
                          </div>
                        </div>
                        {/* <p className="text-secondary-dark truncate text-xs/4 font-normal">
                          {doctor.specialty || "Specialty not set"}
                        </p> */}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons (for pending plans) */}
      </main>
      {plan.status === "PENDING" && (
        <div className="flex w-[97px] flex-col items-center gap-3 *:w-full">
          <Button
            onClick={() => onApprove(plan.id)}
            className="bg-dashboard-green border-dashboard-green hover:text-dashboard-green cursor-pointer border text-white transition-colors hover:bg-white"
          >
            <CheckCircle size={16} className="" />
            Approve
          </Button>
          <Button
            variant="outline"
            onClick={() => onReject(plan.id)}
            className="border-dashboard-red text-dashboard-red hover:bg-dashboard-red cursor-pointer transition-colors hover:text-white"
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}
