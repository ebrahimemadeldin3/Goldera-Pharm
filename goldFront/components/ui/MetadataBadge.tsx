"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MetadataBadgeVariant = "primary" | "neutral" | "success" | "info";

interface MetadataBadgeProps {
  icon?: ReactNode;
  children: ReactNode;
  variant?: MetadataBadgeVariant;
  className?: string;
}

export function MetadataBadge({
  icon,
  children,
  variant = "neutral",
  className,
}: MetadataBadgeProps) {
  const variantStyles: Record<MetadataBadgeVariant, string> = {
    primary: "font-medium text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs",
    neutral: "bg-slate-100/80 border border-slate-200/60 px-2 py-0.5 rounded-md text-slate-700",
    success: "font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md",
    info: "font-medium text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs",
        variantStyles[variant],
        className
      )}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
}
