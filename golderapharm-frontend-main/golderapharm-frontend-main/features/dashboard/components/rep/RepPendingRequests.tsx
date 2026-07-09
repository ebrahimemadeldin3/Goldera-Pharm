import {
  DollarSign,
  PackageSearch,
  FileCheck,
  Calendar,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { DashboardRequest } from "@/features/dashboard/lib/types";
import { format } from "date-fns";

// Map request type to icon
const getRequestIcon = (type: string) => {
  switch (type) {
    case "EXPENSE":
      return <DollarSign size={16} />;
    case "SAMPLE":
      return <PackageSearch size={16} />;
    case "MARKETING":
      return <FileCheck size={16} />;
    case "LEAVE":
      return <Calendar size={16} />;
    default:
      return <FileCheck size={16} />;
  }
};

interface RepPendingRequestsProps {
  requests?: DashboardRequest[];
  pendingRequestsCount?: number;
}

export default function RepPendingRequests({
  requests = [],
  pendingRequestsCount = 0,
}: RepPendingRequestsProps) {
  // Filter pending requests and take max 4
  const pendingRequests = requests
    .filter((req) => req.status === "PENDING")
    .slice(0, 4);
  return (
    <div className="border-secondary-light relative flex flex-col rounded-[25px] border-[0.8px] bg-white p-6">
      <h2 className="text-lg/[28px] font-normal text-black">
        Pending Requests
      </h2>
      <p className="absolute right-5 flex size-5.5 items-center justify-center rounded-lg bg-red-500 text-xs/4 font-normal text-white">
        {pendingRequests.length}
      </p>
      {pendingRequests.length === 0 ? (
        <div className="mt-2 py-8 text-center text-sm text-gray-500">
          No pending requests
        </div>
      ) : (
        <div className="divide-secondary-dark mt-2 space-y-0 divide-y">
          {pendingRequests.map((req) => (
            <div key={req.id} className="flex items-start justify-between py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-teal-500 bg-white">
                  <span className="text-teal-500">
                    {getRequestIcon(req.type)}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-black">
                    {req.title}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {req.subject}
                  </div>
                </div>
              </div>
              <div className="ml-4 flex flex-col items-end">
                <div
                  className={`text-xs font-semibold ${
                    req.urgency === "Priority" ? "text-red-500" : "text-black"
                  }`}
                >
                  {req.urgency}
                </div>
                <div className="mt-0.5 text-xs text-gray-400">
                  {format(new Date(req.createdAt), "MMM d, yyyy")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end">
        <Link
          href="/rep/requests"
          className="text-dashboard-green inline-flex items-center gap-1 text-sm/[21px] font-medium hover:underline"
        >
          View All Requests
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
