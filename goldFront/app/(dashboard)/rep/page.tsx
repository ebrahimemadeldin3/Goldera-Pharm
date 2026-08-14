import { getCurrentUser } from "@/features/auth/api";
import { getRepDashboardAction } from "@/features/dashboard/api";
import MainCards from "@/features/dashboard/components/mainCards";
import QuickActions from "@/features/dashboard/components/quickActions";
import MonthlyPerformance from "@/features/dashboard/components/rep/MonthlyPerformance";
import RepPendingRequests from "@/features/dashboard/components/rep/RepPendingRequests";
import Summary from "@/features/dashboard/components/rep/Summary";
import TodaySchedule from "@/features/dashboard/components/rep/TodaySchedule";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  // Fetch dashboard data
  const dashboardResult = await getRepDashboardAction();
  const dashboardData = dashboardResult.success ? dashboardResult.data : null;

  return (
    <PageContainer>
      <header className="gradient-green w-full flex-col items-start justify-center rounded-[14px] p-6">
        <h1 className="text-2xl/8 font-medium text-white">
          Welcome back, Dr/ {user.data.name}
        </h1>
        <p className="text-base/6 font-normal text-[#DCFCE7]">
          Medical Representative -{" "}
          {dashboardData?.rep?.subRegion?.name || user.data.location || (
            <span className="inline">Location not set</span>
          )}
        </p>
      </header>
      <section className="mt-6 grid w-full min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
        <div className="flex min-w-0 flex-col gap-6">
          <MainCards
            roleBasePath="/rep"
            coverage={dashboardData?.metrics?.coverage}
            targetAchievement={dashboardData?.metrics?.targetAchievement}
            pendingRequestsCount={dashboardData?.metrics?.pendingRequestsCount}
            totalSales={dashboardData?.metrics?.totalSales}
          />
          <section className="grid grid-cols-1 gap-6 min-[1280px]:grid-cols-2">
            <MonthlyPerformance
              coverage={dashboardData?.metrics?.coverage}
              targetAchievement={dashboardData?.metrics?.targetAchievement}
            />
            <RepPendingRequests
              requests={dashboardData?.metrics?.pendingRequests}
              pendingRequestsCount={
                dashboardData?.metrics?.pendingRequestsCount
              }
            />
          </section>
          <TodaySchedule visits={dashboardData?.metrics?.todayVisits || []} />
        </div>
        <aside className="flex min-w-0 flex-col gap-6">
          <QuickActions />
          <Summary
            todayVisitsCount={dashboardData?.metrics?.todayVisitsCount}
            todayVisits={dashboardData?.metrics?.todayVisits}
          />
        </aside>
      </section>
    </PageContainer>
  );
}
