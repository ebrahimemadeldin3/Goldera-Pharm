"use client";

import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Package,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import type { ForecastManagement } from "../lib/types/management";
import Pagination from "@/components/ui/Pagination";
import { updateForecastAction } from "../api/management";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ForecastRequestsList({
  forecasts,
  page = 1,
  limit = 10,
  totalCount = 0,
}: {
  forecasts: ForecastManagement[];
  page?: number;
  limit?: number;
  totalCount?: number;
}) {
    const router = useRouter();
  const [expandedForecasts, setExpandedForecasts] = useState<Set<string>>(
    new Set(),
  );
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    forecastId: string | null;
    action: "approve" | "reject" | null;
    repName: string;
  }>({
    open: false,
    forecastId: null,
    action: null,
    repName: "",
  });
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleExpanded = (forecastId: string) => {
    setExpandedForecasts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(forecastId)) {
        newSet.delete(forecastId);
      } else {
        newSet.add(forecastId);
      }
      return newSet;
    });
  };

  const openDialog = (
    forecastId: string,
    action: "approve" | "reject",
    repName: string,
  ) => {
    setDialogState({
      open: true,
      forecastId,
      action,
      repName,
    });
    setFeedback("");
  };

  const closeDialog = () => {
    setDialogState({
      open: false,
      forecastId: null,
      action: null,
      repName: "",
    });
    setFeedback("");
  };

  const handleSubmit = async () => {
    if (!dialogState.forecastId || !dialogState.action) return;

    if (!feedback.trim()) {
      toast.error("Please provide feedback");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateForecastAction(
        dialogState.forecastId,
        dialogState.action === "approve",
        feedback,
      );

      if (result.success) {
        toast.success(
          `Forecast ${dialogState.action === "approve" ? "approved" : "rejected"} successfully`,
        );
        closeDialog();
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to update forecast");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPeriodBadge = (periodType: string) => {
    const isMonthly = periodType.toLowerCase() === "monthly";
    return (
      <span
        className={`rounded-lg px-2 py-0.5 text-xs/5 font-medium ${
          isMonthly
            ? "bg-[#DBEAFE] text-[#1E40AF]"
            : "bg-[#FEF3C7] text-[#92400E]"
        }`}
      >
        {periodType}
      </span>
    );
  };

  const getStatusBadge = (isApproved: boolean) => {
    return (
      <span
        className={`rounded-lg px-2 py-0.5 text-xs/5 font-medium ${
          isApproved
            ? "bg-dashboard-green text-white"
            : "bg-dashboard-orange text-white"
        }`}
      >
        {isApproved ? "Approved" : "Pending"}
      </span>
    );
  };
 
  if (forecasts.length === 0) {
    return (
      <div className="border-secondary-light flex flex-col items-center justify-center rounded-[14px] border-[0.8px] bg-white p-12 text-center">
        <Package className="text-secondary-dark mb-4" size={48} />
        <p className="text-secondary-dark text-base/6 font-normal">
          No forecast requests found
        </p>
        <p className="text-secondary-dark mt-2 text-sm/5 font-normal">
          Medical representatives haven&apos;t submitted any forecasts yet
        </p>
      </div>
    );
  }

  return (
    <>
      <main className="space-y-6">


        {forecasts.map((forecast) => (
          <div
            key={forecast.id}
            className="border-secondary-light rounded-[14px] border-[0.8px] bg-white p-6"
          >

            
                  <div className="mt-6">
        <Pagination page={page} limit={limit} totalCount={totalCount} />
      </div>

            <header className="mb-4 flex items-start justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <h3 className="text-lg/6 font-normal text-black">
                    {forecast.repName}
                  </h3>
                  {getStatusBadge(forecast.isApproved)}
                  {getPeriodBadge(forecast.periodType)}
                </div>
                <p className="text-secondary-dark text-sm/5 font-normal">
                  Submitted on{" "}
                  {format(new Date(forecast.createdAt), "MMMM dd, yyyy")} •
                  Period: {format(new Date(forecast.periodDate), "MMM yyyy")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-secondary-dark text-sm/5 font-normal">
                  Total Units
                </p>
                <p className="text-xl/7 font-normal text-black">
                  {forecast.totalUnits.toLocaleString()}
                </p>
              </div>
            </header>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div className="border-secondary-light bg-secondary-very-light rounded-[10px] border p-3">
                <p className="text-secondary-dark flex items-center gap-1 text-xs/5 font-normal">
                  <Users size={16} />
                  Doctors Covered
                </p>
                <p className="text-lg/7 font-normal text-black">
                  {forecast.totalDoctors}{" "}
                  {forecast.totalDoctors === 1 ? "doctor" : "doctors"}
                </p>
              </div>
              <div className="border-secondary-light bg-secondary-very-light rounded-[10px] border p-3">
                <p className="text-secondary-dark flex items-center gap-1 text-xs/5 font-normal">
                  <Package size={16} />
                  Products
                </p>
                <p className="text-lg/7 font-normal text-black">
                  {forecast.totalProducts}{" "}
                  {forecast.totalProducts === 1 ? "product" : "products"}
                </p>
              </div>
            </div>

            {forecast.notes && (
              <div className="mb-4 rounded-[10px] border border-[#FDE68A] bg-[#FEF3C7] p-4">
                <p className="text-sm/4 font-semibold text-[#92400E]">
                  <span className="font-bold">Rep Notes: </span>
                  {forecast.notes}
                </p>
              </div>
            )}

            {forecast.supervisorFeedback && (
              <div className="mb-4 rounded-[10px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
                <p className="text-sm/4 font-semibold text-[#166534]">
                  <span className="font-bold">Supervisor Feedback: </span>
                  {forecast.supervisorFeedback}
                </p>
              </div>
            )}

            {forecast.productForecasts &&
              forecast.productForecasts.length > 0 && (
                <>
                  <p className="text-secondary-dark border-secondary-light mb-3 border-t-[0.8px] pt-4 text-sm/5 font-normal">
                    Product Distribution Details:
                  </p>
                  <div className="space-y-2">
                    {(expandedForecasts.has(forecast.id)
                      ? forecast.productForecasts
                      : forecast.productForecasts.slice(0, 4)
                    ).map((pf, index) => (
                      <div
                        key={`${forecast.id}-${index}`}
                        className="border-secondary-light flex items-center justify-between rounded-lg border bg-[#F8FAFC] p-3"
                      >
                        <div className="flex-1">
                          <p className="text-sm/5 font-medium text-black">
                            {pf.productName}
                          </p>
                          <p className="text-secondary-dark text-xs/4 font-normal">
                            {pf.doctorName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm/5 font-semibold text-black">
                            {pf.productUnits.toLocaleString()} units
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {forecast.productForecasts.length > 4 && (
                    <button
                      onClick={() => toggleExpanded(forecast.id)}
                      className="text-system-primary mt-3 flex w-full items-center justify-center gap-1 text-sm/5 font-medium transition-colors hover:opacity-80"
                    >
                      {expandedForecasts.has(forecast.id) ? (
                        <>
                          Show Less
                          <ChevronUp size={16} />
                        </>
                      ) : (
                        <>
                          Show {forecast.productForecasts.length - 4} More Items
                          <ChevronDown size={16} />
                        </>
                      )}
                    </button>
                  )}
                </>
              )}

            {!forecast.isApproved && (
              <div className="border-secondary-light mt-4 flex gap-3 border-t-[0.8px] pt-4">
                <Button
                  onClick={() =>
                    openDialog(forecast.id, "approve", forecast.repName)
                  }
                  className="bg-dashboard-green hover:text-dashboard-green hover:outline-dashboard-green flex-1 cursor-pointer transition-colors duration-200 hover:bg-transparent hover:outline hover:outline-solid"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() =>
                    openDialog(forecast.id, "reject", forecast.repName)
                  }
                  variant="outline"
                  className="border-dashboard-red text-dashboard-red hover:bg-dashboard-red hover:outline-dashboard-red flex-1 cursor-pointer transition-colors duration-200 hover:text-white hover:outline hover:outline-solid"
                >
                  <XCircle size={16} className="mr-2" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        ))}
      </main>



      <Dialog open={dialogState.open} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogState.action === "approve" ? "Approve" : "Reject"} Forecast
            </DialogTitle>
            <DialogDescription>
              Provide feedback for {dialogState.repName}&apos;s forecast
              request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={`Enter your feedback for ${dialogState.action === "approve" ? "approval" : "rejection"}...`}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={closeDialog}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={
                dialogState.action === "approve"
                  ? "bg-dashboard-green hover:text-dashboard-green hover:outline-dashboard-green cursor-pointer hover:bg-transparent hover:outline hover:outline-solid"
                  : "bg-dashboard-red hover:text-dashboard-red hover:outline-dashboard-red cursor-pointer hover:bg-transparent hover:outline hover:outline-solid"
              }
            >
              {isSubmitting
                ? "Processing..."
                : dialogState.action === "approve"
                  ? "Approve"
                  : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
