"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  metadata?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  metadata,
  action,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-4 flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-0.5">
            {subtitle}
          </p>
        )}
        {metadata && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-xs text-slate-600">
            {metadata}
          </div>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-2 shrink-0">
          {action}
        </div>
      )}
    </header>
  );
}
