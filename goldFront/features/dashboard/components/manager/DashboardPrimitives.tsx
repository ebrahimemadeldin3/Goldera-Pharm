"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CircleAlert,
  Inbox,
  RotateCw,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUSES } from "./dashboard-utils";
import styles from "./manager-dashboard.module.css";

export function LocalError({
  name,
  retry,
  pending,
}: {
  name: string;
  retry: () => void;
  pending: boolean;
}) {
  return (
    <div
      role="status"
      className="flex min-h-24 flex-col items-start justify-center gap-3 py-3 text-sm"
    >
      <p className="flex items-center gap-2 text-[#667085]">
        <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
        Unable to load {name} data.
      </p>
      <button
        type="button"
        onClick={retry}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg border border-[#DDE3EE] px-3 py-1.5 font-semibold disabled:opacity-50"
      >
        <RotateCw aria-hidden="true" className="size-3.5" />
        {pending ? "Retrying..." : "Retry"}
      </button>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 px-3 text-center text-sm text-[#667085]">
      <Inbox aria-hidden="true" className="size-6 text-[#8A94A6]" />
      <p>{children}</p>
    </div>
  );
}

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  href,
  scope,
  error,
}: {
  label: string;
  value: ReactNode;
  helper: string;
  icon: LucideIcon;
  href: string;
  scope: string;
  error?: ReactNode;
}) {
  return (
    <article className={cn(styles.card, styles.stat)}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg border border-[#EEE5CF] bg-[#FFFCF5] text-[#A37C27]">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <span className="text-xs text-[#667085]">{scope}</span>
      </div>
      <h2 className="mt-3 text-sm font-medium text-[#667085]">
        <Link href={href} className="rounded-sm hover:text-[#101D36]">
          {label}
        </Link>
      </h2>
      {error || (
        <>
          <div className="mt-1 text-[30px] leading-tight font-semibold break-words tabular-nums">
            {value}
          </div>
          <p className="mt-2 text-xs leading-5 text-[#667085]">{helper}</p>
        </>
      )}
    </article>
  );
}

export function ChartCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <article className={cn(styles.card, "flex flex-col p-5 sm:p-6")}>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-[#667085]">{subtitle}</p>
        </div>
        {action}
      </header>
      <div className="min-h-56 flex-1 md:min-h-62">{children}</div>
    </article>
  );
}

export function DataTableCard({
  title,
  subtitle,
  href,
  children,
}: {
  title: string;
  subtitle: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <article className={cn(styles.card, "flex flex-col overflow-hidden")}>
      <header className="px-5 pt-5 pb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-[#667085]">{subtitle}</p>
      </header>
      <div className="min-h-64 flex-1">{children}</div>
      <footer className="border-t border-[#EEF1F5] px-5 py-3">
        <Link
          href={href}
          aria-label={`View all ${title.toLowerCase()}`}
          className="inline-flex items-center gap-2 rounded-sm text-sm font-semibold"
        >
          View all
          <ArrowRight aria-hidden="true" className="size-4 text-[#A37C27]" />
        </Link>
      </footer>
    </article>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const item = STATUSES.find((entry) => entry.value === status);
  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-[#344054]"
      style={{ backgroundColor: `${item?.color ?? "#8A94A6"}12` }}
    >
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: item?.color ?? "#8A94A6" }}
      />
      <span>{item?.label ?? status}</span>
    </span>
  );
}

export function DashboardSkeleton() {
  return (
    <div
      className={cn(styles.dashboard, "space-y-6")}
      role="status"
      aria-label="Loading dashboard"
    >
      <span className="sr-only">Loading dashboard</span>
      <div className="flex min-h-20 items-center justify-between gap-4">
        <div className="space-y-3">
          <div className={cn(styles.skeleton, "h-8 w-44")} />
          <div className={cn(styles.skeleton, "h-4 w-60 max-w-full")} />
        </div>
        <div className={cn(styles.skeleton, "hidden h-10 w-40 md:block")} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className={cn(styles.card, styles.stat, "space-y-3")}>
            <div className={cn(styles.skeleton, "size-8")} />
            <div className={cn(styles.skeleton, "h-4 w-28")} />
            <div className={cn(styles.skeleton, "h-8 w-32")} />
            <div className={cn(styles.skeleton, "h-3 w-40")} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {[0, 1, 2, 3, 4, 5].map((key) => (
          <div key={key} className={cn(styles.skeleton, "h-12")} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className={cn(styles.card, "p-6")}>
            <div className={cn(styles.skeleton, "mb-6 h-5 w-40")} />
            <div className={cn(styles.skeleton, styles.plot)} />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {[0, 1].map((key) => (
          <div key={key} className={cn(styles.card, "space-y-5 p-5")}>
            <div className={cn(styles.skeleton, "h-5 w-36")} />
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className={cn(styles.skeleton, "h-9 w-full")} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
