import SalesHeader from "@/features/sales/components/SalesHeader";
import SalesTable from "@/features/sales/components/SalesTable";
import { getManagerRepSalesAction, getSalesAction } from "@/features/sales/api";
import {
  extractSales,
  getSalesTotalCount,
  normalizeSalesDateFilter,
} from "@/features/sales/lib/utils";
import { getSupervisorTeamAction } from "@/features/team/api";
import { PageContainer } from "@/components/layout/page-container";

type PageProps = {
  searchParams: {
    repId?: string;
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
  const {
    repId,
    date,
    dateFrom,
    dateTo,
    sheetName,
    timeFilter,
    q,
    page: pageStr,
    limit: limitStr,
  } = await searchParams;
  const selectedTimeFilter = normalizeSalesDateFilter(timeFilter);
  const searchQuery = q ?? "";
  const apiDate = dateFrom || dateTo ? undefined : date;
  const page = pageStr ? Number(pageStr) : 1;
  const limit = limitStr ? Number(limitStr) : 10;

  const [result, repsRes] = await Promise.all([
    repId
      ? getManagerRepSalesAction(repId, {
          date: apiDate,
          sheetName,
          page,
          limit,
        })
      : getSalesAction({ date: apiDate, sheetName, page, limit }),
    getSupervisorTeamAction(),
  ]);

  if (!result.success) {
    throw new Error(result.error?.message || "Failed to fetch sales");
  }

  let sales = extractSales(result.data);
  const totalCount = getSalesTotalCount(result.data, sales.length);

  if (totalCount !== sales.length) {
    const allSalesResult = repId
      ? await getManagerRepSalesAction(repId, {
          date: apiDate,
          sheetName,
          page: 1,
          limit: totalCount,
        })
      : await getSalesAction({
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

  let repOptions: { id: string; name: string }[] = [];
  if (repsRes.success && repsRes.members && repsRes.members.length > 0) {
    repOptions = repsRes.members.map((rep) => ({
      id: rep.id,
      name: rep.name,
    }));
  }
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
