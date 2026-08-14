import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type InfoFieldProps = {
  label: string;
  icon?: LucideIcon;
  accent?: "gold" | "blue" | "green" | "teal" | "purple" | "slate";
  delay?: number;
  span?: boolean;
  children: React.ReactNode;
};

const accentClass = {
  gold: "bg-gold-50 text-gold-600 ring-gold-300/50",
  blue: "bg-blue-50 text-[#3972D5] ring-blue-200",
  green: "bg-emerald-50 text-emerald-600 ring-emerald-200",
  teal: "bg-teal-50 text-[#17A392] ring-teal-200",
  purple: "bg-violet-50 text-[#7857C8] ring-violet-200",
  slate: "bg-slate-100 text-[#667085] ring-slate-200",
} satisfies Record<NonNullable<InfoFieldProps["accent"]>, string>;

/**
 * Label / value pair used inside information grids. Labels stay small and
 * muted; values are slightly stronger so they never compete with labels.
 */
export function InfoField({
  label,
  icon: Icon,
  accent = "slate",
  delay,
  span,
  children,
}: InfoFieldProps) {
  return (
    <div
      className={cn(
        "profile-detail-item group min-w-0 rounded-xl border border-transparent bg-[#F8FAFC]/75 px-3 py-3",
        span && "sm:col-span-2",
      )}
      style={
        {
          "--profile-delay": delay ? `${delay}ms` : "0ms",
        } as CSSProperties
      }
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <span
            className={cn(
              "profile-detail-icon mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset",
              accentClass[accent],
            )}
          >
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-[#667085] uppercase">
            <span>{label}</span>
          </div>
          <div className="mt-1 text-sm leading-6 font-semibold break-words text-[#182033]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Quiet, non-alarming rendering for information that has not been filled in. */
export function MutedValue({ children }: { children: React.ReactNode }) {
  return <span className="font-medium text-[#98A2B3] italic">{children}</span>;
}
