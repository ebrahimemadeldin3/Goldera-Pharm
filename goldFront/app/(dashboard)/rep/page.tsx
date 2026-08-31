import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, CheckSquare } from "lucide-react";
import { getCurrentUser } from "@/features/auth/api";
import { getRepDashboardAction } from "@/features/dashboard/api";
import { PageContainer } from "@/components/layout/page-container";
import { RepDashboardHeader } from "@/features/dashboard/components/rep/RepDashboardHeader";
import { RepKPICards } from "@/features/dashboard/components/rep/RepKPICards";
import { NextVisitCard } from "@/features/dashboard/components/rep/NextVisitCard";
import { TodayAgenda } from "@/features/dashboard/components/rep/TodayAgenda";
import { RepQuickActions } from "@/features/dashboard/components/rep/RepQuickActions";
import { RepMonthlySummary } from "@/features/dashboard/components/rep/RepMonthlySummary";
import RepPendingRequests from "@/features/dashboard/components/rep/RepPendingRequests";

export const dynamic = "force-dynamic";

export default async function RepDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  // Fetch rep dashboard data
  const dashboardResult = await getRepDashboardAction();
  const dashboardData = dashboardResult.success ? dashboardResult.data : null;

  const userName = user.data.name || "Representative";
  const location = dashboardData?.rep?.subRegion?.name || user.data.location || null;
  const todayVisits = dashboardData?.metrics?.todayVisits || [];

  return (
    <PageContainer className="min-h-[calc(100vh-80px)] space-y-6 pb-20 lg:pb-6">
      {/* 1. Personal Header */}
      <RepDashboardHeader userName={userName} location={location} />

      {/* 2. Top KPI Cards Row */}
      <RepKPICards
        targetAchievement={dashboardData?.metrics?.targetAchievement}
        coverage={dashboardData?.metrics?.coverage}
        pendingRequestsCount={dashboardData?.metrics?.pendingRequestsCount}
      />

      {/* 3. Next Visit Highlight Banner */}
      <NextVisitCard visits={todayVisits} />

      {/* 4. Main Workspace Layout (Left: Agenda | Right: Quick Actions & Metrics) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Today's Agenda */}
        <div className="lg:col-span-8 space-y-6 min-w-0">
          <TodayAgenda visits={todayVisits} />
        </div>

        {/* Right Sidebar Column */}
        <aside className="lg:col-span-4 space-y-6 min-w-0">
          <RepQuickActions />

          <RepMonthlySummary
            targetAchievement={dashboardData?.metrics?.targetAchievement}
            coverage={dashboardData?.metrics?.coverage}
            totalSales={dashboardData?.metrics?.totalSales}
          />

          <RepPendingRequests
            requests={dashboardData?.metrics?.pendingRequests}
          />
        </aside>
      </div>

      {/* 5. Mobile Field Sticky Action Bar (390px Viewports) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-3 border-t border-[#E5E8EF] bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden">
        <Link
          href="/rep/visits/add"
          className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] bg-[#168557] px-3 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(22,133,87,0.22)] hover:bg-[#107349]"
        >
          <Plus size={16} />
          <span>Add Visit</span>
        </Link>
        <Link
          href="/rep/visits/report"
          className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border border-[#E5E8EF] bg-white px-3 text-xs font-semibold text-[#182033] hover:bg-[#F9FAFB]"
        >
          <CheckSquare size={16} className="text-[#667085]" />
          <span>Submit Report</span>
        </Link>
      </div>
    </PageContainer>
  );
}
