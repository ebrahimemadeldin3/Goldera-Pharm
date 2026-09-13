import VisitReportForm from "@/features/visits/components/VisitReportForm";
import { getVisitReportData } from "@/features/visits/api/reports";
import { getProductsAction } from "@/features/products/api";
import { ArrowLeft, CalendarCheck2 } from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import type { VisitReportData } from "@/features/visits/lib/types/report";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ visitId?: string }>;
}) {
  const params = await searchParams;
  const visitId = params.visitId;

  let visitData: VisitReportData | null = null;
  let errorMsg = "";

  if (visitId) {
    try {
      visitData = await getVisitReportData(visitId);
    } catch {
      errorMsg = "Visit details could not be found or loaded.";
    }
  }

  const productsResult = await getProductsAction().catch(() => ({ success: false, data: [] }));
  const products = productsResult.success && productsResult.data ? productsResult.data : [];

  if (!visitId || !visitData) {
    return (
      <PageContainer className="flex flex-col gap-6">
        <div className="mx-auto max-w-2xl w-full py-8">
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/rep/visits"
              className="border-[#E5E8EF] text-[#344054] hover:bg-[#F9FAFB] inline-flex h-9 items-center gap-2 rounded-[10px] border bg-white px-3 text-xs font-semibold transition-colors"
            >
              <ArrowLeft size={15} />
              <span>Back to Visits</span>
            </Link>
          </div>

          <div className="flex flex-col items-center justify-center rounded-[16px] border border-[#E5E8EF] bg-white p-10 text-center shadow-none">
            <div className="flex size-12 items-center justify-center rounded-[12px] bg-[#E9F8F1] text-[#168557] mb-4">
              <CalendarCheck2 size={24} />
            </div>
            <h2 className="text-base font-bold text-[#182033]">
              {errorMsg || "No visit selected for report submission"}
            </h2>
            <p className="mt-1.5 text-xs text-[#667085] max-w-md">
              To submit a report, please open your Visit Workspace and click &quot;Submit Report&quot; on the specific scheduled visit.
            </p>
            <Link
              href="/rep/visits"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-[10px] bg-gp-rep-primary px-5 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(22,133,87,0.22)] hover:bg-gp-rep-primary-hover transition-all"
            >
              Go to Visit Workspace
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex flex-col gap-6">
      <div className="mx-auto max-w-300">
        <div className="mb-5 flex items-center justify-between">
          <Link
            href="/rep/visits"
            className="border-[#E5E8EF] text-[#344054] hover:bg-[#F9FAFB] inline-flex h-9 items-center gap-2 rounded-[10px] border bg-white px-3 text-xs font-semibold transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Back to Visits</span>
          </Link>
          <span className="text-xs font-medium text-[#667085]">
            Dr. {visitData.doctor.name}
          </span>
        </div>

        <VisitReportForm visitData={visitData} products={products} />
      </div>
    </PageContainer>
  );
}
