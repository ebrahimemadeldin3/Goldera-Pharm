"use client";
import Image from "next/image";
import Link from "next/link";
import {
  DollarSign,
  PackageSearch,
  FileCheck,
  Calendar,
  ChevronRight,
} from "lucide-react";
import pendingRequestsIcon from "@/features/dashboard/assets/icons/pendingRequests.svg";
import { DashboardRequest } from "@/features/dashboard/lib/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";

// Map request type to icon
const getRequestIcon = (type: string) => {
  switch (type) {
    case "EXPENSE":
      return <DollarSign size={14} />;
    case "SAMPLE":
      return <PackageSearch size={14} />;
    case "MARKETING":
      return <FileCheck size={14} />;
    case "LEAVE":
      return <Calendar size={14} />;
    default:
      return <FileCheck size={14} />;
  }
};

interface PendingRequestsProps {
  requests?: DashboardRequest[];
  requestsCount?: number;
  viewAllHref?: string;
}

export default function PendingRequests({
  requests = [],
  viewAllHref = "/manager/requests",
}: PendingRequestsProps) {
  // Get only pending requests (maximum 4 for display)
  const pendingRequests = requests
    .filter((req) => req.status === "PENDING")
    .slice(0, 4);

  return (
    <Card className="border-secondary-light rounded-[25px] border bg-white py-6 shadow-none">
      <CardHeader className="flex items-center gap-4 px-6">
        <div className="bg-system-primary flex h-10 w-10 items-center justify-center rounded-[15px]">
          <Image
            src={pendingRequestsIcon}
            alt="Pending requests"
            width={20}
            height={20}
          />
        </div>

        <div className="flex-1">
          <CardTitle className="text-[20px] font-semibold">
            Pending Requests
          </CardTitle>
        </div>
        <div className="bg-dashboard-red inline-flex size-[22px] items-center justify-center rounded-lg text-[12px] text-white">
          {pendingRequests.length}
        </div>
      </CardHeader>

      <CardContent className="">
        {pendingRequests.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            No pending requests
          </div>
        ) : (
          <ul className="divide-secondary-light divide-y">
            {pendingRequests.map((req) => (
              <li
                key={req.id}
                className="flex items-start justify-between py-4"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div
                    className="border-system-primary flex size-[26px] items-center justify-center rounded-md border bg-white"
                    aria-hidden
                  >
                    {/* icon uses currentColor; set wrapper color to gold */}
                    <span className="text-system-primary">
                      {getRequestIcon(req.type)}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-medium">{req.title}</div>
                    <div className="text-secondary-dark mt-1 text-xs">
                      {req.subject}
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex flex-col items-end">
                  <div
                    className={`text-xs font-semibold ${
                      req.urgency === "Priority"
                        ? "text-dashboard-red"
                        : "text-black"
                    }`}
                  >
                    {req.urgency}
                  </div>
                  <div className="text-secondary-dark mt-1 text-xs">
                    {format(new Date(req.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <CardFooter className="mt-auto">
        <Link
          href={viewAllHref}
          className="text-system-primary ml-auto inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          View All Requests
          <ChevronRight size={16} className="text-system-primary" />
        </Link>
      </CardFooter>
    </Card>
  );
}
