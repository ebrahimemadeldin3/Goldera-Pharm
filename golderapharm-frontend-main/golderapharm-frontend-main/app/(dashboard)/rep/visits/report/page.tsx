import VisitReportForm from "@/features/visits/components/VisitReportForm";
import {
  getVisitReportData,
  getVisitReports,
} from "@/features/visits/api/reports";
import { getProductsAction } from "@/features/products/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ visitId?: string }>;
}) {
  const params = await searchParams;
  const visitId = params.visitId || "1"; // Default for now, should come from URL

  const [visitData, _reports, productsResult] = await Promise.all([
    getVisitReportData(visitId),
    getVisitReports(),
    getProductsAction(),
  ]);

  const products = productsResult.success
    ? (productsResult.data ?? [])
    : [];

  return (
    <main className="flex flex-col gap-6 p-6 *:min-[1440px]:w-270.75! *:lg:w-5xl">
      <div className="mx-auto max-w-300">
        <header className="mb-6 flex items-center justify-start gap-2">
          <Link
            href="/rep/visits"
            className="border-system-primary text-system-primary hover:bg-system-primary inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white hover:border-transparent hover:text-white"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="ml-3">
            <h1 className="text-[34px]/10 font-normal text-black">
              Visit Report
            </h1>
            <p className="text-secondary-dark text-sm/6">
              Document your visit with {visitData.doctor.name}
            </p>
          </div>
        </header>

        <VisitReportForm visitData={visitData} products={products} />
      </div>
    </main>
  );
}
