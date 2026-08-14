import { getCurrentUser } from "@/features/auth/api";
import { getManagerDashboardAction } from "@/features/dashboard/api";
import MainCards from "@/features/dashboard/components/mainCards";
import PendingRequests from "@/features/dashboard/components/pendingRequests";
import { ProductsPerformance } from "@/features/dashboard/components/productsPerformance";
import QuickActions from "@/features/dashboard/components/quickActions";
import RecentRepRequests from "@/features/dashboard/components/recentRepRequests";
import { SalesByRegion } from "@/features/dashboard/components/salesByRegion";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  // Fetch dashboard data
  const dashboardResult = await getManagerDashboardAction();
  const dashboardData = dashboardResult.success ? dashboardResult.data : null;

  return (
    <PageContainer>
      <header className="gradient-gold w-full flex-col items-start justify-center rounded-[14px] p-6">
        <h1 className="text-2xl/8 font-medium text-white">
          Welcome back, Dr/ {user.data.name}
        </h1>
        <p className="text-base/6 font-normal text-[#DCFCE7]">
          Golderapharm Manager
        </p>
      </header>
      <section className="mt-6 grid w-full min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
        <div className="flex min-w-0 flex-col gap-6">
          <MainCards
            roleBasePath="/manager"
            totalSales={dashboardData?.totalSales}
            pendingRequestsCount={dashboardData?.pendingRequestsCount}
          />
          {/* <SupervisorsPerformance /> */}
          <SalesByRegion salesByRegion={dashboardData?.salesByRegion} />
          <PendingRequests
            requests={dashboardData?.requests}
            requestsCount={dashboardData?.requestsCount}
            viewAllHref="/manager/requests"
          />
        </div>
        <aside className="flex min-w-0 flex-col gap-6">
          <QuickActions />
          <ProductsPerformance
            productPerformance={dashboardData?.productPerformance}
          />
          <RecentRepRequests
            plans={dashboardData?.plans}
            viewAllHref="/manager/plan"
          />
        </aside>
      </section>
      <section className="my-6 flex w-full flex-row gap-6 *:flex-1">
        {/* <RecentActivity /> */}
      </section>
      {/* <SupervisorsPerformanceRegional /> */}
    </PageContainer>
  );
}
