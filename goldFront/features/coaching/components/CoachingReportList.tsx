"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  ClipboardCheck,
  FileCheck2,
  Files,
  ListChecks,
  MessageSquareText,
} from "lucide-react";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";
import { cn } from "@/lib/utils";
import { CoachingReport } from "../lib/types";
import CoachingReportCard from "./CoachingReportCard";

type FilterKey = "all" | "pending" | "completed";

type CoachingReportListProps = {
  reports: CoachingReport[];
  isRep?: boolean;
  page?: number;
  limit?: number;
  totalCount?: number;
};

const filterTabs: { id: FilterKey; label: string; icon: typeof Files }[] = [
  { id: "all", label: "All Reports", icon: Files },
  { id: "pending", label: "Pending Feedback", icon: MessageSquareText },
  { id: "completed", label: "Completed", icon: FileCheck2 },
];

export default function CoachingReportList({
  reports,
  isRep = false,
  page = 1,
  limit = 10,
  totalCount = 0,
}: CoachingReportListProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [revealed, setRevealed] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<Record<FilterKey, HTMLButtonElement | null>>({
    all: null,
    pending: null,
    completed: null,
  });

  const counts = useMemo(() => {
    const pending = reports.filter(
      (r) => r.status === "Pending Feedback"
    ).length;
    const completed = reports.filter((r) => r.status === "Completed").length;
    return { all: reports.length, pending, completed };
  }, [reports]);

  const visible = useMemo(() => {
    if (filter === "all") return reports;
    if (filter === "pending")
      return reports.filter((r) => r.status === "Pending Feedback");
    return reports.filter((r) => r.status === "Completed");
  }, [filter, reports]);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || revealed) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [revealed]);

  function handleTabKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    current: FilterKey,
  ) {
    let nextIndex = filterTabs.findIndex((tab) => tab.id === current);
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = filterTabs.length - 1;
    else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (nextIndex + 1) % filterTabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (nextIndex - 1 + filterTabs.length) % filterTabs.length;
    } else {
      return;
    }
    event.preventDefault();
    const next = filterTabs[nextIndex].id;
    setFilter(next);
    tabRefs.current[next]?.focus();
  }

  // --- MEDICAL REP VIEW ---
  if (isRep) {
    const repTabs: Array<{ id: FilterKey; label: string; count: number }> = [
      { id: "all", label: "All Sessions", count: counts.all },
      { id: "pending", label: "Pending Feedback", count: counts.pending },
      { id: "completed", label: "Completed", count: counts.completed },
    ];

    return (
      <div className="rounded-[14px] border border-[#E5E8EF] bg-white p-5 space-y-5">
        {/* Filter Tabs */}
        <div className="flex w-fit flex-wrap items-center gap-1.5 rounded-[12px] bg-[#F6F8FB] p-1 border border-[#E5E8EF]">
          {repTabs.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex cursor-pointer items-center gap-2 rounded-[9px] px-3 py-1.5 text-xs font-semibold transition-all border ${
                  isActive
                    ? "bg-[#E9F8F1] border-[#CBEFDD] text-[#168557] shadow-2xs"
                    : "bg-white border-[#E5E8EF] text-[#667085] hover:text-[#182033]"
                }`}
              >
                {tab.label}
                <span
                  className={`flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                    isActive
                      ? "bg-[#168557] text-white"
                      : "bg-[#F6F8FB] text-[#344054] border border-[#E5E8EF]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Reports List */}
        <div>
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-[#E5E8EF] bg-[#F9FAFB] py-10 px-6 text-center max-h-[220px]">
              <ListChecks className="size-8 text-[#98A2B3] mb-2" />
              <p className="text-sm font-bold text-[#182033]">
                No coaching sessions found
              </p>
              <p className="text-xs text-[#667085] mt-1 max-w-sm">
                Your coaching sessions and supervisor feedback will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {visible.map((r, index) => (
                <CoachingReportCard key={r.id} report={r} isRep={isRep} animationIndex={index} />
              ))}
            </div>
          )}
        </div>

        <TablePaginationFooter
          page={page}
          limit={limit}
          totalCount={totalCount || reports.length}
          itemLabel="coaching reports"
          ariaLabel="Coaching reports pagination"
          pageNavAriaLabel="Coaching report pages"
        />
      </div>
    );
  }

  // --- MANAGER / SUPERVISOR VIEW ---
  const emptyState = {
    all: {
      icon: ClipboardCheck,
      title: "No coaching reports yet",
      description: "Coaching reports will appear here once sessions are documented.",
    },
    pending: {
      icon: MessageSquareText,
      title: "No reports awaiting feedback",
      description: "Everything has been reviewed — nothing is pending.",
    },
    completed: {
      icon: FileCheck2,
      title: "No completed reports",
      description: "Reports will move here once their feedback cycle is done.",
    },
  }[filter];
  const EmptyIcon = emptyState.icon;

  return (
    <section
      ref={(element) => {
        sectionRef.current = element;
      }}
      aria-label="Coaching reports"
      className={cn(
        "coaching-reveal border-gp-border-default bg-gp-surface-card shadow-gp-card overflow-hidden rounded-[16px] border",
        revealed && "is-revealed",
      )}
    >
      <header className="border-gp-border-subtle border-b px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6">
          <div className="min-w-0">
            <h2 className="text-gp-navy-900 text-lg font-semibold">
              Coaching Reports
            </h2>
            <p
              key={`${filter}-${visible.length}`}
              className="coaching-count-refresh text-gp-text-muted mt-0.5 text-sm font-medium"
              aria-live="polite"
            >
              {visible.length === 0
                ? "No reports on this page"
                : `${visible.length} ${visible.length === 1 ? "report" : "reports"} shown on this page`}
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter coaching reports"
            className="border-gp-border-control bg-gp-surface-control grid min-w-0 grid-cols-3 self-start rounded-[12px] border p-1 lg:self-center"
          >
            {filterTabs.map((tabOption) => {
              const TabIcon = tabOption.icon;
              const isSelected = filter === tabOption.id;

              return (
                <button
                  key={tabOption.id}
                  ref={(element) => {
                    tabRefs.current[tabOption.id] = element;
                  }}
                  type="button"
                  role="tab"
                  id={`coaching-tab-${tabOption.id}`}
                  aria-selected={isSelected}
                  aria-controls="coaching-report-results"
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => setFilter(tabOption.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, tabOption.id)}
                  className={cn(
                    "coaching-tab focus-visible:ring-gp-gold-500/25 relative flex min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] px-2 py-2 text-xs font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-[190ms] focus-visible:ring-3 focus-visible:outline-none sm:text-sm",
                    isSelected
                      ? "bg-gp-navy-900 text-white shadow-[0_4px_10px_rgba(16,29,54,0.22)]"
                      : "text-gp-text-muted hover:text-gp-navy-900 hover:bg-gp-navy-900/5 border border-transparent",
                  )}
                >
                  <TabIcon
                    className={cn(
                      "coaching-nav-tab-icon hidden size-3.5 shrink-0 sm:block",
                      isSelected && "text-gp-gold-500",
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 truncate">{tabOption.label}</span>
                  <span
                    className={cn(
                      "coaching-tab-count inline-flex min-w-5 shrink-0 items-center justify-center rounded-full border px-1.5 py-0.5 text-[11px] leading-4 transition-colors duration-[190ms]",
                      isSelected
                        ? "text-gp-gold-500 border-transparent bg-white/10"
                        : tabOption.id === "pending"
                          ? "text-gp-warning border-gp-warning-border bg-gp-warning-soft"
                          : tabOption.id === "completed"
                            ? "text-gp-success border-gp-success-border bg-gp-success-soft"
                            : "text-gp-text-muted border-gp-border-subtle bg-gp-surface-subtle",
                    )}
                  >
                    {counts[tabOption.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div
        key={filter}
        id="coaching-report-results"
        role="tabpanel"
        aria-labelledby={`coaching-tab-${filter}`}
        className="coaching-results-transition p-4 sm:p-5"
      >
        {visible.length > 0 ? (
          <div className="flex flex-col gap-3.5">
            {visible.map((report, index) => (
              <CoachingReportCard
                key={report.id}
                report={report}
                isRep={isRep}
                animationIndex={index}
              />
            ))}
          </div>
        ) : (
          <div className="coaching-empty-state border-gp-border-control bg-gp-surface-subtle rounded-[14px] border border-dashed px-5 py-8 text-center">
            <span className="bg-gp-gold-50 text-gp-gold-700 mx-auto flex size-11 items-center justify-center rounded-full">
              <EmptyIcon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="text-gp-navy-900 mt-3 text-[15px] font-semibold">
              {emptyState.title}
            </h3>
            <p className="text-gp-text-muted mx-auto mt-1 max-w-md text-sm leading-6 font-medium">
              {emptyState.description}
            </p>
          </div>
        )}
      </div>

      <TablePaginationFooter
        page={page}
        limit={limit}
        totalCount={totalCount}
        itemLabel="reports"
        ariaLabel="Coaching reports pagination"
        pageNavAriaLabel="Coaching reports pages"
        tone="navy"
      />
    </section>
  );
}
