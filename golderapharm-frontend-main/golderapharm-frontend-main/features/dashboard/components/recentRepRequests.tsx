"use client";

import Image from "next/image";
import recentRepRequestsIcon from "@/features/dashboard/assets/icons/recentRepRequests.svg";
import { DashboardPlan } from "@/features/dashboard/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { getInitials } from "@/lib/utils";

interface RecentRepRequestsProps {
  plans?: DashboardPlan[];
  viewAllHref?: string;
}

// Map plan status to display status
const getStatusColor = (status: string) => {
  switch (status) {
    case "APPROVED":
      return "bg-dashboard-green";
    case "REJECTED":
      return "bg-dashboard-red";
    case "PENDING":
      return "bg-dashboard-orange";
    default:
      return "bg-dashboard-orange";
  }
};

export default function RecentRepRequests({
  plans = [],
  viewAllHref = "/manager/plan",
}: RecentRepRequestsProps) {
  // Get only the latest 3 plans
  const recentPlans = plans.slice(0, 3);

  return (
    <Card className="border-secondary-light rounded-[25px] border bg-white py-6 shadow-none">
      <CardHeader className="flex items-center gap-4">
        <div className="bg-system-primary flex size-11 items-center justify-center rounded-[15px]">
          <Image
            src={recentRepRequestsIcon}
            alt="recent rep plans"
            width={24}
            height={24}
          />
        </div>
        <CardTitle className="text-[20px] font-semibold">
          Recent Plans
        </CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="mt-6 rounded-lg bg-white">
        {recentPlans.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            No recent plans
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {recentPlans.map((plan) => (
              <li key={plan.id}>
                <div className="flex w-full flex-col items-start">
                  <div className="flex gap-4">
                    <div className="from-dashboard-green flex size-10 items-center justify-center rounded-full bg-linear-to-b to-[#1E8A35] text-[17px] text-white">
                      {getInitials(plan.title)}
                    </div>
                    <div className="">
                      <div className="text-[17px] text-black">{plan.title}</div>
                      <div className="text-secondary-dark text-[15px]">
                        {plan.type} • {plan.targetDoctors} doctors •{" "}
                        {plan.targetVisits} visits
                      </div>
                      <div className="text-secondary-dark mt-1 text-xs">
                        {format(new Date(plan.createdAt), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`w-[76px] self-end rounded-full py-1 text-center text-xs text-white ${getStatusColor(
                      plan.status,
                    )}`}
                  >
                    {plan.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="mt-4 text-center">
        <Link
          href={viewAllHref}
          className="text-system-primary ml-auto inline-flex items-center gap-1 text-sm font-medium hover:underline"
        >
          View All Plans
          <ChevronRight className="size-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
