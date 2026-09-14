import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export function MemberProfileError({ backUrl }: { backUrl: string }) {
  return (
    <PageContainer className="bg-gp-surface-page flex min-h-[calc(100vh-80px)] items-center justify-center">
      <section className="border-gp-border-default bg-gp-surface-card shadow-gp-card w-full max-w-lg rounded-[16px] border p-6 text-center sm:p-8">
        <span className="bg-gp-danger-soft text-gp-danger mx-auto flex size-11 items-center justify-center rounded-[12px]">
          <AlertCircle className="size-5" aria-hidden="true" />
        </span>
        <h1 className="text-gp-navy-900 mt-4 text-xl font-semibold">
          Team member not found
        </h1>
        <p className="text-gp-text-muted mt-2 text-sm leading-6 font-medium">
          The requested team member could not be loaded. They may have been
          removed or you may not have access to this profile.
        </p>
        <Link
          href={backUrl}
          className="border-gp-gold-300 text-gp-navy-850 hover:bg-gp-gold-50 focus-visible:ring-gp-gold-500/25 mt-5 inline-flex h-10 items-center gap-2 rounded-[10px] border bg-white px-4 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Team
        </Link>
      </section>
    </PageContainer>
  );
}

export function MemberProfileLoading() {
  return (
    <PageContainer className="bg-gp-surface-page min-h-[calc(100vh-80px)] space-y-5 overflow-x-hidden">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Skeleton className="size-10 shrink-0 rounded-[10px] bg-slate-200" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 max-w-full bg-slate-200" />
            <Skeleton className="h-4 w-72 max-w-full bg-slate-100" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36 flex-1 rounded-[10px] bg-slate-200" />
          <Skeleton className="size-10 rounded-[10px] bg-slate-200" />
        </div>
      </header>

      <section className="border-gp-border-default shadow-gp-card rounded-[16px] border bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <Skeleton className="mx-auto size-24 shrink-0 rounded-full bg-slate-200 sm:mx-0 sm:size-[104px]" />
          <div className="min-w-0 flex-1 space-y-4">
            <Skeleton className="mx-auto h-8 w-72 max-w-full bg-slate-200 sm:mx-0" />
            <div className="flex justify-center gap-2 sm:justify-start">
              <Skeleton className="h-6 w-36 rounded-full bg-slate-100" />
              <Skeleton className="h-6 w-20 rounded-full bg-slate-100" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-8 rounded-[9px] bg-slate-100"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-gp-border-default grid overflow-hidden rounded-[16px] border bg-white sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="border-gp-border-subtle p-5 sm:border-l">
            <Skeleton className="h-3 w-24 bg-slate-100" />
            <Skeleton className="mt-3 h-7 w-20 bg-slate-200" />
            <Skeleton className="mt-2 h-3 w-28 bg-slate-100" />
          </div>
        ))}
      </section>

      <Skeleton className="h-12 w-full rounded-[14px] bg-white" />
      <section className="grid gap-5 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, panelIndex) => (
          <div
            key={panelIndex}
            className="border-gp-border-default rounded-[16px] border bg-white p-5"
          >
            <div className="flex gap-3 border-b border-slate-100 pb-4">
              <Skeleton className="size-9 rounded-[10px] bg-slate-100" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40 bg-slate-200" />
                <Skeleton className="h-3 w-64 max-w-full bg-slate-100" />
              </div>
            </div>
            <div className="mt-2 space-y-1">
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <Skeleton key={rowIndex} className="h-12 w-full bg-slate-50" />
              ))}
            </div>
          </div>
        ))}
      </section>
    </PageContainer>
  );
}
