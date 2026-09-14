"use client";

import type { CSSProperties } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { hrStatsConfig } from "../lib/constants/stats-config";
import type { HRStats } from "../lib/types";

type HRStatsCardsProps = {
  stats: HRStats;
};

export function HRStatsCards({ stats }: HRStatsCardsProps) {
  const toneStyles = {
    gold: {
      shell: "border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700",
      iconHover: "group-hover/card:bg-gp-gold-100 group-hover/card:text-gp-gold-700",
      rail: "bg-gp-gold-500",
      railHover: "group-hover/card:bg-gp-gold-600",
    },
    navy: {
      shell: "border-gp-border-control bg-gp-surface-subtle text-gp-navy-900",
      iconHover: "group-hover/card:bg-gp-surface-control group-hover/card:text-gp-navy-900",
      rail: "bg-gp-navy-900",
      railHover: "group-hover/card:bg-gp-navy-900",
    },
  } as const;

  return (
    <section
      aria-label="Human resources summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {hrStatsConfig.map((item, index) => {
        const Icon = item.icon;
        const value = Number(stats[item.dataKey]) || 0;
        const isGold = item.tone === "gold";
        const tone = isGold ? toneStyles.gold : toneStyles.navy;

        return (
          <Card
            key={item.id}
            className="hr-kpi-card hr-section-enter border-gp-border-default bg-gp-surface-card shadow-gp-card group/card relative gap-0 overflow-hidden rounded-[14px] border py-0"
            style={
              {
                "--hr-enter-delay": `${70 + index * 50}ms`,
              } as CSSProperties
            }
          >
            <span
              className={cn(
                "hr-kpi-rail absolute top-0 bottom-0 left-0 w-[3px]",
                tone.rail,
                tone.railHover,
              )}
              aria-hidden="true"
            />
            <CardContent className="flex min-h-[96px] items-center gap-4 py-4 pr-5 pl-[22px] sm:py-5">
              <span
                className={cn(
                  "hr-kpi-icon-shell flex size-10 shrink-0 items-center justify-center rounded-[10px] border",
                  tone.shell,
                  tone.iconHover,
                )}
              >
                <Icon className="hr-kpi-icon size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-gp-text-muted text-[11px] leading-4 font-semibold tracking-[0.04em] uppercase">
                  {item.label}
                </p>
                <p className="text-gp-navy-900 mt-1.5 flex items-baseline gap-1.5 text-2xl leading-none font-semibold">
                  <span>{value.toLocaleString()}</span>
                  {item.suffix && (
                    <span className="text-gp-text-secondary text-sm font-semibold">
                      {item.suffix}
                    </span>
                  )}
                </p>
                <p className="text-gp-text-placeholder mt-1.5 truncate text-xs font-medium">
                  {item.helper}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
