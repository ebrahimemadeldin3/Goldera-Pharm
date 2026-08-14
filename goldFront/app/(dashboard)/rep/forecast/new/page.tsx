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
      <header className="flex flex-col items-start justify-center">
        <h1 className="font-nomral text-[34px] text-black">Product Forecast</h1>
        <p className="text-secondary-dark text-[16px]">
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
