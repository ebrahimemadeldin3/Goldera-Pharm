import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { getCurrentUser } from "@/features/auth/api";
import { getManagerDashboardAction } from "@/features/dashboard/api";
import ManagerDashboard from "@/features/dashboard/components/manager/ManagerDashboard";
import { getSalesAction } from "@/features/sales/api";
import {
  extractSales,
  getSalesTotalCount,
} from "@/features/sales/lib/utils";
import { getManagerVisitsAction } from "@/features/visits/api";
import { getDoctorsAction } from "@/features/doctors/api";
import { getPharmaciesAction } from "@/features/pharmacies/api";
import { getManagerTeamRequestsAction } from "@/features/requests/api";
import { getManagerTeamAction } from "@/features/team/api";
import { getManagerPlansAction } from "@/features/plan/api/get";
import { getAllVisitReportsAction } from "@/features/reports/api";
import { getAllForecastsAction } from "@/features/forecast/api/management";
import { getAppraisalReviewsAction } from "@/features/appraisal/api";
import type { SaleApiResponse } from "@/features/sales/lib/types";

export const dynamic = "force-dynamic";

async function getAllSalesForDashboard() {
  const firstPage = await getSalesAction({ page: 1, limit: 1 });

  if (!firstPage.success) {
    return { sales: [] as SaleApiResponse[], error: "sales" };
  }

  const initialSales = extractSales(firstPage.data);
  const totalCount = getSalesTotalCount(firstPage.data, initialSales.length);

  if (totalCount <= initialSales.length) {
    return { sales: initialSales, error: null };
  }

  const allSales = await getSalesAction({ page: 1, limit: totalCount });

  if (!allSales.success) {
    return { sales: initialSales, error: "sales" };
  }

  return { sales: extractSales(allSales.data), error: null };
}

export default async function ManagerHome() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const [
    dashboardResult,
    salesResult,
    visitsResult,
    doctorsResult,
    pharmaciesResult,
    requestsResult,
    teamResult,
    plansResult,
    reportsResult,
    forecastsResult,
    appraisalsResult,
  ] = await Promise.all([
    getManagerDashboardAction(),
    getAllSalesForDashboard(),
    getManagerVisitsAction(undefined, undefined, false),
    getDoctorsAction(undefined, undefined, undefined, false),
    getPharmaciesAction(1, 100000),
    getManagerTeamRequestsAction(1, 100000),
    getManagerTeamAction(undefined, 1, 100000),
    getManagerPlansAction(1, 100000),
    getAllVisitReportsAction(1, 100000),
    getAllForecastsAction(1, 100000),
    getAppraisalReviewsAction(1, 100000),
  ]);

  const errors = [
    !dashboardResult.success ? "dashboard" : null,
    salesResult.error,
    !visitsResult.success ? "visits" : null,
    !doctorsResult.success ? "doctors" : null,
    !pharmaciesResult.success ? "pharmacies" : null,
    !requestsResult.success ? "requests" : null,
    !teamResult.success ? "team" : null,
    !plansResult.success ? "plans" : null,
    !reportsResult.success ? "reports" : null,
    !forecastsResult.success ? "forecasts" : null,
    !appraisalsResult.success ? "appraisals" : null,
  ].filter(Boolean) as string[];

  const visits = (visitsResult.success ? (visitsResult.visits ?? []) : []).map(
    (visit) => ({
      id: visit.id,
      date: visit.date.toISOString(),
      status: visit.status,
      doctorId: visit.doctorId,
      userId: visit.userId,
      createdBy: visit.createdBy,
      createdById: visit.createdById,
    }),
  );

  return (
    <PageContainer className="min-h-[calc(100vh-80px)] overflow-x-hidden bg-[#F6F8FB]">
      <ManagerDashboard
        userName={user.data.name}
        dashboardData={
          dashboardResult.success ? (dashboardResult.data ?? null) : null
        }
        sales={salesResult.sales}
        visits={visits}
        doctors={doctorsResult.success ? doctorsResult.data || [] : []}
        pharmacies={pharmaciesResult.success ? pharmaciesResult.data || [] : []}
        requests={requestsResult.success ? requestsResult.data || [] : []}
        teamMembers={[
          ...(teamResult.medicalReps || []),
          ...(teamResult.supervisors || []),
        ]}
        plans={plansResult.success ? plansResult.data || [] : []}
        reports={reportsResult.success ? reportsResult.data?.reports || [] : []}
        forecasts={
          forecastsResult.success ? forecastsResult.data?.data || [] : []
        }
        appraisals={
          appraisalsResult.success ? appraisalsResult.reviews || [] : []
        }
        errors={errors}
      />
    </PageContainer>
  );
}
