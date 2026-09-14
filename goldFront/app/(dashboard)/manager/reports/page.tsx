import { CircleAlert } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { getAllVisitReportsAction } from "@/features/reports/api";
import ManagerVisitReports from "@/features/reports/components/manager/ManagerVisitReports";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams?: { page?: string; limit?: string };
}) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const result = await getAllVisitReportsAction(page, limit);

  if (!result.success || !result.data) {
    return (
      <PageContainer className="bg-gp-surface-page flex min-h-[calc(100vh-80px)] flex-col gap-5 overflow-x-hidden">
        <div className="border-gp-danger-border bg-gp-danger-soft text-gp-danger flex items-start gap-3 rounded-[12px] border px-4 py-3.5">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">
              Failed to load visit reports
            </p>
            <p className="text-gp-danger/80 mt-0.5 text-sm">
              {!result.success && result.error
                ? result.error.message
                : "Please refresh the page or try again in a moment."}
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const { reports, totalCount } = result.data;

  return (
    <PageContainer className="bg-gp-surface-page flex min-h-[calc(100vh-80px)] flex-col gap-5 overflow-x-hidden">
      <header className="reports-page-header relative overflow-hidden py-0.5">
        <span
          className="pointer-events-none absolute inset-x-0 -bottom-8 h-16 bg-[linear-gradient(100deg,rgba(201,164,76,0.14)_0%,rgba(201,164,76,0)_42%,rgba(16,29,54,0.06)_100%)]"
          aria-hidden="true"
        />
        <p className="reports-eyebrow text-gp-gold-600 flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
          <span
            className="reports-eyebrow-line bg-gp-gold-500 inline-block h-px w-6"
            aria-hidden="true"
          />
          Workflow / Visit Reports
        </p>
        <h1 className="reports-header-title text-gp-navy-900 mt-2 text-[26px] leading-tight font-semibold sm:text-[30px]">
          Visit Reports
        </h1>
        <p className="reports-header-subtitle text-gp-text-muted mt-1 max-w-2xl text-sm leading-6 font-medium">
          Review field activity, visit quality, samples and submitted rep
          reports.
        </p>
      </header>

      <ManagerVisitReports
        reports={reports}
        page={page}
        limit={limit}
        totalCount={totalCount}
      />
    </PageContainer>
  );
}
