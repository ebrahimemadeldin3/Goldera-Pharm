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
      <div className="flex items-center justify-end pb-1">
        <Link href="/rep/forecast/new">
          <Button className="h-10 rounded-[10px] bg-gp-rep-primary px-4 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(22,133,87,0.22)] transition-all duration-[170ms] hover:bg-gp-rep-primary-hover focus-visible:ring-2 focus-visible:ring-[#168557]/30 cursor-pointer">
            <Plus className="mr-1.5 h-4 w-4" />
            New Forecast
          </Button>
        </Link>
      </div>
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
