import { getCurrentUser } from "@/features/auth/api";
import { getSupervisorDashboardAction } from "@/features/dashboard/api";
import MainCards from "@/features/dashboard/components/mainCards";
import PendingRequests from "@/features/dashboard/components/pendingRequests";
import { ProductsPerformance } from "@/features/dashboard/components/productsPerformance";
import QuickActions from "@/features/dashboard/components/quickActions";
import RecentRepRequests from "@/features/dashboard/components/recentRepRequests";
import { SalesByRegion } from "@/features/dashboard/components/salesByRegion";
import { fetchProfile } from "@/features/profile/api";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const [dashboardResult, profile] = await Promise.all([
    getSupervisorDashboardAction(),
    fetchProfile().catch(() => null),
  ]);
  const dashboardData = dashboardResult.success ? dashboardResult.data : null;

  return (
    <main className="bg-secondary-very-light px-2 py-5 min-[1440px]:w-270.75! min-[1440px]:p-6 lg:w-5xl">
      <header className="gradient-blue flex-col items-start justify-center rounded-[14px] p-6 min-[1440px]:w-270.75!">
        <h1 className="text-2xl/8 font-medium text-white">
          Welcome back, Dr/ {user.data.name}
        </h1>
        <p className="text-base/6 font-normal text-[#DCFCE7]">
          {profile?.location || user.data.location || "Supervisor"}
        </p>
      </header>
      <section className="mt-6 flex gap-6 min-[1440px]:w-270.75! lg:w-5xl">
        <div className="flex flex-col gap-6 min-[1440px]:w-[714px]!">
          <MainCards
            roleBasePath="/supervisor"
            totalSales={dashboardData?.totalSales}
            pendingRequestsCount={dashboardData?.pendingRequestsCount}
          />
          <SalesByRegion salesByRegion={dashboardData?.salesByRegion} />
          <PendingRequests
            requests={dashboardData?.requests}
            requestsCount={dashboardData?.requestsCount}
            viewAllHref="/supervisor/requests"
          />
        </div>
        <aside className="flex flex-col gap-6">
          <QuickActions />
          <ProductsPerformance
            productPerformance={dashboardData?.productPerformance}
          />
          <RecentRepRequests
            plans={dashboardData?.plans}
            viewAllHref="/supervisor/plan"
          />
        </aside>
      </section>
    </main>
  );
}
