"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Forecast } from "../../lib/types";
import { format } from "date-fns";
import { Calendar, Package, CheckCircle, XCircle } from "lucide-react";

type ForecastsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forecasts: Forecast[];
  userName: string;
};

export function ForecastsDialog({
  open,
  onOpenChange,
  forecasts,
  userName,
}: ForecastsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Forecasts - {userName}</DialogTitle>
          <DialogDescription>
            Total forecasts: {forecasts.length}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {forecasts.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
              No forecasts found
            </div>
          ) : (
            forecasts.map((forecast) => (
              <div
                key={forecast.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {forecast.periodType}
                    </span>
                    <div className="flex items-center gap-2">
                      {forecast.isApproved ? (
                        <CheckCircle className="text-dashboard-green h-4 w-4" />
                      ) : (
                        <XCircle className="text-dashboard-orange h-4 w-4" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          forecast.isApproved
                            ? "text-dashboard-green"
                            : "text-dashboard-orange"
                        }`}
                      >
                        {forecast.isApproved ? "Approved" : "Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Period:{" "}
                      {format(new Date(forecast.periodDate), "MMM d, yyyy")}
                    </p>

                    <div className="mt-3">
                      <p className="mb-2 flex items-center gap-2 font-medium text-black">
                        <Package className="h-4 w-4" />
                        Product Forecasts:
                      </p>
                      <div className="ml-6 space-y-2">
                        {forecast.productForecasts.map((pf, idx) => (
                          <div
                            key={idx}
                            className="rounded-md border border-slate-100 bg-slate-50 p-2"
                          >
                            <p className="font-medium text-black">
                              {pf.doctorName}
                            </p>
                            <p className="text-xs text-slate-600">
                              {pf.productName} - {pf.productUnits} units
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {forecast.notes && (
                      <div className="mt-2">
                        <p className="font-medium text-black">Notes:</p>
                        <p className="ml-6">{forecast.notes}</p>
                      </div>
                    )}

                    {forecast.supervisorFeedback && (
                      <div className="mt-2 rounded-md bg-blue-50 p-3">
                        <p className="font-medium text-black">
                          Supervisor Feedback:
                        </p>
                        <p>{forecast.supervisorFeedback}</p>
                      </div>
                    )}

                    <p className="text-xs text-slate-400">
                      Created:{" "}
                      {format(new Date(forecast.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
