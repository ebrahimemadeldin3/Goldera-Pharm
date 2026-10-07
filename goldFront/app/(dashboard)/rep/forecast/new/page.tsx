import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CreateForecastForm from "@/features/forecast/components/CreateForecastForm";
import ForecastStats from "@/features/forecast/components/ForecastStats";
import { getMyForecastsAction } from "@/features/forecast/api";
import { calculateForecastStats } from "@/features/forecast/lib/utils";
import { PageContainer } from "@/components/layout/page-container";

export default async function Page() {
  const result = await getMyForecastsAction(1, 1000);
  const forecasts = result.success ? (result.data ?? []) : [];

  // Calculate stats using utility
  const stats = calculateForecastStats(forecasts);

  return (
    <PageContainer className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link
          href="/rep/forecast"
          className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#E5E8EF] bg-white px-3 text-xs font-semibold text-[#344054] transition-colors hover:bg-[#F9FAFB]"
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
