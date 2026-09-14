"use client";

import { RotateCcw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";

export default function ManagerProfileError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer className="bg-gp-surface-page flex min-h-[calc(100vh-80px)] flex-col overflow-x-hidden">
      <section className="border-gp-border-default bg-gp-surface-card shadow-gp-card mx-auto w-full max-w-[1280px] rounded-[16px] border p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="border-gp-danger-border bg-gp-danger-soft text-gp-danger flex size-11 shrink-0 items-center justify-center rounded-[12px] border">
              <ShieldAlert className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-gp-navy-900 text-lg font-semibold">
                Unable to load profile information.
              </h1>
              <p className="text-gp-text-muted mt-1 text-sm leading-6 font-medium">
                Please retry the request.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={reset}
            className="bg-gp-gold-500 shadow-gp-gold-action hover:bg-gp-gold-600 h-10 cursor-pointer gap-2 rounded-[10px] px-4 text-sm font-semibold text-white transition-all duration-[170ms] hover:-translate-y-px active:translate-y-0"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Retry
          </Button>
        </div>
      </section>
    </PageContainer>
  );
}
