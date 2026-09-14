import { CircleAlert } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { getManagerTeamRequestsAction } from "@/features/requests/api";
import { RequestsHeader } from "@/features/requests/components/manager/RequestsHeader";
import { RequestsStats } from "@/features/requests/components/manager/RequestsStats";
import RequestsList from "@/features/requests/components/manager/RequestsList";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams?: { page?: string; limit?: string };
}) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const result = await getManagerTeamRequestsAction(page, limit);

  if (!result.success) {
    return (
      <PageContainer className="bg-gp-surface-page flex min-h-[calc(100vh-80px)] flex-col gap-5 overflow-x-hidden">
        <div className="border-gp-danger-border bg-gp-danger-soft text-gp-danger flex items-start gap-3 rounded-[12px] border px-4 py-3.5">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">Failed to load requests</p>
            <p className="text-gp-danger/80 mt-0.5 text-sm">
              {result.error?.message}
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const requests = result.data ?? [];
  const totalCount = result.totalCount ?? requests.length;

  // Calculate dynamic stats (current page slice — same as previous behavior)
  const total = requests.length;
  const pending = requests.filter((r) => r.status === "PENDING").length;
  const approved = requests.filter((r) => r.status === "APPROVED").length;
  const rejected = requests.filter((r) => r.status === "REJECTED").length;

  return (
    <PageContainer className="bg-gp-surface-page flex min-h-[calc(100vh-80px)] flex-col gap-5 overflow-x-hidden">
      <RequestsHeader />
      <RequestsStats
        total={total}
        pending={pending}
        approved={approved}
        rejected={rejected}
      />
      <RequestsList
        requestsData={requests}
        page={page}
        limit={limit}
        totalCount={totalCount}
      />
    </PageContainer>
  );
}