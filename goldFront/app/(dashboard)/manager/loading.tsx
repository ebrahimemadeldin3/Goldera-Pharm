"use client";

import { usePathname } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { DashboardSkeleton } from "@/components/ui/skeletons/DashboardSkeleton";
import { OverviewSkeleton as ManagerSkeleton } from "@/features/dashboard/components/manager/overview/OverviewPrimitives";

export default function ManagerDashboardLoading() {
  const pathname = usePathname();
  if (pathname !== "/manager" && pathname !== "/manager/")
    return <DashboardSkeleton />;
  return (
    <PageContainer className="min-h-[calc(100vh-80px)] bg-[#F6F8FB] md:p-6">
      <ManagerSkeleton />
    </PageContainer>
  );
}
