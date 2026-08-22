"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type StatusType =
  | "SCHEDULED"
  | "COMPLETED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "IN_PROGRESS"
  | "PLANNED"
  | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const normalized = (status || "").toUpperCase();

  const statusStyles: Record<string, string> = {
    APPROVED: "bg-emerald-600 text-white",
    COMPLETED: "bg-emerald-600 text-white",
    PENDING: "bg-amber-500 text-white",
    SCHEDULED: "bg-blue-600 text-white",
    PLANNED: "bg-blue-600 text-white",
    IN_PROGRESS: "bg-blue-600 text-white",
    REJECTED: "bg-slate-500 text-white",
    CANCELLED: "bg-red-600 text-white",
  };

  const styleClass = statusStyles[normalized] || "bg-slate-600 text-white";
  const displayLabel = label || status.replace("_", " ");

  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-[11px] font-medium capitalize",
        styleClass,
        className
      )}
    >
      {displayLabel}
    </span>
  );
}
