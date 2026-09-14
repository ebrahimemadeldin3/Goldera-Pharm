import type { CSSProperties } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Award, ClipboardList, Gauge, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AppraisalStatsProps = {
  avgScore: number;
  excellentCount: number;
  improvingCount: number;
  totalReviews: number;
};

type ToneKey = "avg" | "excellent" | "improving" | "total";

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
  avg: {
    id: "avg",
    label: "Average Score",
    helper: "Average performance across reviews",
    icon: Gauge,
    shell: "border-gp-border-control bg-gp-surface-subtle text-gp-navy-900",
    iconHover:
      "group-hover/card:bg-gp-surface-control group-hover/card:text-gp-navy-900",
    rail: "bg-gp-navy-900",
    railHover: "group-hover/card:bg-gp-navy-900",
    value: "text-gp-navy-900",
  },
  excellent: {
    id: "excellent",
    label: "Excellent Ratings",
    helper: "Top-performing reviews",
    icon: Award,
    shell: "border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700",
    iconHover: "group-hover/card:bg-gp-gold-100 group-hover/card:text-gp-gold-700",
    rail: "bg-gp-gold-500",
    railHover: "group-hover/card:bg-gp-gold-600",
    value: "text-gp-navy-900",
  },
  improving: {
    id: "improving",
    label: "Improving",
    helper: "Reviews showing positive progress",
    icon: TrendingUp,
    shell: "border-gp-success-border bg-gp-success-soft text-gp-success",
    iconHover:
      "group-hover/card:bg-gp-success-soft group-hover/card:text-gp-success",
    rail: "bg-gp-success",
    railHover: "group-hover/card:bg-gp-success",
    value: "text-gp-navy-900",
  },
  total: {
    id: "total",
    label: "Total Reviews",
    helper: "Appraisals recorded",
    icon: ClipboardList,
    shell: "bg-gp-navy-900 text-gp-gold-500 border-transparent",
    iconHover: "group-hover/card:bg-gp-navy-850 group-hover/card:text-gp-gold-500",
    rail: "bg-gp-gold-500",
    railHover: "group-hover/card:bg-gp-gold-600",
    value: "text-gp-navy-900",
  },
};

export function AppraisalStats({
  avgScore,
  excellentCount,
  improvingCount,
  totalReviews,
}: AppraisalStatsProps) {
  const cards: ToneKey[] = ["avg", "excellent", "improving", "total"];
  const values: Record<ToneKey, number> = {
    avg: avgScore,
    excellent: excellentCount,
    improving: improvingCount,
    total: totalReviews,
  };

  return (
    <section
      className="appraisal-section-enter grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      style={{ "--appraisal-enter-delay": "0ms" } as CSSProperties}
      aria-label="Appraisal summary"
    >
      {cards.map((tone, index) => {
        const config = toneStyles[tone];
        const Icon = config.icon;
        const isPercent = tone === "avg";
        return (
          <Card
            key={config.id}
            className="appraisal-kpi-card appraisal-section-enter border-gp-border-default bg-gp-surface-card shadow-gp-card group/card relative gap-0 overflow-hidden rounded-[14px] border py-0"
            style={
              {
                "--appraisal-enter-delay": `${70 + index * 50}ms`,
              } as CSSProperties
            }
          >
            <span
              className={cn(
                "appraisal-kpi-rail absolute top-0 bottom-0 left-0 w-[3px]",
                config.rail,
                config.railHover,
              )}
              aria-hidden="true"
            />
            <CardContent className="flex min-h-[112px] items-center gap-4 py-4 pr-5 pl-[22px] sm:py-5">
              <span
                className={cn(
                  "appraisal-kpi-icon-shell flex size-10 shrink-0 items-center justify-center rounded-[10px] border",
                  config.shell,
                  config.iconHover,
                )}
              >
                <Icon className="appraisal-kpi-icon size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-gp-text-muted text-[11px] leading-4 font-semibold tracking-[0.04em] uppercase">
                  {config.label}
                </p>
                <p
                  className={cn(
                    "appraisal-kpi-value mt-1.5 text-2xl leading-none font-semibold",
                    config.value,
                  )}
                >
                  {isPercent
                    ? `${values[tone].toLocaleString()}%`
                    : values[tone].toLocaleString()}
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