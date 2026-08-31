import ForecastStats from "@/features/forecast/components/ForecastStats";
import { RepForecastHub } from "@/features/forecast/components/RepForecastHub";
import { getMyForecastsAction } from "@/features/forecast/api";
import { calculateForecastStats } from "@/features/forecast/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";

export default async function Page({ searchParams }: { searchParams?: { page?: string; limit?: string } }) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const result = await getMyForecastsAction(page, limit);
  const forecasts = result.success ? (result.data ?? []) : [];

  // Calculate stats using utility
  const stats = calculateForecastStats(forecasts);

  return (
    <PageContainer className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col items-start justify-center">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#E9F8F1] border border-[#CBEFDD] px-2.5 py-0.5 text-[11px] font-semibold text-[#168557] uppercase tracking-wider">
              Planning
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#182033] sm:text-3xl">
            Forecast
          </h1>
          <p className="mt-0.5 text-sm text-[#667085]">
            Plan and track your product distribution forecasts
          </p>
        </div>
        <Link href="/rep/forecast/new">
          <Button className="h-10 rounded-[10px] bg-gp-rep-primary px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(22,133,87,0.22)] transition-all duration-[170ms] hover:bg-gp-rep-primary-hover focus-visible:ring-2 focus-visible:ring-[#168557]/30">
            <Plus className="mr-1.5 h-4 w-4" />
            New Forecast
          </Button>
        </Link>
      </header>
      <ForecastStats
        totalProducts={stats.totalProducts}
        totalAllocation={stats.totalAllocation}
        myDoctors={stats.myDoctors}
        pendingApproval={stats.pendingApproval}
      />
      <RepForecastHub
        forecasts={forecasts}
        page={page}
        limit={limit}
        totalCount={result.totalCount ?? forecasts.length}
      />
    </PageContainer>
  );
}
