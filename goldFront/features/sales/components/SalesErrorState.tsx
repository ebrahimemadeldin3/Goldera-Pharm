"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw } from "lucide-react";

export function SalesErrorState({ message }: { message?: string }) {
  const router = useRouter();

  return (
    <section className="sales-page-enter border-gp-danger-border rounded-2xl border bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="border-gp-danger-border bg-gp-danger-soft text-gp-danger flex size-11 shrink-0 items-center justify-center rounded-[12px] border">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-gp-navy-900 text-base font-semibold">
              Unable to load sales data
            </h2>
            <p className="text-gp-text-muted mt-1 text-sm leading-6 font-medium">
              {message || "We couldn't retrieve sales records."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="bg-gp-navy-900 hover:bg-gp-navy-900/95 focus-visible:ring-gp-gold-500/20 inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(16,29,54,0.16)] transition-[background-color,transform] duration-[170ms] hover:-translate-y-px focus-visible:ring-3 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          <RefreshCw className="text-gp-gold-500 size-4" aria-hidden="true" />
          Try Again
        </button>
      </div>
    </section>
  );
}
