import ForecastRequestsList from "@/features/forecast/components/ForecastRequestsList";
import { getAllForecastsAction } from "@/features/forecast/api/management";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: { page?: string; limit?: string } }) {
   const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;
  
  const result = await getAllForecastsAction(page, limit);

  if (!result.success || !result.data) {
    return (
      <PageContainer className="flex flex-col gap-6">
        <div className="text-dashboard-red flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm">
            {result.error?.message || "Failed to load forecast requests"}
          </p>
        </div>
      </PageContainer>
    );
  }

  const { data, results } = result.data;

  return (
    <PageContainer className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl/9 font-normal text-black md:text-[34px]/10">
            Forecast Requests
          </h1>
          <p className="text-secondary-dark text-base/6">
            Review and manage forecast submissions from medical representatives
          </p>
        </div>
        <div className="bg-system-primary rounded-lg px-4 py-2">
          <p className="text-xs text-white opacity-80">Total Requests</p>
          <p className="text-2xl font-semibold text-white">{results}</p>
        </div>
      </header>
      <ForecastRequestsList
        forecasts={data}
        page={page}
        limit={limit}
        totalCount={result.totalCount ?? results}
      />
    </PageContainer>
  );
}
