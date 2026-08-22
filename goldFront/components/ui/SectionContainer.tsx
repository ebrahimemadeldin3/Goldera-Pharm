"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
}

export function SectionContainer({ children, className }: SectionContainerProps) {
  return (
    <section
      className={cn(
        "bg-white border border-slate-200 rounded-xl p-5 mt-4",
        className
      )}
    >
      {children}
    </section>
  );
}
