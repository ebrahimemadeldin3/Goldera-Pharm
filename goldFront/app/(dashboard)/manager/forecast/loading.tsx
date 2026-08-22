import type { CSSProperties } from "react";
import { PageContainer } from "@/components/layout/page-container";

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`forecast-skeleton-shimmer rounded-[12px] ${className}`}
      aria-hidden="true"
    />
  );
}

export default function Loading() {
  return (
    <PageContainer className="min-h-[calc(100vh-80px)] space-y-5 overflow-x-hidden bg-[#F6F8FB]">
      <header className="forecast-approval-enter">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-px w-9 rounded-full" />
          <SkeletonBlock className="h-3 w-40" />
        </div>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-3">
            <SkeletonBlock className="h-9 w-64 max-w-full" />
            <SkeletonBlock className="h-4 w-[560px] max-w-full" />
          </div>
          <SkeletonBlock className="h-8 w-52 rounded-full" />
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <article
            key={index}
            className="forecast-kpi-card forecast-approval-stagger flex min-h-[126px] items-center gap-4 rounded-[16px] border border-[#E5E8EF] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
            style={
              { "--forecast-delay": `${80 + index * 70}ms` } as CSSProperties
            }
          >
            <SkeletonBlock className="size-12 rounded-[14px]" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-3 w-28" />
              <SkeletonBlock className="h-8 w-14" />
              <SkeletonBlock className="h-3 w-36" />
            </div>
          </article>
        ))}
      </section>

      <section className="forecast-approval-panel-enter overflow-hidden rounded-[18px] border border-[#E5E8EF] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex flex-col gap-3 border-b border-[#E5E8EF] bg-[#FBFCFE] px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-4 w-28" />
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_150px_170px] lg:w-[620px]">
            <SkeletonBlock className="h-11 w-full" />
            <SkeletonBlock className="h-11 w-full" />
            <SkeletonBlock className="h-11 w-full" />
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:p-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <article
              key={index}
              className="rounded-[16px] border border-[#E5E8EF] bg-white p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 flex-1 gap-3">
                  <SkeletonBlock className="size-12 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <SkeletonBlock className="h-5 w-56 max-w-full" />
                    <SkeletonBlock className="h-4 w-36" />
                    <SkeletonBlock className="h-3 w-48 max-w-full" />
                  </div>
                </div>
                <SkeletonBlock className="h-10 w-36" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((__, metricIndex) => (
                  <SkeletonBlock key={metricIndex} className="h-20 w-full" />
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
