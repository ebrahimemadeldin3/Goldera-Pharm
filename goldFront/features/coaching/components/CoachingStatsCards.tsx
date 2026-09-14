"use client";

import type { CSSProperties } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CoachingStatConfig } from "@/core/role-config/role-coaching-stats";
import type { StatCardData } from "@/core/ui/stat-card-types";

type CoachingStatsCardsProps = {
  stats: CoachingStatConfig[];
  data: StatCardData;
};

const toneStyles = {
  navy: {
    shell: "border-gp-border-control bg-gp-surface-subtle text-gp-navy-900",
    iconHover:
      "group-hover/card:bg-gp-surface-control group-hover/card:text-gp-navy-900",
    rail: "bg-gp-navy-900",
    railHover: "group-hover/card:bg-gp-navy-900",
    value: "text-gp-navy-900",
  },
  gold: {
    shell: "border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700",
    iconHover:
      "group-hover/card:bg-gp-gold-100 group-hover/card:text-gp-gold-700",
    rail: "bg-gp-gold-500",
    railHover: "group-hover/card:bg-gp-gold-600",
    value: "text-gp-navy-900",
  },
  amber: {
    shell: "border-gp-warning-border bg-gp-warning-soft text-gp-warning",
    iconHover:
      "group-hover/card:bg-gp-warning-soft group-hover/card:text-gp-warning",
    rail: "bg-gp-warning",
    railHover: "group-hover/card:bg-gp-warning",
    value: "text-gp-navy-900",
  },
  green: {
    shell: "border-gp-success-border bg-gp-success-soft text-gp-success",
    iconHover:
      "group-hover/card:bg-gp-success-soft group-hover/card:text-gp-success",
    rail: "bg-gp-success",
    railHover: "group-hover/card:bg-gp-success",
    value: "text-gp-navy-900",
  },
} as const;

export function CoachingStatsCards({ stats, data }: CoachingStatsCardsProps) {
  return (
    <section
      className="coaching-section-enter grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      style={{ "--coaching-enter-delay": "0ms" } as CSSProperties}
      aria-label="Coaching summary"
    >
      {stats.map((item, index) => {
        const Icon = item.icon;
        const tone = toneStyles[item.tone ?? "navy"];
        const rawValue = data[item.dataKey] ?? 0;
        const value =
          typeof rawValue === "number" ? rawValue.toLocaleString() : rawValue;

        return (
          <Card
            key={item.id}
            className="coaching-kpi-card coaching-section-enter border-gp-border-default bg-gp-surface-card shadow-gp-card group/card relative gap-0 overflow-hidden rounded-[14px] border py-0"
            style={
              {
                "--coaching-enter-delay": `${80 + index * 50}ms`,
              } as CSSProperties
            }
          >
            <span
              className={cn(
                "coaching-kpi-rail absolute top-0 bottom-0 left-0 w-[3px]",
                tone.rail,
                tone.railHover,
              )}
              aria-hidden="true"
            />
            <CardContent className="flex min-h-[112px] items-center gap-4 py-4 pr-5 pl-[22px] sm:py-5">
              <span
                className={cn(
                  "coaching-kpi-icon-shell flex size-10 shrink-0 items-center justify-center rounded-[10px] border",
                  tone.shell,
                  tone.iconHover,
                )}
              >
                <Icon className="coaching-kpi-icon size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-gp-text-muted text-[11px] leading-4 font-semibold tracking-[0.04em] uppercase">
                  {item.label}
                </p>
                <p
                  className={cn(
                    "coaching-kpi-value mt-1.5 text-2xl leading-none font-semibold",
                    tone.value,
                  )}
                >
                  {value}
                </p>
                {item.helper && (
                  <p className="text-gp-text-placeholder mt-1.5 truncate text-xs font-medium">
                    {item.helper}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
