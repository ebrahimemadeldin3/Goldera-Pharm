import ProductsHeader from "@/features/products/components/ProductsHeader";
import ProductsList from "@/features/products/components/ProductsList";
import { getProductsAction } from "@/features/products/api";
import type { ProductApiResponse } from "@/features/products/lib/types";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams?: { page?: string; limit?: string };
}) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const result = await getProductsAction(page, limit);

  if (!result.success) {
    throw new Error(result.error?.message || "Failed to fetch products");
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
    <PageContainer className="min-h-[calc(100vh-80px)] overflow-x-hidden bg-[#F6F8FB]">
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
