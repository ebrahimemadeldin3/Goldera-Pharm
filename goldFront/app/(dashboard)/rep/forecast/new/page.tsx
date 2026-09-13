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
      <div className="flex items-center gap-2">
        <Link
          href="/rep/forecast"
          className="border-[#E5E8EF] text-[#344054] hover:bg-[#F9FAFB] inline-flex h-9 items-center gap-2 rounded-[10px] border bg-white px-3 text-xs font-semibold transition-colors"
        >
          <ArrowLeft size={15} />
          <span>Back to Forecasts</span>
        </Link>
      </div>
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
