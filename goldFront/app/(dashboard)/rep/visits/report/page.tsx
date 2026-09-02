import VisitReportForm from "@/features/visits/components/VisitReportForm";
import {
  getVisitReportData,
} from "@/features/visits/api/reports";
import { getProductsAction } from "@/features/products/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ visitId?: string }>;
}) {
  const params = await searchParams;
  const visitId = params.visitId || "1"; // Default for now, should come from URL

  const [visitData, productsResult] = await Promise.all([
    getVisitReportData(visitId),
    getProductsAction(),
  ]);

  const products = productsResult.success
    ? (productsResult.data ?? [])
    : [];

  return (
    <PageContainer className="flex flex-col gap-6">
      <div className="mx-auto max-w-300">
        <header className="mb-6 flex flex-wrap items-center justify-start gap-3">
          <Link
            href="/rep/visits"
            className="border-[#E5E8EF] text-[#182033] hover:bg-[#F9FAFB] inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border bg-white transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-[#182033] sm:text-3xl">
              Visit Report
            </h1>
            <p className="mt-0.5 text-sm font-medium text-[#667085]">
              Document your visit with Dr/ {visitData.doctor.name}
            </p>
          </div>
        </header>

        <VisitReportForm visitData={visitData} products={products} />
      </div>
    </PageContainer>
  );
}
