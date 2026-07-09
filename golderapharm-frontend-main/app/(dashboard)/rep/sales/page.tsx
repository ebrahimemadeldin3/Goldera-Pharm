import SalesHeader from "@/features/sales/components/SalesHeader";
import SalesTable from "@/features/sales/components/SalesTable";
import { getRepSalesAction } from "@/features/sales/api";
import { extractSales } from "@/features/sales/lib/utils";

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
  const { date, sheetName} = params;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

 
  const result = await getRepSalesAction({ date, sheetName, page, limit });

  if (!result.success) {
    throw new Error(result.error?.message || "Failed to fetch sales");
  }


  const sales = extractSales(result.data);

 
  // Try to derive totalCount from response envelope if available
 let totalCount = 0;
if(sales) {
  totalCount = Object(result.data).results as number || sales.length;
}
 
  return (
    <main className="bg-secondary-very-light min-h-[calc(100vh-80px)] p-5 *:min-[1440px]:w-270.75! lg:w-5xl">
      <SalesHeader
        sales={sales}
        selectedDate={date}
        selectedSheetName={sheetName}
      />
      <SalesTable sales={sales} page={page} limit={limit} totalCount={totalCount} />
    </main>
  );
}
