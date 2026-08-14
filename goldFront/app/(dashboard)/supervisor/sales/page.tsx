import SalesHeader from "@/features/sales/components/SalesHeader";
import SalesTable from "@/features/sales/components/SalesTable";
import { getManagerRepSalesAction, getSalesAction } from "@/features/sales/api";
import { extractSales } from "@/features/sales/lib/utils";
import { getSupervisorTeamAction } from "@/features/team/api";
import { PageContainer } from "@/components/layout/page-container";

type PageProps = {
  searchParams: {
    repId?: string;
    date?: string;
    sheetName?: string;
    page?: string;
    limit?: string;
  };
};

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: PageProps) {
  const { repId, date, sheetName, page: pageStr, limit: limitStr } = await searchParams;
  const page = pageStr ? Number(pageStr) : 1;
  const limit = limitStr ? Number(limitStr) : 10;

  const [result, repsRes] = await Promise.all([
    repId
      ? getManagerRepSalesAction(repId, { date, sheetName, page, limit })
      : getSalesAction({ date, sheetName, page, limit }),
    getSupervisorTeamAction(),
  ]);

  if (!result.success) {
    throw new Error(result.error?.message || "Failed to fetch sales");
  }

  const sales = extractSales(result.data);
  const raw = result.data as { results?: number; length?: number };
  const totalCount = (raw && (raw.results || raw.length)) || sales.length;

  let repOptions: { id: string; name: string }[] = [];
  if (repsRes.success && repsRes.members && repsRes.members.length > 0) {
    repOptions = repsRes.members.map((rep) => ({
      id: rep.id,
      name: rep.name,
    }));
  }
  
  return (
    <PageContainer className="min-h-[calc(100vh-80px)]">
      <SalesHeader
        sales={sales}
        repOptions={repOptions}
        selectedRepId={repId}
        selectedDate={date}
        selectedSheetName={sheetName}
      />
      <SalesTable sales={sales} page={page} limit={limit} totalCount={totalCount} />
    </PageContainer>
  );
}
