"use client";

import type { CSSProperties } from "react";
import { Check, CircleDashed, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfile } from "../lib/types";
import {
  getProfileCompletionItems,
  getProfileCompletionPercentage,
  profileCardClass,
} from "../lib/utils";
import { useInView } from "../lib/use-in-view";

export default function ProfileCompletion({
  profile,
  variant = "standard",
}: {
  profile: UserProfile;
  variant?: "standard" | "manager";
}) {
  const { ref, visible } = useInView<HTMLDivElement>(0.25);
  const percentage = getProfileCompletionPercentage(profile);
  const items = getProfileCompletionItems(profile);
  const remaining = items.filter((item) => !item.done);
  const nextItem = remaining[0]?.label;

  if (variant === "manager") {
    return (
      <section
        ref={ref}
        aria-label="Profile completion"
        className={cn(
          `${profileCardClass} p-5`,
          "profile-inview",
          visible && "profile-inview-visible",
        )}
        style={{ transitionDelay: "280ms" } as CSSProperties}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="profile-section-icon manager-profile-icon-container-gold flex size-10 shrink-0 items-center justify-center rounded-[12px] ring-1 ring-inset">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-gp-navy-900 text-lg font-semibold">
                Profile Completion
              </h2>
              <p className="text-gp-text-muted mt-1 text-sm leading-5 font-medium">
                Complete your profile to keep your account information accurate.
              </p>
            </div>
          </div>

          <p className="text-gp-navy-900 shrink-0 text-2xl leading-none font-semibold">
            {percentage}%
          </p>
        </div>

        <div
          className="bg-gp-border-subtle mt-5 h-2.5 overflow-hidden rounded-full"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Profile completion"
        >
          <div
            className="profile-completion-fill manager-profile-completion-fill relative h-full origin-left rounded-full bg-[linear-gradient(90deg,var(--gp-gold-500),var(--gp-gold-600))]"
            style={{
              transform: visible ? `scaleX(${percentage / 100})` : "scaleX(0)",
            }}
          />
        </div>

        <p className="text-gp-text-placeholder mt-3 text-xs font-medium">
          {nextItem ? `Next focus: ${nextItem}` : "All key fields are ready."}
        </p>

        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                "manager-profile-checklist-item flex min-w-0 items-center gap-2 rounded-[10px] px-2.5 py-2 text-sm transition-[background-color,transform] duration-[170ms]",
                item.done ? "text-gp-navy-900" : "text-gp-text-muted",
              )}
            >
              {item.done ? (
                <span className="bg-gp-success-soft text-gp-success ring-gp-success-border flex size-5 shrink-0 items-center justify-center rounded-full ring-1 ring-inset">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
              ) : (
                <span className="border-gp-border-control flex size-5 shrink-0 items-center justify-center rounded-full border bg-white" />
              )}
              <span className="min-w-0 truncate font-medium">{item.label}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      aria-label="Profile completion"
      className={cn(
        `${profileCardClass} p-5`,
        "profile-inview",
        visible && "profile-inview-visible",
      )}
      style={{ transitionDelay: "180ms" } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="text-gold-600 size-4 shrink-0" aria-hidden />
            <h3 className="text-base font-semibold text-[#182033]">
              Profile Completion
            </h3>
          </div>
          <p className="mt-1 text-xs leading-5 text-[#667085]">
            {nextItem ? `Next focus: ${nextItem}` : "All key fields are ready."}
          </p>
        </div>

        <p className="text-3xl leading-none font-semibold text-[#182033]">
          {percentage}%
        </p>
      </div>

      <div
        className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#EEF1F6]"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Profile completion"
      >
        <div
          className="profile-completion-fill from-gold-300 to-gold-600 h-full origin-left rounded-full bg-linear-to-r"
          style={{
            transform: visible ? `scaleX(${percentage / 100})` : "scaleX(0)",
          }}
        />
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
        {items.map((item) => (
          <li key={item.id} className="flex min-w-0 items-center gap-2 text-sm">
            {item.done ? (
              <span className="bg-gp-success-soft text-gp-success ring-gp-success-border flex size-5 shrink-0 items-center justify-center rounded-full ring-1 ring-inset">
                <Check className="size-3.5" aria-hidden />
              </span>
            ) : (
              <CircleDashed
                className="size-5 shrink-0 text-[#98A2B3]"
                aria-hidden
              />
            )}
            <span className="truncate text-[#667085]">{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
