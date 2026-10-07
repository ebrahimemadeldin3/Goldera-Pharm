import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, CheckSquare, CircleAlert, RefreshCw } from "lucide-react";
import { getCurrentUser } from "@/features/auth/api";
import { getRepDashboardAction } from "@/features/dashboard/api";
import { PageContainer } from "@/components/layout/page-container";
import { RepDashboardHeader } from "@/features/dashboard/components/rep/RepDashboardHeader";
import { RepKPICards } from "@/features/dashboard/components/rep/RepKPICards";
import { TodayAgenda } from "@/features/dashboard/components/rep/TodayAgenda";
import { RepQuickActions } from "@/features/dashboard/components/rep/RepQuickActions";
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
  const dashboardError = dashboardResult.success
    ? dashboardData
      ? null
      : { message: "Dashboard data was not returned by the server." }
    : dashboardResult.error;

  const userName = user.data.name || "Representative";
  const location = dashboardData?.rep?.subRegion?.name || user.data.location || null;
  const todayVisits = dashboardData?.metrics?.todayVisits || [];

  return (
    <PageContainer className="min-h-[calc(100vh-80px)] space-y-6 pb-20 lg:pb-6">
      {/* 1. Personal Header */}
      <RepDashboardHeader userName={userName} location={location} />

      {dashboardError ? (
        <div className="flex flex-col gap-3 rounded-[14px] border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3.5 text-[#B42318] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <CircleAlert
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold">
                Dashboard data could not be loaded
              </p>
              <p className="mt-0.5 text-sm text-[#B42318]/80">
                {dashboardError.message ||
                  "Some dashboard sections are unavailable. This is not an empty dashboard state."}
              </p>
            </div>
          </div>
          <Link
            href="/rep"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-[10px] border border-[#B42318]/30 bg-white px-3 text-xs font-semibold text-[#B42318] transition-colors hover:bg-[#FFF1F0]"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Retry
          </Link>
        </div>
      ) : (
        <>
          {/* 2. Top KPI Cards Row */}
          <RepKPICards
            targetAchievement={dashboardData?.metrics?.targetAchievement}
            coverage={dashboardData?.metrics?.coverage}
            totalSales={dashboardData?.metrics?.totalSales}
            pendingRequestsCount={dashboardData?.metrics?.pendingRequestsCount}
          />

          {/* 3. Quick actions strip */}
          <RepQuickActions />

          {/* 4. Today's agenda + pending requests, equal height */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="flex min-w-0 flex-col lg:col-span-8 [&>*]:flex-1">
              <TodayAgenda visits={todayVisits} />
            </div>
            <div className="flex min-w-0 flex-col lg:col-span-4 [&>*]:flex-1">
              <RepPendingRequests
                requests={dashboardData?.metrics?.pendingRequests}
              />
            </div>
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
        </>
      )}
    </PageContainer>
  );
}
