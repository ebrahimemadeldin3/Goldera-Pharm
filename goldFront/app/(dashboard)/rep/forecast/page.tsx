import ForecastStats from "@/features/forecast/components/ForecastStats";
import ForecastManagement from "@/features/forecast/components/ForecastManagement";
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
      <header className="flex flex-wrap items-center justify-between">
        <div className="flex flex-col items-start justify-center">
          <h1 className="font-nomral text-2xl/9 text-black md:text-[34px]/10">
            Product Forecast
          </h1>
          <p className="text-secondary-dark text-base/6">
            Plan your product distribution across doctors
          </p>
        </div>
        <Link href="/rep/forecast/new">
          <Button className="button-system-gradient-primary">
            <Plus className="h-4 w-4 " />
            Create Forecast
          </Button>
        </Link>
      </header>
      <ForecastStats
        totalProducts={stats.totalProducts}
        totalAllocation={stats.totalAllocation}
        myDoctors={stats.myDoctors}
        pendingApproval={stats.pendingApproval}
      />
      <ForecastManagement
        forecasts={forecasts}
        page={page}
        limit={limit}
        totalCount={result.totalCount ?? forecasts.length}
      />
    </PageContainer>
  );
}
