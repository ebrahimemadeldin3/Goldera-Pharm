"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  FileText,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { TRequest } from "@/features/requests/lib/types";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RequestHistoryProps {
  requests: TRequest[];
  page?: number;
  limit?: number;
  totalCount?: number;
}

type TabType = "all" | "PENDING" | "APPROVED" | "REJECTED";

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-[#CBEFDD] bg-[#E9F8F1] px-2 py-0.5 text-[10px] font-semibold text-[#168557]">
          <CheckCircle2 size={12} /> Approved
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-[#FECDCA] bg-[#FEF3F2] px-2 py-0.5 text-[10px] font-semibold text-[#D92D20]">
          <XCircle size={12} /> Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-[#E9DDB8] bg-[#FFF8E5] px-2 py-0.5 text-[10px] font-semibold text-[#B18732]">
          <Clock size={12} /> Pending
        </span>
      );
  }
};

const getUrgencyBadge = (urgency: string) => {
  switch (urgency?.toUpperCase()) {
    case "CRITICAL":
    case "HIGH":
      return (
        <span className="rounded-md border border-[#FECDCA] bg-[#FEF3F2] px-2 py-0.5 text-[10px] font-semibold text-[#D92D20]">
          {urgency} Priority
        </span>
      );
    case "MEDIUM":
      return (
        <span className="rounded-md border border-[#E9DDB8] bg-[#FFF8E5] px-2 py-0.5 text-[10px] font-semibold text-[#B18732]">
          Medium Priority
        </span>
      );
    default:
      return (
        <span className="rounded-md border border-[#E5E8EF] bg-[#F6F8FB] px-2 py-0.5 text-[10px] font-semibold text-[#667085]">
          Low Priority
        </span>
      );
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "EXPENSE":
      return "Expense Reimbursement";
    case "MARKETING":
      return "Marketing Request";
    case "LEAVE":
      return "Leave Request";
    case "SAMPLE":
      return "Sample Allocation";
    case "PERSONAL_EXPENSE":
      return "Personal Expense";
    default:
      return type;
  }
};

