"use client";

import { CircleCheckBig, CircleX, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TRequest } from "@/features/requests/lib/types";
import { formatDate, isBlank } from "./requests-workflow-utils";

type RequestStatusPanelProps = {
  request: TRequest;
};

const config: Record<
  TRequest["status"],
  {
    icon: LucideIcon;
    headline: string;
    panel: string;
    iconShell: string;
  }
> = {
  PENDING: {
    icon: Clock,
    headline: "Pending review",
    panel: "border-gp-warning-border bg-gp-warning-soft",
    iconShell: "bg-gp-warning-soft text-gp-warning",
  },
  APPROVED: {
    icon: CircleCheckBig,
    headline: "Request approved",
    panel: "border-gp-success-border bg-gp-success-soft",
    iconShell: "bg-gp-success-soft text-gp-success",
  },
  REJECTED: {
    icon: CircleX,
    headline: "Request rejected",
    panel: "border-gp-danger-border bg-gp-danger-soft",
    iconShell: "bg-gp-danger-soft text-gp-danger",
  },
};

export function RequestStatusPanel({ request }: RequestStatusPanelProps) {
  const tone = config[request.status];
  const Icon = tone.icon;
  const decisionDate = request.reviewedDate || request.handledAt;

  const subline =
    request.status === "PENDING"
      ? `Submitted ${formatDate(request.submittedDate)}. Awaiting a decision.`
      : `Handled ${formatDate(decisionDate)}.`;

  return (
    <section
      className={cn(
        "requests-status-panel flex flex-col gap-3 rounded-[12px] border p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5",
        tone.panel,
      )}
      aria-label={tone.headline}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-[9px]",
          tone.iconShell,
        )}
      >
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm leading-5 font-semibold",
            request.status === "PENDING"
              ? "text-gp-warning"
              : request.status === "APPROVED"
                ? "text-gp-success"
                : "text-gp-danger",
          )}
        >
          {tone.headline}
        </p>
        <p className="text-gp-text-secondary mt-0.5 text-sm font-medium">
          {subline}
        </p>
        {!isBlank(request.response) && (
          <p
            className={cn(
              "mt-2 text-sm leading-6 font-medium italic",
              request.status === "PENDING"
                ? "text-gp-warning/90"
                : request.status === "APPROVED"
                  ? "text-gp-success/90"
                  : "text-gp-danger/90",
            )}
          >
            &ldquo;{request.response}&rdquo;
          </p>
        )}
      </div>
    </section>
  );
}
