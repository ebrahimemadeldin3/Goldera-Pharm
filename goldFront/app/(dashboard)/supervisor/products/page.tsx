import ProductsHeader from "@/features/products/components/ProductsHeader";
import ProductsList from "@/features/products/components/ProductsList";
import { getProductsAction } from "@/features/products/api";
import { extractProducts } from "@/features/products/lib/utils";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: { page?: string; limit?: string } }) {
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const limit = searchParams?.limit ? Number(searchParams.limit) : 10;

  const result = await getProductsAction(page, limit);

  if (!result.success) {
    throw new Error(result.error?.message || "Failed to fetch products");
  }

  const raw = result.data as unknown;
  const products = extractProducts(raw);
  const rawResults =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>).results
      : undefined;
  const totalCount = typeof rawResults === "number" ? rawResults : products.length;

  return (
    <PageContainer className="min-h-[calc(100vh-80px)]">
      <ProductsHeader products={products} />
      <ProductsList products={products} page={page} limit={limit} totalCount={totalCount} />
    </PageContainer>
  );
}