export default function RequestHistory({
  requests = [],
  page = 1,
  limit = 10,
  totalCount = 0,
}: RequestHistoryProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedRequest, setSelectedRequest] = useState<TRequest | null>(null);

  const filteredRequests = useMemo(() => {
    if (activeTab === "all") return requests;
    return requests.filter((r) => r.status === activeTab);
  }, [activeTab, requests]);

  const counts = useMemo(() => {
    return {
      all: requests.length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      approved: requests.filter((r) => r.status === "APPROVED").length,
      rejected: requests.filter((r) => r.status === "REJECTED").length,
    };
  }, [requests]);

  const tabs: Array<{ id: TabType; label: string; count: number }> = [
    { id: "all", label: "All Requests", count: counts.all },
    { id: "PENDING", label: "Pending", count: counts.pending },
    { id: "APPROVED", label: "Approved", count: counts.approved },
    { id: "REJECTED", label: "Rejected", count: counts.rejected },
  ];

  return (
    <div className="rounded-[14px] border border-[#E5E8EF] bg-white p-5 space-y-5">
      {/* Directory Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#EEF1F6] pb-4">
        <h2 className="text-base font-bold text-[#182033]">My Requests History</h2>

        <div className="flex w-fit flex-wrap items-center gap-1.5 rounded-[12px] bg-[#F6F8FB] p-1 border border-[#E5E8EF]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex cursor-pointer items-center gap-2 rounded-[9px] px-3 py-1.5 text-xs font-semibold transition-all border ${
                  isActive
                    ? "bg-[#E9F8F1] border-[#CBEFDD] text-[#168557] shadow-2xs"
                    : "bg-white border-[#E5E8EF] text-[#667085] hover:text-[#182033]"
                }`}
              >
                {tab.label}
                <span
                  className={`flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                    isActive
                      ? "bg-[#168557] text-white"
                      : "bg-[#F6F8FB] text-[#344054] border border-[#E5E8EF]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Requests List Grid */}
      <div>
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-[#E5E8EF] bg-[#F9FAFB] py-10 px-6 text-center max-h-[220px]">
            <FileText className="size-8 text-[#98A2B3] mb-2" />
            <p className="text-sm font-bold text-[#182033]">
              No requests found
            </p>
            <p className="text-xs text-[#667085] mt-1 max-w-sm">
              There are no requests matching status &quot;{activeTab}&quot;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-[14px] border border-[#E5E8EF] bg-white p-4.5 shadow-none transition-all hover:border-[#CBEFDD] flex flex-col justify-between space-y-3.5"
              >
                <div className="space-y-3">
                  {/* Top Header: Title, Type & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="rounded-md border border-[#D7E5FF] bg-[#EDF4FF] px-2 py-0.5 text-[10px] font-semibold text-[#3972D5]">
                          {getTypeLabel(req.type)}
                        </span>
                        {getUrgencyBadge(req.urgency)}
                        {getStatusBadge(req.status)}
                      </div>

                      <h3 className="text-base font-bold text-[#182033] leading-snug truncate">
                        {req.title || req.subject}
                      </h3>
                      {req.subject && req.title !== req.subject && (
                        <p className="text-xs text-[#667085] truncate mt-0.5">
                          {req.subject}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description snippet */}
                  {req.description && (
                    <p className="text-xs text-[#475467] line-clamp-2 bg-[#F9FAFB] p-2.5 rounded-[8px] border border-[#EEF1F6]">
                      {req.description}
                    </p>
                  )}

                  {/* Key metadata highlights (No raw UUIDs!) */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-[#667085] pt-1">
                    <div className="flex items-center gap-1">
                      <Calendar size={13} className="text-[#98A2B3]" />
                      <span>Submitted: {formatDate(req.submittedDate)}</span>
                    </div>

                    {(req.amount || req.budget || req.totalExpenseAmount) && (
                      <span className="font-bold text-[#168557]">
                        EGP {req.amount || req.budget || req.totalExpenseAmount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-2 border-t border-[#EEF1F6] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(req)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#168557] hover:underline cursor-pointer"
                  >
                    <Eye size={13} /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TablePaginationFooter
        page={page}
        limit={limit}
        totalCount={totalCount || requests.length}
        itemLabel="requests"
        ariaLabel="Requests pagination"
        pageNavAriaLabel="Request pages"
      />

      {/* Detail Dialog (Clean Progressive Disclosure without raw technical UUIDs) */}
      <Dialog
        open={Boolean(selectedRequest)}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      >
        <DialogContent className="max-w-md rounded-[14px] border border-[#E5E8EF] bg-white p-6 space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-md border border-[#D7E5FF] bg-[#EDF4FF] px-2 py-0.5 text-[10px] font-semibold text-[#3972D5]">
                {getTypeLabel(selectedRequest?.type || "")}
              </span>
              {selectedRequest && getStatusBadge(selectedRequest.status)}
            </div>
            <DialogTitle className="text-lg font-bold text-[#182033]">
              {selectedRequest?.title || selectedRequest?.subject}
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 text-xs">
              {/* Overview Details */}
              <div className="rounded-[10px] border border-[#E5E8EF] bg-[#F9FAFB] p-3.5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#667085]">Subject</span>
                  <span className="font-bold text-[#182033]">{selectedRequest.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Priority</span>
                  <span>{getUrgencyBadge(selectedRequest.urgency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Submitted Date</span>
                  <span className="font-bold text-[#182033]">
                    {formatDate(selectedRequest.submittedDate)}
                  </span>
                </div>
                {selectedRequest.supervisor?.name && (
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Assigned Supervisor</span>
                    <span className="font-bold text-[#182033]">{selectedRequest.supervisor.name}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="font-bold uppercase tracking-wider text-[#667085] text-[10px]">
                  Description
                </h4>
                <p className="p-3 rounded-[8px] bg-white border border-[#E5E8EF] text-[#344054]">
                  {selectedRequest.description}
                </p>
              </div>

              {/* Type-Specific Breakdown */}
              {selectedRequest.type === "LEAVE" && (
                <div className="rounded-[10px] border border-[#CBEFDD] bg-[#E9F8F1]/40 p-3 space-y-1.5">
                  <p className="font-bold text-[#168557]">Leave Details</p>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Leave Type</span>
                    <span className="font-bold text-[#182033] capitalize">{selectedRequest.leaveType || "Annual"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Period</span>
                    <span className="font-bold text-[#182033]">
                      {formatDate(selectedRequest.leaveStartDate)} – {formatDate(selectedRequest.leaveEndDate)}
                    </span>
                  </div>
                </div>
              )}

              {(selectedRequest.type === "EXPENSE" || selectedRequest.type === "MARKETING") && (
                <div className="rounded-[10px] border border-[#CBEFDD] bg-[#E9F8F1]/40 p-3 space-y-1.5">
                  <p className="font-bold text-[#168557]">Financial Breakdown</p>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Budget Amount</span>
                    <span className="font-bold text-[#168557]">
                      EGP {selectedRequest.budget || selectedRequest.amount}
                    </span>
                  </div>
                  {selectedRequest.doctorName && (
                    <div className="flex justify-between">
                      <span className="text-[#667085]">Target Doctor</span>
                      <span className="font-bold text-[#182033]">{selectedRequest.doctorName}</span>
                    </div>
                  )}
                </div>
              )}

              {selectedRequest.type === "SAMPLE" && selectedRequest.sampleData && (
                <div className="rounded-[10px] border border-[#CBEFDD] bg-[#E9F8F1]/40 p-3 space-y-2">
                  <p className="font-bold text-[#168557]">Sample Allocations</p>
                  <div className="space-y-1">
                    {selectedRequest.sampleData.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs border-b border-[#CBEFDD] pb-1 last:border-none">
                        <span className="text-[#182033] font-medium">{item.productName}</span>
                        <span className="font-bold text-[#168557]">{item.amount} units</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Decision / Supervisor Response */}
              {selectedRequest.response && (
                <div className="rounded-[10px] border border-[#E5E8EF] bg-[#F9FAFB] p-3 space-y-1">
                  <p className="font-bold text-[#182033]">Supervisor Feedback</p>
                  <p className="text-[#667085]">{selectedRequest.response}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
