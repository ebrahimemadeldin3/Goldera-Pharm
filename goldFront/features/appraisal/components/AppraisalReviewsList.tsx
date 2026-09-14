"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  BriefcaseMedical,
  ClipboardList,
  Plus,
  RotateCcw,
  SearchX,
  UserCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";
import { cn } from "@/lib/utils";
import type { Review } from "../lib/types";
import { openAppraisalDialog } from "../lib/events";
import { AppraisalToolbar } from "./AppraisalToolbar";
import AppraisalCard from "./AppraisalCard";

type TabId = "all" | "supervisors" | "reps";

type PeriodFilterOption = {
  value: string;
  label: string;
  group: "quick" | "actual";
};

type AppraisalReviewsListProps = {
  reviews: Review[];
  page?: number;
  limit?: number;
  totalCount?: number;
};

const emptyStates: Record<
  TabId,
  { icon: LucideIcon; title: string; description: string }
> = {
  all: {
    icon: ClipboardList,
    title: "No appraisals found",
    description:
      "No reviews match the current filters. Try adjusting your filters or create a new appraisal.",
  },
  supervisors: {
    icon: UserCog,
    title: "No supervisor appraisals",
    description:
      "Supervisor reviews will appear here once they are recorded.",
  },
  reps: {
    icon: BriefcaseMedical,
    title: "No representative appraisals",
    description:
      "Medical representative reviews will appear here once they are recorded.",
  },
};

