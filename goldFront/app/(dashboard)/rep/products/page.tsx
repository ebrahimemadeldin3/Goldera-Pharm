import { CircleAlert } from "lucide-react";
import ProductsHeader from "@/features/products/components/ProductsHeader";
import ProductsList from "@/features/products/components/ProductsList";
import { getProductsAction } from "@/features/products/api";
import type { ProductApiResponse } from "@/features/products/lib/types";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; limit?: string }>;
}) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const result = await getProductsAction(undefined, undefined, false);

  if (!result.success) {
    return (
      <PageContainer className="min-h-[calc(100vh-80px)] flex flex-col gap-6">
        <ProductsHeader />
        <div className="flex items-start gap-3 rounded-[12px] border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3.5 text-[#B42318]">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">Unable to load products</p>
            <p className="mt-0.5 text-sm text-[#B42318]/80">
              {result.error?.message || "We couldn't load the product catalog."}
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const raw = result.data as unknown;
  let products: ProductApiResponse[] = [];
  let totalCount = 0;
  if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    if (Array.isArray(r.data)) products = r.data as ProductApiResponse[];
    else if (Array.isArray(r.products))
      products = r.products as ProductApiResponse[];
    else if (Array.isArray(raw)) products = raw as ProductApiResponse[];
  }

  totalCount = (result.results as number) ?? products.length;

  return (
    <PageContainer className="min-h-[calc(100vh-80px)] flex flex-col gap-6">
      <ProductsHeader />
      <ProductsList
        products={products}
        page={page}
        limit={limit}
        totalCount={totalCount}
      />
    </PageContainer>
  );
}
