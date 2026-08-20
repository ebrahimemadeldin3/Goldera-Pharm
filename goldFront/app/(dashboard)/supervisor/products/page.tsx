import ProductsHeader from "@/features/products/components/ProductsHeader";
import ProductsList from "@/features/products/components/ProductsList";
import { getProductsAction } from "@/features/products/api";
import { extractProducts } from "@/features/products/lib/utils";

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
  const totalCount = (raw && typeof raw === "object" && typeof (raw as Record<string, unknown>).results === "number" ? (raw as Record<string, unknown>).results as number : undefined) || products.length;

  return (
    <main className="bg-secondary-very-light min-h-[calc(100vh-80px)] p-5 *:min-[1440px]:w-270.75! lg:w-5xl">
      <ProductsHeader products={products} />
      <ProductsList products={products} page={page} limit={limit} totalCount={totalCount} />
    </main>
  );
}
