import SalesHeader from "@/features/sales/components/SalesHeader";
import SalesTable from "@/features/sales/components/SalesTable";
import { getManagerRepSalesAction, getSalesAction } from "@/features/sales/api";
import { extractSales } from "@/features/sales/lib/utils";
import { getManagerTeamAction } from "@/features/team/api";

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
  const params = await searchParams;
  
  
  const { repId, date, sheetName } = params;
  
  
  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const [result, repsRes] = await Promise.all([
    repId
      ? getManagerRepSalesAction(repId, { date, sheetName, page, limit })
      : getSalesAction({ date, sheetName, page, limit }),
    getManagerTeamAction("MEDICAL_REP"),
  ]);

  if (!result.success) {
    throw new Error(result.error?.message || "Failed to fetch sales");
  }

  const sales = extractSales(result.data);

   let totalCount = 0;
if(sales) {
  totalCount = Object(result.data).results as number || sales.length;
}
  const repOptions = (repsRes.medicalReps ?? []).map((rep) => ({
    id: rep.id,
    name: rep.name,
  }));

  return (
    <main className="bg-secondary-very-light min-h-[calc(100vh-80px)] p-5 *:min-[1440px]:w-270.75! lg:w-5xl">
      <SalesHeader
        sales={sales}
        repOptions={repOptions}
        selectedRepId={repId}
        selectedDate={date}
        selectedSheetName={sheetName}
      />
      <SalesTable sales={sales} page={page} limit={limit} totalCount={totalCount} />
    </main>
  );
}
