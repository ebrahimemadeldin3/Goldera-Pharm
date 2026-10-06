import SalesHeader from "@/features/sales/components/SalesHeader";
import SalesTable from "@/features/sales/components/SalesTable";
import { SalesErrorState } from "@/features/sales/components/SalesErrorState";
import { getManagerRepSalesAction, getSalesAction } from "@/features/sales/api";
import {
  extractSales,
  getSalesTotalCount,
  normalizeSalesDateFilter,
} from "@/features/sales/lib/utils";
import { getManagerTeamAction } from "@/features/team/api";
import { PageContainer } from "@/components/layout/page-container";
import type { SalesQueryParams } from "@/features/sales/lib/types";

type PageProps = {
  searchParams: Promise<{
    repId?: string;
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

async function getAllManagerSales(
  repId: string | undefined,
  params: SalesQueryParams,
) {
  const firstResult = repId
    ? await getManagerRepSalesAction(repId, {
        ...params,
        page: 1,
        limit: MAX_SAFE_SALES_PAGE_SIZE,
      })
    : await getSalesAction({
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
    Array.from({ length: totalPages - 1 }, (_, index) => {
      const pageNumber = index + 2;
      return repId
        ? getManagerRepSalesAction(repId, {
            ...params,
            page: pageNumber,
            limit: MAX_SAFE_SALES_PAGE_SIZE,
          })
        : getSalesAction({
            ...params,
            page: pageNumber,
            limit: MAX_SAFE_SALES_PAGE_SIZE,
          });
    }),
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

  const { repId, date, dateFrom, dateTo, sheetName, timeFilter, q } = params;
  const selectedTimeFilter = normalizeSalesDateFilter(timeFilter);
  const searchQuery = q ?? "";
  const apiDate = dateFrom || dateTo ? undefined : date;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const queryParams: SalesQueryParams = {
    date: apiDate,
    dateFrom,
    dateTo,
    sheetName,
    timeFilter: selectedTimeFilter,
    q: searchQuery,
  };

  const [result, repsRes] = await Promise.all([
    getAllManagerSales(repId, queryParams),
    getManagerTeamAction("MEDICAL_REP"),
  ]);

  const repOptions = (repsRes.medicalReps ?? []).map((rep) => ({
    id: rep.id,
    name: rep.name,
  }));

  if (!result.success) {
    return (
      <PageContainer className="min-h-[calc(100vh-80px)] space-y-5 overflow-x-hidden bg-[#F6F8FB]">
        <SalesHeader
          sales={[]}
          repOptions={repOptions}
          selectedRepId={repId}
          selectedDate={date}
          selectedDateFrom={dateFrom}
          selectedDateTo={dateTo}
          selectedSheetName={sheetName}
          selectedTimeFilter={selectedTimeFilter}
          searchQuery={searchQuery}
        />
        <SalesErrorState
          message={
            result.error?.message || "We couldn't retrieve sales records."
          }
        />
      </PageContainer>
    );
  }

  const sales = extractSales(result.data);

  const hasAppliedFilters = Boolean(
    repId ||
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
        repOptions={repOptions}
        selectedRepId={repId}
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
