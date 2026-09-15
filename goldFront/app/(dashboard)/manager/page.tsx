import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { getCurrentUser } from "@/features/auth/api";
import ManagerDashboard from "@/features/dashboard/components/manager/ManagerDashboard";
import { loadDashboardData } from "@/features/dashboard/components/manager/dashboard-data";

export const dynamic = "force-dynamic";

export default async function ManagerHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  const data = await loadDashboardData();
  return (
    <PageContainer className="min-h-[calc(100vh-80px)] bg-[#F6F8FB] md:p-6">
      <ManagerDashboard data={data} />
    </PageContainer>
  );
}
