import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CreateForecastForm from "@/features/forecast/components/CreateForecastForm";
import ForecastStats from "@/features/forecast/components/ForecastStats";
import { getMyForecastsAction } from "@/features/forecast/api";
import { calculateForecastStats } from "@/features/forecast/lib/utils";
import { PageContainer } from "@/components/layout/page-container";

export default async function Page() {
  const result = await getMyForecastsAction();
  const forecasts = result.success ? (result.data ?? []) : [];

  // Calculate stats using utility
  const stats = calculateForecastStats(forecasts);

  return (
    <PageContainer className="flex flex-col gap-6">
      <header className="flex flex-col items-start justify-center gap-1.5">
        <Link
          href="/rep/forecast"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#168557] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Forecasts
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#182033] sm:text-3xl">
          New Forecast
        </h1>
        <p className="text-sm text-[#667085]">
          Plan your product distribution across doctors
        </p>
      </header>
      <ForecastStats
        totalProducts={stats.totalProducts}
        totalAllocation={stats.totalAllocation}
        myDoctors={stats.myDoctors}
        pendingApproval={stats.pendingApproval}
      />
      <CreateForecastForm />
    </PageContainer>
  );
}
