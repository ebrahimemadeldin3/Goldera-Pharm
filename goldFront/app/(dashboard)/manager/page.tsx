import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { getCurrentUser } from "@/features/auth/api";
import ManagerOverviewDashboard from "@/features/dashboard/components/manager/overview/ManagerOverviewDashboard";
import { getManagerOverview } from "@/features/dashboard/components/manager/overview/api";

export const dynamic = "force-dynamic";

export default async function ManagerHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  const data = await getManagerOverview();
  return (
    <PageContainer className="min-h-[calc(100vh-80px)] bg-[#F6F8FB] md:p-6">
      <ManagerOverviewDashboard initial={data} now={new Date().toISOString()} />
    </PageContainer>
  );
}
