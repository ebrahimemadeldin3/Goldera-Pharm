import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDoctorsAction } from "@/features/doctors/api";
import { getProductsAction } from "@/features/products/api";
import { PageContainer } from "@/components/layout/page-container";
import CreateRequestWizard from "@/features/requests/components/CreateRequestWizard";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [doctorsResult, productsResult] = await Promise.all([
    getDoctorsAction(),
    getProductsAction(),
  ]);

  const doctors = doctorsResult.success ? (doctorsResult.data ?? []) : [];
  const products = productsResult.success ? (productsResult.data ?? []) : [];

  return (
    <PageContainer className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link
          href="/rep/requests"
          className="border-[#E5E8EF] text-[#344054] hover:bg-[#F9FAFB] inline-flex h-9 items-center gap-2 rounded-[10px] border bg-white px-3 text-xs font-semibold transition-colors"
        >
          <ArrowLeft size={15} />
          <span>Back to Requests</span>
        </Link>
      </div>

      <CreateRequestWizard doctors={doctors} products={products} />
    </PageContainer>
  );
}
