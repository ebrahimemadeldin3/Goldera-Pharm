"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  CircleCheckBig,
  CircleX,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  FileText,
  ExternalLink,
  Copy,
} from "lucide-react";
import { TRequest } from "@/features/requests/lib/types";
import { UserRole } from "@/lib/types";
import { getStatusColor } from "@/features/requests/lib/utils";
import { approveRequestAction, rejectRequestAction } from "../api";
import { useState, useTransition } from "react";
import { toast } from "@/lib/utils/toast";
import { format } from "date-fns";
import Link from "next/link";

type ActionType = "approve" | "reject" | null;

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

const getRolePrefix = (role: UserRole): "manager" | "supervisor" | "rep" => {
  if (role === "MANAGER") return "manager";
  if (role === "SUPERVISOR") return "supervisor";
  return "rep";
};

export default function RequestCard({
  request,
  role,
}: {
  request: TRequest;
  role: UserRole;
}) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [notes, setNotes] = useState("");
  const rolePrefix = getRolePrefix(role);

  const getUserProfileHref = (id?: string) => {
    if (!id) return "#";
    if (rolePrefix === "rep") return "/rep/profile";
    return `/${rolePrefix}/team/${id}`;
  };

  const getDoctorProfileHref = (id: string) => `/${rolePrefix}/doctors/${id}`;

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

  const openDialog = (type: ActionType) => {
    setActionType(type);
    setDialogOpen(true);
    setNotes("");
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setActionType(null);
    setNotes("");
  };

  const handleAction = () => {
    if (!actionType) return;

    startTransition(async () => {
      const result =
        actionType === "approve"
          ? await approveRequestAction(request.id, notes || undefined)
          : await rejectRequestAction(request.id, notes || undefined);

      if (result.success) {
        if (actionType === "approve") {
          toast.success({
            title: "Request approved successfully",
            description: request.title,
          });
        } else {
          toast.error({
            title: "Request rejected successfully",
            description: request.title,
          });
        }
        closeDialog();
      } else {
        toast.error({
          title: `Failed to ${actionType === "approve" ? "approve" : "reject"} request`,
          description: result.error?.message || "An error occurred",
        });
      }
    });
  };

  return (
    <Card className="border-secondary-light flex flex-row flex-wrap justify-between gap-4 border-[0.8px] bg-white p-6 shadow-none">
      <p
        className={`border-dashboard-blue text-dashboard-blue flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border bg-white ${
          role === "SUPERVISOR"
            ? request.belongToWho === "me"
              ? "border-dashboard-blue text-dashboard-blue"
              : request.belongToWho === "rep"
                ? "border-dashboard-green text-dashboard-green"
                : ""
            : ""
        } `}
      >
        <DollarSign size={24} />
      </p>
      <div className="flex min-w-0 flex-1 gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base/6 font-normal text-black">
              {request.title}
            </h3>
            <span className="border-dashboard-blue text-dashboard-blue mr-1 ml-4 rounded-md border-[0.8px] px-3 py-1 text-xs/4 font-medium">
              {request.type}
            </span>
            <span
              className={`mr-1 rounded-md border-[0.8px] px-2 py-0.5 text-xs/4 font-medium ${getUrgencyColor(request.urgency)}`}
            >
              {request.urgency}
            </span>
            {request.amount && (
              <span className="bg-light-blue text-dashboard-blue border-light-blue mr-1 rounded-md border-[0.8px] px-2 py-0.5 text-xs/4">
                {request.amount}
              </span>
            )}
            <span
              className={`rounded-md border-[0.8px] px-2 py-0.5 text-xs/4 ${getStatusColor(request.status)}`}
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

          <div className="bg-secondary-very-light grid grid-cols-1 gap-2 rounded-md p-4 text-sm/5 text-black sm:grid-cols-2">
            <p>
              <span className="font-medium">Request ID:</span> {request.id}
            </p>
            <p>
              <span className="font-medium">User ID:</span>{" "}
              {request.userId ? (
                <Link
                  href={getUserProfileHref(request.userId)}
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

          <div className="text-secondary-dark grid w-full grid-cols-1 gap-2 text-sm/5 font-normal sm:grid-cols-2">
            {role === "MANAGER" && (
              <>
                <p className="flex items-center gap-1">
                  <span className="font-medium">Rep:</span>
                  {request.rep.name}
                </p>
                <p className="flex items-center gap-1">
                  <span className="font-medium">Rep ID:</span>
                  {request.rep.id}
                </p>
                {request.supervisor.name && (
                  <p className="flex items-center gap-1">
                    <span className="font-medium">Supervisor:</span>
                    {request.supervisor.name}
                  </p>
                )}
              </>
            )}
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
            {request.reviewedDate && (
              <p className="flex items-center gap-1">
                <Clock size={14} />
                <span className="font-medium">Reviewed:</span>
                {formatDateTime(request.reviewedDate)}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="mb-1 text-sm/5 font-medium text-black">
              Description:
            </p>
            <p
              className={`text-sm/5 font-normal text-black ${
                role === "SUPERVISOR"
                  ? request.belongToWho === "me"
                    ? "bg-light-blue border-blue-stroke rounded-md border p-4"
                    : request.belongToWho === "rep"
                      ? "bg-light-green border-green-stroke rounded-md border p-4"
                      : ""
                  : "bg-secondary-very-light rounded-md p-4"
              }`}
            >
              {request.description}
            </p>
          </div>

          {/* LEAVE-specific information */}
          {request.type === "LEAVE" && (
            <div className="bg-light-blue border-blue-stroke rounded-md border p-4">
              <p className="text-dashboard-blue mb-2 flex items-center gap-1 text-sm/5 font-medium">
                <Calendar size={16} />
                Leave Details
              </p>
              <div className="grid grid-cols-1 gap-2 text-sm/5 text-black sm:grid-cols-2">
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

          {(request.type === "EXPENSE" || request.type === "MARKETING") && (
            <div className="bg-light-blue border-blue-stroke rounded-md border p-4">
              <p className="text-dashboard-blue mb-2 flex items-center gap-1 text-sm/5 font-medium">
                <AlertCircle size={16} />
                {request.type} Details
              </p>
              <div className="grid grid-cols-1 gap-2 text-sm/5 text-black sm:grid-cols-2">
                <p>
                  <span className="font-medium">Budget:</span>{" "}
                  {formatMoney(request.budget)}
                </p>
                <p>
                  <span className="font-medium">Doctors Count:</span>{" "}
                  {request.doctors?.length ?? 0}
                </p>
                <p>
                  <span className="font-medium">Doctor Name:</span>{" "}
                  {renderText(request.doctorName)}
                </p>
                <p>
                  <span className="font-medium">Doctor IDs:</span>{" "}
                  {(request.doctorIds ?? []).length > 0
                    ? (request.doctorIds ?? []).join(", ")
                    : "N/A"}
                </p>
              </div>
              <div className="mt-3 space-y-2">
                {(request.doctors ?? []).length === 0 ? (
                  <p className="text-secondary-dark text-sm/5">No doctors</p>
                ) : (
                  (request.doctors ?? []).map((doctor) => (
                    <div
                      key={doctor.id}
                      className="bg-secondary-very-light grid grid-cols-1 gap-2 rounded-md p-3 text-sm/5 text-black sm:grid-cols-3"
                    >
                      <p>
                        <span className="font-medium">Doctor ID:</span>{" "}
                        <Link
                          href={getDoctorProfileHref(doctor.id)}
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

          {request.type === "SAMPLE" && (
            <div className="bg-light-blue border-blue-stroke rounded-md border p-4">
              <p className="text-dashboard-blue mb-2 flex items-center gap-1 text-sm/5 font-medium">
                <AlertCircle size={16} />
                Sample Details
              </p>
              <div className="grid grid-cols-1 gap-2 text-sm/5 text-black sm:grid-cols-2">
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
                      className="bg-secondary-very-light grid grid-cols-1 gap-2 rounded-md p-3 text-sm/5 text-black sm:grid-cols-3"
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

          {request.type === "PERSONAL_EXPENSE" && (
            <div className="bg-light-blue border-blue-stroke rounded-md border p-4">
              <p className="text-dashboard-blue mb-2 flex items-center gap-1 text-sm/5 font-medium">
                <AlertCircle size={16} />
                Personal Expense Details
              </p>
              <div className="grid grid-cols-1 gap-2 text-sm/5 text-black sm:grid-cols-2">
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
                      className="bg-secondary-very-light grid grid-cols-1 gap-2 rounded-md p-3 text-sm/5 text-black sm:grid-cols-2"
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
                    className="bg-secondary-very-light grid grid-cols-1 items-center gap-2 rounded-md p-3 text-sm/5 text-black sm:grid-cols-[1fr,1fr,auto]"
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

          {/* Response/Notes from approver */}
          {request.response && (
            <div
              className={`rounded-md border p-4 ${
                request.status === "APPROVED"
                  ? "bg-light-green border-green-stroke"
                  : request.status === "REJECTED"
                    ? "bg-light-red border-red-stroke"
                    : "bg-secondary-very-light border-secondary-light"
              }`}
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
              <p className="text-sm/5 font-normal text-black italic">
                &quot;{request.response}&quot;
              </p>
            </div>
          )}

          {role === "MANAGER" && request.supervisorDecision ? (
            <div className="bg-dashboard-blue rounded-[10px] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm/5 font-normal text-white">
                  Supervisor Decision
                </p>
                <p
                  className={`rounded-md px-2 py-0.5 text-xs/4 font-medium ${
                    request.supervisorDecision?.decision === "APPROVED"
                      ? "bg-dashboard-green text-white"
                      : request.supervisorDecision?.decision === "REJECTED"
                        ? "bg-dashboard-red text-white"
                        : "bg-dashboard-orange text-white"
                  }`}
                >
                  {request.supervisorDecision?.decision}
                </p>
              </div>
              {request.supervisorDecision?.comment && (
                <p className="text-secondary-very-light mt-2 text-sm/5 font-normal italic">
                  &quot;{request.supervisorDecision?.comment}&quot;
                </p>
              )}
            </div>
          ) : (
            request?.belongToWho === "rep" &&
            request.supervisorDecision?.decision !== "PENDING" && (
              <div className="bg-dashboard-blue rounded-[10px] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm/5 font-normal text-white">
                    Supervisor Decision
                  </p>
                  <p
                    className={`rounded-md px-2 py-0.5 text-xs/4 font-medium ${
                      request.supervisorDecision?.decision === "APPROVED"
                        ? "bg-dashboard-green text-white"
                        : request.supervisorDecision?.decision === "REJECTED"
                          ? "bg-dashboard-red text-white"
                          : "bg-dashboard-orange text-white"
                    }`}
                  >
                    {request.supervisorDecision?.decision}
                  </p>
                </div>
                {request.supervisorDecision?.comment && (
                  <p className="text-secondary-very-light mt-2 text-sm/5 font-normal italic">
                    &quot;{request.supervisorDecision?.comment}&quot;
                  </p>
                )}
              </div>
            )
          )}
        </div>
      </div>
      {request.status === "PENDING" && (
        <>
          {(request.belongToWho === "rep" || role === "MANAGER") && (
            <div className="flex shrink-0 flex-col gap-2">
              <Button
                onClick={() => openDialog("approve")}
                disabled={isPending}
                variant="secondary"
                size="sm"
                className="border-dashboard-green bg-dashboard-green hover:text-dashboard-green h-8 cursor-pointer rounded-md border-[0.8px] px-4 text-sm/5 font-medium text-white hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CircleCheckBig size={16} /> Approve
              </Button>
              <Button
                onClick={() => openDialog("reject")}
                disabled={isPending}
                variant="secondary"
                size="sm"
                className="border-dashboard-red text-dashboard-red hover:bg-dashboard-red h-8 cursor-pointer rounded-md border-[0.8px] bg-white px-4 text-sm/5 font-medium hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CircleX size={16} /> Reject
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve" : "Reject"} Request
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {actionType} this request: &quot;
              {request.title}&quot;?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes (Optional)
            </label>
            <Textarea
              id="notes"
              placeholder="Add any comments or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={isPending}
              className={
                actionType === "approve"
                  ? "border-dashboard-green bg-dashboard-green hover:bg-dashboard-green/90"
                  : "border-dashboard-red bg-dashboard-red hover:bg-dashboard-red/90"
              }
            >
              {isPending
                ? "Processing..."
                : actionType === "approve"
                  ? "Approve"
                  : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
