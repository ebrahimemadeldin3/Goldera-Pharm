"use client";

import type { CSSProperties } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CircleCheckBig, Clock, ListChecks, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type RequestsStatsProps = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

type ToneKey = "total" | "pending" | "approved" | "rejected";

const toneStyles: Record<
  ToneKey,
  {
    id: string;
    label: string;
    helper: string;
    icon: LucideIcon;
    shell: string;
    iconHover: string;
    rail: string;
    railHover: string;
    value: string;
  }
> = {
  total: {
    id: "total",
    label: "Total Requests",
    helper: "All submitted requests",
    icon: ListChecks,
    shell: "border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700",
    iconHover:
      "group-hover/card:bg-gp-gold-100 group-hover/card:text-gp-gold-700",
    rail: "bg-gp-gold-500",
    railHover: "group-hover/card:bg-gp-gold-600",
    value: "text-gp-navy-900",
  },
  pending: {
    id: "pending",
    label: "Pending",
    helper: "Awaiting review",
    icon: Clock,
    shell: "border-gp-warning-border bg-gp-warning-soft text-gp-warning",
    iconHover:
      "group-hover/card:bg-gp-warning-soft group-hover/card:text-gp-warning",
    rail: "bg-gp-warning",
    railHover: "group-hover/card:bg-gp-warning",
    value: "text-gp-navy-900",
  },
  approved: {
    id: "approved",
    label: "Approved",
    helper: "Successfully approved",
    icon: CircleCheckBig,
    shell: "border-gp-success-border bg-gp-success-soft text-gp-success",
    iconHover:
      "group-hover/card:bg-gp-success-soft group-hover/card:text-gp-success",
    rail: "bg-gp-success",
    railHover: "group-hover/card:bg-gp-success",
    value: "text-gp-navy-900",
  },
  rejected: {
    id: "rejected",
    label: "Rejected",
    helper: "Not approved",
    icon: XCircle,
    shell: "border-gp-danger-border bg-gp-danger-soft text-gp-danger",
    iconHover:
      "group-hover/card:bg-gp-danger-soft group-hover/card:text-gp-danger",
    rail: "bg-gp-danger",
    railHover: "group-hover/card:bg-gp-danger",
    value: "text-gp-navy-900",
  },
};

export function RequestsStats({
  total,
  pending,
  approved,
  rejected,
}: RequestsStatsProps) {
  const cards: ToneKey[] = ["total", "pending", "approved", "rejected"];
  const values: Record<ToneKey, number> = {
    total,
    pending,
    approved,
    rejected,
  };

  return (
    <section
      className="requests-section-enter grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      style={{ "--requests-enter-delay": "0ms" } as CSSProperties}
      aria-label="Requests summary"
    >
      {cards.map((tone, index) => {
        const config = toneStyles[tone];
        const Icon = config.icon;
        return (
          <Card
            key={config.id}
            className="requests-kpi-card requests-section-enter border-gp-border-default bg-gp-surface-card shadow-gp-card group/card relative gap-0 overflow-hidden rounded-[14px] border py-0"
            style={
              {
                "--requests-enter-delay": `${70 + index * 50}ms`,
              } as CSSProperties
            }
          >
            <span
              className={cn(
                "requests-kpi-rail absolute top-0 bottom-0 left-0 w-[3px]",
                config.rail,
                config.railHover,
              )}
              aria-hidden="true"
            />
            <CardContent className="flex min-h-[96px] items-center gap-4 py-4 pr-5 pl-[22px] sm:py-5">
              <span
                className={cn(
                  "requests-kpi-icon-shell flex size-10 shrink-0 items-center justify-center rounded-[10px] border",
                  config.shell,
                  config.iconHover,
                )}
              >
                <Icon className="requests-kpi-icon size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-gp-text-muted text-[11px] leading-4 font-semibold tracking-[0.04em] uppercase">
                  {config.label}
                </p>
                <p
                  className={cn(
                    "requests-kpi-value mt-1.5 text-2xl leading-none font-semibold",
                    config.value,
                  )}
                >
                  {values[tone].toLocaleString()}
                </p>
                <p className="text-gp-text-placeholder mt-1.5 truncate text-xs font-medium">
                  {config.helper}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
