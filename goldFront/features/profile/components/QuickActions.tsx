"use client";

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
};

type QuickAction = {
  label: string;
  description: string;
  icon: LucideIcon;
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
      onClick: () => onEdit(!editing),
    },
    {
      label: "Settings",
      description: "Privacy settings",
      icon: Settings,
      href: `${roleHomePath}/settings`,
    },
    {
      label: "Email",
      description: profile.email,
      icon: Mail,
      href: `mailto:${profile.email}`,
    },
    ...(profile.resume?.trim()
      ? [
          {
            label: "Resume",
            description: "Open uploaded file",
            icon: FileText,
            href: profile.resume.trim(),
            external: true,
          },
        ]
      : []),
  ];

  function renderAction(action: QuickAction) {
    const Icon = action.icon;
    const content = (
      <>
        <span className="profile-action-symbol flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F6F8FB] text-[#667085] ring-1 ring-[#E5E8EF] transition-colors duration-200 ring-inset">
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-[#182033]">
            {action.label}
          </span>
          <span className="block truncate text-xs text-[#667085]">
            {action.description}
          </span>
        </span>
        <ChevronRight
          className="profile-action-icon size-4 shrink-0 text-[#98A2B3]"
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
            className={actionClass}
          >
            {content}
          </a>
        );
      }

      return (
        <Link key={action.label} href={action.href} className={actionClass}>
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
        className={cn(actionClass, "cursor-pointer")}
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
        "profile-inview",
        visible && "profile-inview-visible",
      )}
    >
      <h3 className="text-base font-semibold text-[#182033]">Quick Actions</h3>
      <p className="mt-1 text-xs text-[#667085]">Common account shortcuts.</p>

      <div className="mt-4 space-y-3">{actions.map(renderAction)}</div>
    </section>
  );
}
