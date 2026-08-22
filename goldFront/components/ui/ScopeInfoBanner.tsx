"use client";

import React, { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScopeInfoBannerProps {
  children: ReactNode;
  onReset?: () => void;
  resetLabel?: string;
  className?: string;
}

export function ScopeInfoBanner({
  children,
  onReset,
  resetLabel = "Reset filters",
  className,
}: ScopeInfoBannerProps) {
  return (
    <div
      className={cn(
        "mb-4 flex items-center justify-between rounded-md border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-500",
        className
      )}
    >
      <span>{children}</span>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="font-medium underline text-slate-600 hover:text-slate-900 cursor-pointer inline-flex items-center gap-1 ml-2 shrink-0 transition-colors"
        >
          <RotateCcw size={11} />
          {resetLabel}
        </button>
      )}
    </div>
  );
}
