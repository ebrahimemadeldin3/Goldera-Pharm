"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TRequest } from "@/features/requests/lib/types";
import { toast } from "@/lib/utils/toast";
import Pagination from "@/components/ui/Pagination";
import {
  getStatusBadgeStyle,
  getResponseBgStyle,
} from "@/features/requests/lib/utils/submitRequest";
import {
  Calendar,
  Clock,
  AlertCircle,
  FileText,
  UserRound,
  ExternalLink,
  Copy,
} from "lucide-react";
import { format } from "date-fns";

interface RequestHistoryProps {
  requests: TRequest[];
  page?: number;
  limit?: number;
  totalCount?: number;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch {
    return "Invalid date";
  }
};

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  } catch {
    return "Invalid date";
  }
};

const getUrgencyColor = (urgency: string) => {
  switch (urgency.toLowerCase()) {
    case "priority":
      return "bg-dashboard-red text-white border-dashboard-red";
    case "high":
      return "bg-dashboard-orange text-white border-dashboard-orange";
    case "medium":
      return "bg-dashboard-blue text-white border-dashboard-blue";
    case "low":
      return "bg-gray-400 text-white border-gray-400";
    default:
      return "bg-gray-400 text-white border-gray-400";
  }
};

const renderText = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "string" && value.trim() === "") return "N/A";
  return String(value);
};

const formatMoney = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value));
};

const getRoleFromPathname = (
  pathname: string,
): "manager" | "supervisor" | "rep" => {
  if (pathname.startsWith("/manager")) return "manager";
  if (pathname.startsWith("/supervisor")) return "supervisor";
  return "rep";
};

const getUserProfileHref = (
  role: "manager" | "supervisor" | "rep",
  id: string,
) => {
  if (role === "rep") return "/rep/profile";
  return `/${role}/team/${id}`;
};

const getDoctorProfileHref = (
  role: "manager" | "supervisor" | "rep",
  id: string,
) => `/${role}/doctors/${id}`;

