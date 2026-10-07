import SalesHeader from "@/features/sales/components/SalesHeader";
import SalesTable from "@/features/sales/components/SalesTable";
import { SalesErrorState } from "@/features/sales/components/SalesErrorState";
import { getRepSalesAction } from "@/features/sales/api";
import {
  extractSales,
  getSalesTotalCount,
  normalizeSalesDateFilter,
} from "@/features/sales/lib/utils";
import { PageContainer } from "@/components/layout/page-container";
import type { SalesQueryParams } from "@/features/sales/lib/types";

type PageProps = {
  searchParams: Promise<{
    date?: string;
    dateFrom?: string;
    dateTo?: string;
    sheetName?: string;
    timeFilter?: string;
    q?: string;
    page?: string;
    limit?: string;
  }>;
};

export const dynamic = "force-dynamic";

const MAX_SAFE_SALES_PAGE_SIZE = 1000;

async function getAllRepSales(params: SalesQueryParams) {
  const firstResult = await getRepSalesAction({
    ...params,
    page: 1,
    limit: MAX_SAFE_SALES_PAGE_SIZE,
  });

  if (!firstResult.success) return firstResult;

  const firstSales = extractSales(firstResult.data);
  const totalCount = getSalesTotalCount(firstResult.data, firstSales.length);
  const totalPages = Math.ceil(totalCount / MAX_SAFE_SALES_PAGE_SIZE);

  if (totalPages <= 1) return firstResult;

  const remainingResults = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getRepSalesAction({
        ...params,
        page: index + 2,
        limit: MAX_SAFE_SALES_PAGE_SIZE,
      }),
    ),
  );

  const failed = remainingResults.find((result) => !result.success);
  if (failed) return failed;

  return {
    success: true,
    data: {
      status: "success",
      results: totalCount,
      data: [
        ...firstSales,
        ...remainingResults.flatMap((result) => extractSales(result.data)),
      ],
    },
  };
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const { date, dateFrom, dateTo, sheetName, timeFilter, q } = params;
  const selectedTimeFilter = normalizeSalesDateFilter(timeFilter);
  const searchQuery = q ?? "";
  const apiDate = dateFrom || dateTo ? undefined : date;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const result = await getAllRepSales({
    date: apiDate,
    dateFrom,
    dateTo,
    sheetName,
    timeFilter: selectedTimeFilter,
    q: searchQuery,
  });

  if (!result.success) {
    return (
      <PageContainer className="min-h-[calc(100vh-80px)] space-y-5 overflow-x-hidden bg-[#F6F8FB]">
        <SalesHeader sales={[]} />
        <SalesErrorState message={result.error?.message} />
      </PageContainer>
    );
  }

  const sales = extractSales(result.data);
  const hasAppliedFilters = Boolean(
    date ||
    dateFrom ||
    dateTo ||
    sheetName ||
    selectedTimeFilter !== "all" ||
    searchQuery.trim(),
  );

  return (
    <PageContainer className="flex min-h-[calc(100vh-80px)] flex-col gap-6 overflow-x-hidden">
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
