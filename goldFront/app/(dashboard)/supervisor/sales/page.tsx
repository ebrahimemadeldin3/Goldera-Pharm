import SalesHeader from "@/features/sales/components/SalesHeader";
import SalesTable from "@/features/sales/components/SalesTable";
import { getManagerRepSalesAction, getSalesAction } from "@/features/sales/api";
import { extractSales } from "@/features/sales/lib/utils";
import { getSupervisorTeamAction } from "@/features/team/api";

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
  const raw = result.data as Record<string, unknown> | unknown[];
  const totalCount = (raw && typeof raw === "object" && !Array.isArray(raw) && typeof raw.results === "number" ? raw.results : Array.isArray(raw) ? raw.length : undefined) || sales.length;

  let repOptions: { id: string; name: string }[] = [];
  if (repsRes.success && repsRes.members && repsRes.members.length > 0) {
    repOptions = repsRes.members.map((rep) => ({
      id: rep.id,
      name: rep.name,
    }));
  }
  
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
