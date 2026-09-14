"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import {
  ChevronRight,
  FileText,
  Mail,
  Pencil,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfile } from "../lib/types";
import { getRoleHomePath, profileCardClass } from "../lib/utils";
import { useInView } from "../lib/use-in-view";

type QuickActionsProps = {
  profile: UserProfile;
  editing: boolean;
  onEdit: (editing: boolean) => void;
  variant?: "standard" | "manager";
};

type QuickAction = {
  label: string;
  description: string;
  icon: LucideIcon;
  iconTone?: "gold" | "navy" | "neutral";
  href?: string;
  external?: boolean;
  onClick?: () => void;
};

const actionClass =
  "profile-action flex w-full items-center gap-3 rounded-xl border border-[#E5E8EF] bg-white px-3 py-3 text-left transition-all duration-200 hover:-translate-y-px hover:border-gold-300 hover:bg-gold-50/60 hover:shadow-[0_10px_24px_rgba(32,36,45,0.07)]";

export default function QuickActions({
  profile,
  editing,
  onEdit,
  variant = "standard",
}: QuickActionsProps) {
  const { ref, visible } = useInView<HTMLDivElement>(0.3);
  const roleHomePath = getRoleHomePath(profile.role);

  const actions: QuickAction[] = [
    {
      label: editing ? "Cancel Editing" : "Edit Profile",
      description: editing
        ? "Discard unsaved changes"
        : "Update personal details",
      icon: editing ? X : Pencil,
      iconTone: editing ? "neutral" : "navy",
      onClick: () => onEdit(!editing),
    },
    {
      label: variant === "manager" ? "Account Settings" : "Settings",
      description: "Privacy settings",
      icon: Settings,
      iconTone: "navy",
      href: `${roleHomePath}/settings`,
    },
    {
      label: variant === "manager" ? "Send Email" : "Email",
      description: profile.email,
      icon: Mail,
      iconTone: "navy",
      href: `mailto:${profile.email}`,
    },
    ...(profile.resume?.trim()
      ? [
          {
            label: "Resume",
            description: "Open uploaded file",
            icon: FileText,
            iconTone: "navy" as const,
            href: profile.resume.trim(),
            external: true,
          },
        ]
      : []),
  ];

  function renderAction(action: QuickAction) {
    const Icon = action.icon;
    const rowClassName =
      variant === "manager"
        ? "profile-action manager-profile-action flex w-full items-center gap-3 rounded-[12px] border border-transparent bg-white px-3 py-3 text-left transition-all duration-[190ms] ease-out"
        : actionClass;
    const content = (
      <>
        <span
          className={cn(
            "profile-action-symbol flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors duration-200 ring-inset",
            variant === "manager"
              ? `manager-profile-action-symbol-${action.iconTone ?? "navy"}`
              : "bg-gp-surface-subtle text-gp-navy-900 ring-gp-border-control",
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-gp-navy-900 block text-sm font-semibold">
            {action.label}
          </span>
          <span className="text-gp-text-muted block truncate text-xs">
            {action.description}
          </span>
        </span>
        <ChevronRight
          className="profile-action-icon text-gp-navy-900 size-4 shrink-0"
          aria-hidden
        />
      </>
    );

    if (action.href) {
      if (action.external) {
        return (
          <a
            key={action.label}
            href={action.href}
            target="_blank"
            rel="noreferrer"
            className={rowClassName}
          >
            {content}
          </a>
        );
      }

      return (
        <Link key={action.label} href={action.href} className={rowClassName}>
          {content}
        </Link>
      );
    }

    return (
      <button
        key={action.label}
        type="button"
        onClick={action.onClick}
        aria-pressed={action.label.includes("Cancel") ? editing : undefined}
        className={cn(rowClassName, "cursor-pointer")}
      >
        {content}
      </button>
    );
  }

  return (
    <section
      ref={ref}
      aria-label="Quick actions"
      className={cn(
        `${profileCardClass} p-5`,
        variant === "manager" && "overflow-hidden",
        "profile-inview",
        visible && "profile-inview-visible",
      )}
      style={
        variant === "manager"
          ? ({ transitionDelay: "230ms" } as CSSProperties)
          : undefined
      }
    >
      {variant === "manager" ? (
        <div className="flex items-start gap-3">
          <span className="profile-section-icon bg-gp-gold-50 text-gp-gold-700 ring-gp-gold-300 flex size-10 shrink-0 items-center justify-center rounded-[12px] ring-1 ring-inset">
            <Pencil className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-gp-navy-900 text-lg font-semibold">
              Quick Actions
            </h2>
            <p className="text-gp-text-muted mt-1 text-sm leading-5 font-medium">
              Common account shortcuts.
            </p>
          </div>
        </div>
      ) : (
        <>
          <h3 className="text-base font-semibold text-[#182033]">
            Quick Actions
          </h3>
          <p className="mt-1 text-xs text-[#667085]">
            Common account shortcuts.
          </p>
        </>
      )}

      <div
        className={cn(
          "mt-4 space-y-3",
          variant === "manager" &&
            "border-gp-border-subtle bg-gp-surface-subtle rounded-[14px] border p-2",
        )}
      >
        {actions.map(renderAction)}
      </div>
    </section>
  );
}
