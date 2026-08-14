import { Calendar, CheckCircle2, Stethoscope } from "lucide-react";
import { format } from "date-fns";
import { planTypeConfig, statusConfig } from "../../lib/constants";
import { VisitPlan } from "@/features/plan/api/get";
import { groupSelectedDoctorsByDay } from "../../lib/utils";

type PlanCardProps = {
  plan: VisitPlan;
};

export default function RepPlanCard({ plan }: PlanCardProps) {
  const doctorGroups = groupSelectedDoctorsByDay(plan.selectedDoctors);
  const selectedDoctorsCount = doctorGroups.reduce(
    (count, group) => count + group.doctors.length,
    0,
  );

  return (
    <div className="border-secondary-light flex gap-4 rounded-[10px] border-[0.8px] bg-white p-6">
      {/* Header */}
      <div className="gradient-green flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px]">
        <Calendar size={24} className="text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <header className="flex items-start gap-4">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center justify-start gap-2">
              <h3 className="text-base/6 font-normal text-[#0F172A]">
                {plan.title}
              </h3>
              <div className="flex items-center gap-2">
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
            </div>
            <p className="text-secondary-dark text-sm/5 font-normal">
              {plan.description}
            </p>
          </div>
        </header>

        {/* Info Grid */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-secondary-very-light rounded-md p-2">
            <p className="text-secondary-dark text-xs/4 font-normal">Period</p>
            <p className="mt-1 text-sm/5 font-normal text-[#0F172A]">
              {format(new Date(plan.startDate), "MM/dd/yyyy")} -{" "}
              {format(new Date(plan.endDate), "MM/dd/yyyy")}
            </p>
          </div>
          <div className="bg-secondary-very-light rounded-md p-2">
            <p className="text-secondary-dark text-xs/4 font-normal">Doctors</p>
            <p className="mt-1 text-sm/5 font-normal text-[#0F172A]">
              {selectedDoctorsCount} selected
            </p>
          </div>
          <div className="bg-secondary-very-light rounded-md p-2">
            <p className="text-secondary-dark text-xs/4 font-normal">
              Target Visits
            </p>
            <p className="mt-1 text-sm/5 font-normal text-[#0F172A]">
              {plan.targetVisits ?? 0}
            </p>
          </div>
          <div className="bg-secondary-very-light rounded-md p-2">
            <p className="text-secondary-dark text-xs/4 font-normal">
              Submitted
            </p>
            <p className="mt-1 text-sm/5 font-normal text-[#0F172A]">
              {format(new Date(plan.submittedDate), "MM/dd/yyyy")}
            </p>
          </div>
        </div>

        {/* Objectives */}
        <div className="mt-4">
          <p className="text-sm/5 font-medium text-black">Objectives:</p>
          <ul className="text-secondary-dark mt-2 space-y-1">
            {plan.objectives.map((objective, index) => (
              <li key={index} className="text-sm/5 font-normal">
                {objective}
              </li>
            ))}
          </ul>
        </div>

        {/* Selected Doctors */}
        <div className="mt-4">
          <p className="mb-3 text-sm/5 font-normal text-black">
            Selected Doctors:
          </p>
          <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
            {doctorGroups.map((group) => (
              <div key={`${plan.id}-${group.day}`}>
                <p className="text-secondary-dark mb-2 text-xs/4 font-medium">
                  {group.day === "No Date"
                    ? "No Date"
                    : format(new Date(group.day), "EEE, MMM d, yyyy")}
                </p>
                <div className="flex flex-wrap gap-4">
                  {group.doctors.map((doctor) => (
                    <div
                      key={`${group.day}-${doctor.id}`}
                      className="border-green-stroke flex w-full max-w-[265px] flex-col gap-1.5 rounded-md border-[0.8px] bg-[#F0FDF4] p-3"
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

        {/* Supervisor Feedback */}
        {plan.supervisorFeedback && (
          <div className="border-dashboard-green mt-4 rounded-[10px] border-l-4 bg-[#F0FDF4] p-4">
            <div className="mb-1 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-dashboard-green" />
              <p className="text-sm/5 font-normal text-black">
                Supervisor Feedback:
              </p>
            </div>
            <p className="text-secondary-dark text-sm/5 font-normal">
              {plan.supervisorFeedback.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