export function AppraisalReviewsList({
  reviews,
  page = 1,
  limit = 10,
  totalCount = 0,
}: AppraisalReviewsListProps) {
  const [period, setPeriod] = useState("all");
  const [location, setLocation] = useState("all");
  const [tab, setTab] = useState<TabId>("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [revealed, setRevealed] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  const counts = useMemo(
    () => ({
      all: reviews.length,
      supervisors: reviews.filter((review) => review.role === "Supervisor")
        .length,
      reps: reviews.filter((review) => review.role === "Medical Rep").length,
    }),
    [reviews],
  );

  const periodOptions = useMemo<PeriodFilterOption[]>(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;
    const previousQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
    const previousQuarterYear =
      currentQuarter === 1 ? currentYear - 1 : currentYear;
    const actualPeriods = Array.from(
      new Set(reviews.map((review) => review.period).filter(Boolean)),
    ).sort((a, b) => b.localeCompare(a));

    return [
      { value: "all", label: "All Periods", group: "quick" },
      {
        value: "current-quarter",
        label: `Current Quarter (Q${currentQuarter} ${currentYear})`,
        group: "quick",
      },
      {
        value: "previous-quarter",
        label: `Previous Quarter (Q${previousQuarter} ${previousQuarterYear})`,
        group: "quick",
      },
      {
        value: "current-year",
        label: `Current Year (${currentYear})`,
        group: "quick",
      },
      {
        value: "previous-year",
        label: `Previous Year (${currentYear - 1})`,
        group: "quick",
      },
      ...actualPeriods.map((periodLabel) => ({
        value: periodLabel,
        label: periodLabel,
        group: "actual" as const,
      })),
    ];
  }, [reviews]);

  const locationOptions = useMemo(
    () =>
      Array.from(
        new Set(
          reviews
            .map((review) => review.location?.trim())
            .filter((locationValue): locationValue is string =>
              Boolean(locationValue),
            ),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [reviews],
  );

  const selectedPeriodLabel =
    periodOptions.find((option) => option.value === period)?.label ?? period;

  const selectedLocationLabel = location === "all" ? "All Locations" : location;

  const visible = useMemo(() => {
    const trimmedQuery = deferredQuery.trim().toLowerCase();
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;
    const previousQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
    const previousQuarterYear =
      currentQuarter === 1 ? currentYear - 1 : currentYear;

    return reviews.filter((review) => {
      const [reviewQuarter, reviewYearRaw] = review.period.split(" ");
      const reviewYear = Number(reviewYearRaw);
      const matchPeriod = (() => {
        if (period === "all") return true;
        if (period === "current-quarter") {
          return review.period === `Q${currentQuarter} ${currentYear}`;
        }
        if (period === "previous-quarter") {
          return review.period === `Q${previousQuarter} ${previousQuarterYear}`;
        }
        if (period === "current-year") return reviewYear === currentYear;
        if (period === "previous-year") return reviewYear === currentYear - 1;
        return review.period === period || review.period === period.toUpperCase();
      })();
      const matchLocation =
        location === "all" || review.location === location;
      const matchTab =
        tab === "all"
          ? true
          : tab === "supervisors"
            ? review.role === "Supervisor"
            : review.role === "Medical Rep";
      const matchQuery =
        trimmedQuery.length === 0
          ? true
          : `${review.name} ${review.email} ${review.location || ""} ${review.role} ${review.managerName} ${review.period} ${reviewQuarter}`
              .toLowerCase()
              .includes(trimmedQuery);
      return matchPeriod && matchLocation && matchTab && matchQuery;
    });
  }, [reviews, period, location, tab, deferredQuery]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (period !== "all") count += 1;
    if (location !== "all") count += 1;
    if (tab !== "all") count += 1;
    if (query.trim().length > 0) count += 1;
    return count;
  }, [period, location, tab, query]);

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

  function resetFilters() {
    setPeriod("all");
    setLocation("all");
    setTab("all");
    setQuery("");
  }

  const emptyState = emptyStates[tab];
  const EmptyIcon = activeFilterCount > 0 ? SearchX : emptyState.icon;
  const totalReviewCount = Math.max(totalCount, counts.all);

  return (
    <section
      ref={(element) => {
        sectionRef.current = element;
      }}
      aria-label="Appraisals list"
      className={cn(
        "appraisal-reveal border-gp-border-default bg-gp-surface-card shadow-gp-card overflow-hidden rounded-[16px] border",
        revealed && "is-revealed",
      )}
    >
      <header className="border-gp-border-subtle border-b px-4 py-4 sm:px-5">
        <AppraisalToolbar
          period={period}
          location={location}
          tab={tab}
          query={query}
          counts={counts}
          activeFilterCount={activeFilterCount}
          visibleCount={visible.length}
          totalCount={totalReviewCount}
          periodOptions={periodOptions}
          selectedPeriodLabel={selectedPeriodLabel}
          locationOptions={locationOptions}
          selectedLocationLabel={selectedLocationLabel}
          onChangePeriod={setPeriod}
          onChangeLocation={setLocation}
          onChangeTab={setTab}
          onChangeQuery={setQuery}
          onResetFilters={resetFilters}
        />
      </header>

      <div
        key={`${period}-${location}-${tab}-${query}`}
        id="appraisal-results-panel"
        role="tabpanel"
        aria-labelledby={`appraisal-tab-${tab}`}
        className="appraisal-results-transition p-4 sm:p-5"
      >
        {visible.length > 0 ? (
          <div className="flex flex-col gap-3.5">
            {visible.map((review, index) => (
              <AppraisalCard
                key={review.id}
                review={review}
                animationIndex={index}
              />
            ))}
          </div>
        ) : (
          <div className="appraisal-empty-state border-gp-border-control bg-gp-surface-subtle rounded-[14px] border border-dashed px-5 py-10 text-center">
            <span className="bg-gp-gold-50 text-gp-gold-700 mx-auto flex size-10 items-center justify-center rounded-[10px]">
              <EmptyIcon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="text-gp-navy-900 mt-4 text-[15px] font-semibold">
              {activeFilterCount > 0 ? "No reviews found" : emptyState.title}
            </h3>
            <p className="text-gp-text-muted mx-auto mt-1.5 max-w-md text-sm leading-6 font-medium">
              {activeFilterCount > 0
                ? "Try changing your filters or search."
                : emptyState.description}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="appraisal-btn border-gp-border-control bg-gp-surface-card text-gp-text-secondary hover:border-gp-gold-300 hover:bg-gp-gold-50 hover:text-gp-gold-700 focus-visible:ring-gp-gold-500/25 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] border px-4 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-[170ms] focus-visible:ring-3 focus-visible:outline-none"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Clear Filters
                </button>
              )}
              <button
                type="button"
                onClick={openAppraisalDialog}
                className="appraisal-btn border-gp-gold-500 bg-gp-gold-500 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] border px-4 text-sm font-semibold text-white shadow-gp-gold-action transition-[background-color,box-shadow,transform] duration-[170ms] hover:-translate-y-px hover:bg-gp-gold-600 hover:shadow-[0_10px_24px_rgba(201,164,76,0.22)] focus-visible:ring-[3px] focus-visible:ring-[#C9A44C]/25 focus-visible:outline-none active:translate-y-0 active:scale-[0.98]"
              >
                <Plus className="size-4" aria-hidden="true" />
                New Appraisal
              </button>
            </div>
          </div>
        )}
      </div>

      <TablePaginationFooter
        page={page}
        limit={limit}
        totalCount={totalCount}
        itemLabel="reviews"
        ariaLabel="Appraisals pagination"
        pageNavAriaLabel="Appraisal pages"
        tone="navy"
      />
    </section>
  );
}
