import SalesHeader from "@/features/sales/components/SalesHeader";
import SalesTable from "@/features/sales/components/SalesTable";
import { getRepSalesAction } from "@/features/sales/api";
import {
  extractSales,
  getSalesTotalCount,
  normalizeSalesDateFilter,
} from "@/features/sales/lib/utils";
import { PageContainer } from "@/components/layout/page-container";

type PageProps = {
  searchParams: {
    date?: string;
    dateFrom?: string;
    dateTo?: string;
    sheetName?: string;
    timeFilter?: string;
    q?: string;
    page?: string;
    limit?: string;
  };
};

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const { date, dateFrom, dateTo, sheetName, timeFilter, q } = params;
  const selectedTimeFilter = normalizeSalesDateFilter(timeFilter);
  const searchQuery = q ?? "";
  const apiDate = dateFrom || dateTo ? undefined : date;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const result = await getRepSalesAction({
    date: apiDate,
    sheetName,
    page,
    limit,
  });

  if (!result.success) {
    throw new Error(result.error?.message || "Failed to fetch sales");
  }

  let sales = extractSales(result.data);
  const totalCount = getSalesTotalCount(result.data, sales.length);

  if (totalCount !== sales.length) {
    const allSalesResult = await getRepSalesAction({
      date: apiDate,
      sheetName,
      page: 1,
      limit: totalCount,
    });

    if (!allSalesResult.success) {
      throw new Error(
        allSalesResult.error?.message || "Failed to fetch all sales",
      );
    }

    sales = extractSales(allSalesResult.data);
  }
  const hasAppliedFilters = Boolean(
    date ||
    dateFrom ||
    dateTo ||
    sheetName ||
    selectedTimeFilter !== "all" ||
    searchQuery.trim(),
  );

  return (
    <PageContainer className="min-h-[calc(100vh-80px)] space-y-5 overflow-x-hidden bg-[#F6F8FB]">
      <SalesHeader
        sales={sales}
        selectedDate={date}
        selectedDateFrom={dateFrom}
        selectedDateTo={dateTo}
        selectedSheetName={sheetName}
        selectedTimeFilter={selectedTimeFilter}
        searchQuery={searchQuery}
      />
      <SalesTable
        sales={sales}
        page={page}
        limit={limit}
        selectedDate={date}
        selectedDateFrom={dateFrom}
        selectedDateTo={dateTo}
        selectedTimeFilter={selectedTimeFilter}
        searchQuery={searchQuery}
        hasAppliedFilters={hasAppliedFilters}
      />
    </PageContainer>
  );
}
