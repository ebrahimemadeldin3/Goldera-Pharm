import SalesHeader from "@/features/sales/components/SalesHeader";
import SalesTable from "@/features/sales/components/SalesTable";
import { getRepSalesAction } from "@/features/sales/api";
import { extractSales } from "@/features/sales/lib/utils";
import { PageContainer } from "@/components/layout/page-container";

type PageProps = {
  searchParams: {
    date?: string;
    sheetName?: string;
    page?: string;
    limit?: string;
  };
};

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const { date, sheetName } = params;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const result = await getRepSalesAction({ date, sheetName, page, limit });

  if (!result.success) {
    throw new Error(result.error?.message || "Failed to fetch sales");
  }

  const sales = extractSales(result.data);

  // Try to derive totalCount from response envelope if available
  let totalCount = 0;
  if (sales) {
    totalCount = (Object(result.data).results as number) || sales.length;
  }

  return (
    <PageContainer className="min-h-[calc(100vh-80px)] space-y-5 overflow-x-hidden bg-[#F6F8FB]">
      <SalesHeader
        sales={sales}
        selectedDate={date}
        selectedSheetName={sheetName}
      />
      <SalesTable
        sales={sales}
        page={page}
        limit={limit}
        totalCount={totalCount}
      />
    </PageContainer>
  );
}