export default function RequestHistory({
  requests,
  page = 1,
  limit = 10,
  totalCount = 0,
}: RequestHistoryProps) {
  const pathname = usePathname();
  const role = getRoleFromPathname(pathname);

  useEffect(() => {
    // Keep full request payload visible for debugging without cluttering the UI.
    console.log("[RequestHistory] full requests payload", requests);
  }, [requests]);

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success({
        title: "Link copied",
        description: "File URL copied to clipboard",
      });
    } catch {
      toast.error({
        title: "Copy failed",
        description: "Could not copy file URL",
      });
    }
  };

  return (
    <main className="space-y-4">
      <h2 className="text-[28px]/8 font-normal text-black">Request History</h2>

      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="space-y-4 rounded-md border-[0.8px] bg-white p-8"
          >
            {/* Request Header */}
            <div className="flex items-center gap-3">
              <h3 className="text-base/6 font-normal text-black">
                {request.title}
              </h3>
              <span className="border-dashboard-blue text-dashboard-blue rounded-md border-[0.8px] px-3 py-1 text-xs/4 font-medium">
                {request.type}
              </span>
              <span
                className={`rounded-md border-[0.8px] px-2 py-0.5 text-xs/4 font-medium ${getUrgencyColor(request.urgency)}`}
              >
                {request.urgency}
              </span>
              <span
                className={`${getStatusBadgeStyle(request.status)} rounded-full px-2 py-1 text-xs/4 font-medium capitalize`}
              >
                {request.status}
              </span>
            </div>

            {/* Subject */}
            {request.subject && (
              <p className="text-sm/5 font-medium text-black">
                Subject: <span className="font-normal">{request.subject}</span>
              </p>
            )}

            {/* Core metadata */}
            <div className="bg-secondary-very-light grid grid-cols-2 gap-2 rounded-md p-4 text-sm/5 text-black">
              <p>
                <span className="font-medium">Request ID:</span> {request.id}
              </p>
              <p>
                <span className="font-medium">User ID:</span>{" "}
                {request.userId ? (
                  <Link
                    href={getUserProfileHref(role, request.userId)}
                    className="text-dashboard-blue hover:underline"
                  >
                    {request.userId}
                  </Link>
                ) : (
                  "N/A"
                )}
              </p>
              <p>
                <span className="font-medium">Created At:</span>{" "}
                {formatDateTime(request.submittedDate)}
              </p>
              <p>
                <span className="font-medium">Updated At:</span>{" "}
                {formatDateTime(request.updatedAt ?? null)}
              </p>
              <p>
                <span className="font-medium">Response Date:</span>{" "}
                {formatDateTime(request.reviewedDate || null)}
              </p>
              <p>
                <span className="font-medium">Handled At:</span>{" "}
                {formatDateTime(request.handledAt)}
              </p>
            </div>

            {/* Owner/rep details */}
            <div className="border-secondary-light rounded-md border p-4">
              <p className="mb-2 flex items-center gap-1 text-sm/5 font-medium text-black">
                <UserRound size={16} />
                Request Owner
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm/5 text-black">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {renderText(request.rep.name)}
                </p>
                <p>
                  <span className="font-medium">ID:</span>{" "}
                  {request.rep.id ? (
                    <Link
                      href={getUserProfileHref(role, request.rep.id)}
                      className="text-dashboard-blue hover:underline"
                    >
                      {request.rep.id}
                    </Link>
                  ) : (
                    "N/A"
                  )}
                </p>
              </div>
            </div>

            {/* Request Description */}
            <div>
              <p className="mb-1 text-sm/5 font-medium text-black">
                Description:
              </p>
              <p className="text-secondary-dark bg-secondary-very-light rounded-md p-4 text-sm/5 font-normal">
                {request.description}
              </p>
            </div>

            {/* Dates */}
            <div className="text-secondary-dark grid grid-cols-2 gap-2 text-sm/5">
              <p className="flex items-center gap-1">
                <Calendar size={14} />
                <span className="font-medium">Submitted:</span>
                {formatDateTime(request.submittedDate)}
              </p>
              {request.handledAt && (
                <p className="flex items-center gap-1">
                  <Clock size={14} />
                  <span className="font-medium">Handled:</span>
                  {formatDateTime(request.handledAt)}
                </p>
              )}
            </div>

            {/* LEAVE-specific information */}
            {request.type === "LEAVE" && (
              <div className="bg-light-blue border-blue-stroke rounded-md border p-4">
                <p className="text-dashboard-blue mb-2 flex items-center gap-1 text-sm/5 font-medium">
                  <Calendar size={16} />
                  Leave Details
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm/5 text-black">
                  {request.leaveType && (
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      {request.leaveType}
                    </p>
                  )}
                  {request.leaveStartDate && (
                    <p>
                      <span className="font-medium">Start Date:</span>{" "}
                      {formatDate(request.leaveStartDate)}
                    </p>
                  )}
                  {request.leaveEndDate && (
                    <p>
                      <span className="font-medium">End Date:</span>{" "}
                      {formatDate(request.leaveEndDate)}
                    </p>
                  )}
                  {request.leaveDaysCount !== null &&
                    request.leaveDaysCount !== undefined && (
                      <p>
                        <span className="font-medium">Duration:</span>{" "}
                        {request.leaveDaysCount} days
                      </p>
                    )}
                </div>
              </div>
            )}

            {/* EXPENSE / MARKETING information */}
            {(request.type === "EXPENSE" || request.type === "MARKETING") && (
              <div className="bg-light-blue border-blue-stroke rounded-md border p-4">
                <p className="text-dashboard-blue mb-2 flex items-center gap-1 text-sm/5 font-medium">
                  <AlertCircle size={16} />
                  {request.type} Details
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm/5 text-black">
                  <p>
                    <span className="font-medium">Budget:</span>{" "}
                    {formatMoney(request.budget)}
                  </p>
                  <p>
                    <span className="font-medium">Doctors Count:</span>{" "}
                    {request.doctors?.length ?? 0}
                  </p>
                </div>
                <div className="mt-3 space-y-2">
                  {(request.doctors ?? []).length === 0 ? (
                    <p className="text-secondary-dark text-sm/5">No doctors</p>
                  ) : (
                    (request.doctors ?? []).map((doctor) => (
                      <div
                        key={doctor.id}
                        className="bg-secondary-very-light grid grid-cols-3 gap-2 rounded-md p-3 text-sm/5 text-black"
                      >
                        <p>
                          <span className="font-medium">Doctor ID:</span>{" "}
                          <Link
                            href={getDoctorProfileHref(role, doctor.id)}
                            className="text-dashboard-blue hover:underline"
                          >
                            {doctor.id}
                          </Link>
                        </p>
                        <p>
                          <span className="font-medium">Name EN:</span>{" "}
                          {renderText(doctor.nameEN)}
                        </p>
                        <p>
                          <span className="font-medium">Name AR:</span>{" "}
                          {renderText(doctor.nameAR)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SAMPLE information */}
            {request.type === "SAMPLE" && (
              <div className="bg-light-blue border-blue-stroke rounded-md border p-4">
                <p className="text-dashboard-blue mb-2 flex items-center gap-1 text-sm/5 font-medium">
                  <AlertCircle size={16} />
                  Sample Details
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm/5 text-black">
                  <p>
                    <span className="font-medium">Sample Items Count:</span>{" "}
                    {request.sampleData?.length ?? 0}
                  </p>
                  <p>
                    <span className="font-medium">productsId:</span>{" "}
                    {(request.productsId ?? []).length > 0
                      ? (request.productsId ?? []).join(", ")
                      : "N/A"}
                  </p>
                </div>
                <div className="mt-3 space-y-2">
                  {(request.sampleData ?? []).length === 0 ? (
                    <p className="text-secondary-dark text-sm/5">
                      No sample items
                    </p>
                  ) : (
                    (request.sampleData ?? []).map((item, index) => (
                      <div
                        key={`${item.productId}-${index}`}
                        className="bg-secondary-very-light grid grid-cols-3 gap-2 rounded-md p-3 text-sm/5 text-black"
                      >
                        <p>
                          <span className="font-medium">Product ID:</span>{" "}
                          {item.productId}
                        </p>
                        <p>
                          <span className="font-medium">Product Name:</span>{" "}
                          {renderText(item.productName)}
                        </p>
                        <p>
                          <span className="font-medium">Amount:</span>{" "}
                          {renderText(item.amount)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* PERSONAL_EXPENSE information */}
            {request.type === "PERSONAL_EXPENSE" && (
              <div className="bg-light-blue border-blue-stroke rounded-md border p-4">
                <p className="text-dashboard-blue mb-2 flex items-center gap-1 text-sm/5 font-medium">
                  <AlertCircle size={16} />
                  Personal Expense Details
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm/5 text-black">
                  <p>
                    <span className="font-medium">Visited City:</span>{" "}
                    {renderText(request.visitedCity)}
                  </p>
                  <p>
                    <span className="font-medium">Visit Days:</span>{" "}
                    {renderText(request.visitDaysCount)}
                  </p>
                  <p>
                    <span className="font-medium">Total Expense Amount:</span>{" "}
                    {formatMoney(request.totalExpenseAmount)}
                  </p>
                  <p>
                    <span className="font-medium">Items Count:</span>{" "}
                    {request.totalExpenseData?.length ?? 0}
                  </p>
                </div>
                <div className="mt-3 space-y-2">
                  {(request.totalExpenseData ?? []).length === 0 ? (
                    <p className="text-secondary-dark text-sm/5">
                      No expense items
                    </p>
                  ) : (
                    (request.totalExpenseData ?? []).map((item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        className="bg-secondary-very-light grid grid-cols-2 gap-2 rounded-md p-3 text-sm/5 text-black"
                      >
                        <p>
                          <span className="font-medium">Item Name:</span>{" "}
                          {renderText(item.name)}
                        </p>
                        <p>
                          <span className="font-medium">Amount:</span>{" "}
                          {formatMoney(Number(item.amount))}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* PDFs/files */}
            <div className="border-secondary-light rounded-md border p-4">
              <p className="mb-2 flex items-center gap-1 text-sm/5 font-medium text-black">
                <FileText size={16} />
                Files (pdfs)
              </p>
              {(request.pdfs ?? []).length === 0 ? (
                <p className="text-secondary-dark text-sm/5">No files</p>
              ) : (
                <div className="space-y-2">
                  {(request.pdfs ?? []).map((pdf) => (
                    <div
                      key={pdf.public_id}
                      className="bg-secondary-very-light grid grid-cols-[1fr,1fr,auto] items-center gap-2 rounded-md p-3 text-sm/5 text-black"
                    >
                      <p>
                        <span className="font-medium">Name:</span> {pdf.name}
                      </p>
                      <p>
                        <span className="font-medium">Public ID:</span>{" "}
                        {pdf.public_id}
                      </p>
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={pdf.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border-secondary-light hover:bg-secondary-light inline-flex items-center gap-1 rounded-md border bg-white px-2.5 py-1.5 text-xs font-medium"
                        >
                          <ExternalLink size={14} />
                          Open File
                        </Link>
                        <button
                          type="button"
                          onClick={() => copyLink(pdf.url)}
                          className="border-secondary-light hover:bg-secondary-light inline-flex items-center gap-1 rounded-md border bg-white px-2.5 py-1.5 text-xs font-medium"
                        >
                          <Copy size={14} />
                          Copy Link
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Response Section - Show response if available */}
            {request.response && (
              <div
                className={`${getResponseBgStyle(request.status)} rounded-md p-4`}
              >
                <p
                  className={`mb-1 flex items-center gap-1 text-sm/5 font-medium ${
                    request.status === "APPROVED"
                      ? "text-dashboard-green"
                      : request.status === "REJECTED"
                        ? "text-dashboard-red"
                        : "text-secondary-dark"
                  }`}
                >
                  <AlertCircle size={16} />
                  Response/Notes:
                </p>
                <p
                  className={`text-secondary-dark text-sm/5 font-normal italic`}
                >
                  &quot;{request.response}&quot;
                </p>
                {request.reviewedDate && (
                  <p className="mt-2 text-xs/4 font-normal text-[#999999]">
                    Reviewed: {formatDateTime(request.reviewedDate)}
                  </p>
                )}
              </div>
            )}

            {/* Supervisor Decision - Show if exists and no direct response */}
            {!request.response &&
              request.supervisorDecision &&
              request.status.toLowerCase() !== "pending" && (
                <div
                  className={`${getResponseBgStyle(request.status)} rounded-md p-4`}
                >
                  <p className="text-base/6 font-medium text-black">
                    Supervisor Decision
                  </p>
                  <p className={`text-secondary-dark text-sm/5 font-normal`}>
                    {request.supervisorDecision.comment}
                  </p>
                  {request.reviewedDate && (
                    <p className="mt-2 text-xs/4 font-normal text-[#999999]">
                      Reviewed: {formatDateTime(request.reviewedDate)}
                    </p>
                  )}
                </div>
              )}
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <p className="text-secondary-dark text-xs">
          Showing {requests.length} of {totalCount || requests.length} requests
        </p>
        <Pagination page={page} limit={limit} totalCount={totalCount || requests.length} />
      </div>
    </main>
  );
}
