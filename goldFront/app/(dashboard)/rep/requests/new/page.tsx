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
      <header className="flex flex-col items-start justify-center">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#E9F8F1] border border-[#CBEFDD] px-2.5 py-0.5 text-[11px] font-semibold text-[#168557] uppercase tracking-wider">
            New Request
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#182033] sm:text-3xl">
          Create Work Request
        </h1>
        <p className="mt-0.5 text-sm text-[#667085]">
          Follow the guided wizard to submit your expense, sample, or leave request
        </p>
      </header>

      <CreateRequestWizard doctors={doctors} products={products} />
    </PageContainer>
  );
}
