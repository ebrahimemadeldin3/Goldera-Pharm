import RequestsList from "@/features/requests/components/RequestsList";
import RequestStats from "@/features/requests/components/RequestStats";
import { getManagerTeamRequestsAction } from "@/features/requests/api";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: { page?: string; limit?: string } }) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const result = await getManagerTeamRequestsAction(page, limit);
  const requests = result.success ? (result.data ?? []) : [];
  const totalCount = result.success ? (result.totalCount ?? requests.length) : 0;

 
  // Calculate dynamic stats
  const total = requests.length;
  const pending = requests.filter((r) => r.status === "PENDING").length;
  const approved = requests.filter((r) => r.status === "APPROVED").length;
  const rejected = requests.filter((r) => r.status === "REJECTED").length;

  return (
    <PageContainer>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl/9 font-normal md:text-[34px]/10">
            Requests Review & Approval
          </h1>
          <p className="text-secondary-dark text-base/6 font-normal">
            Review supervisor decisions and approve or reject requests
          </p>
        </div>
      </header>
      <section className="w-full space-y-6">
        <RequestStats
          total={total}
          pending={pending}
          approved={approved}
          rejected={rejected}
        />
        <RequestsList role="MANAGER" requestsData={requests} page={page} limit={limit} totalCount={totalCount} />
      </section>
    </PageContainer>
  );
}
