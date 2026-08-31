import Link from "next/link";
import { Plus } from "lucide-react";
import RequestHistory from "@/features/requests/components/RequestHistory";
import RequestStats from "@/features/requests/components/RequestStats";
import { getMyRequestsAction } from "@/features/requests/api";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { page?: string; limit?: string };
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const requestsResult = await getMyRequestsAction(page, limit);

  const requests = requestsResult.success ? (requestsResult.data ?? []) : [];
  const requestsTotalCount = requestsResult.success
    ? requestsResult.totalCount ?? requests.length
    : 0;

  // Calculate stats from requests
  const total = requestsTotalCount || requests.length;
  const pending = requests.filter(
    (r: { status: string }) => r.status === "PENDING"
  ).length;
  const approved = requests.filter(
    (r: { status: string }) => r.status === "APPROVED"
  ).length;
  const rejected = requests.filter(
    (r: { status: string }) => r.status === "REJECTED"
  ).length;

  return (
    <PageContainer className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#E9F8F1] border border-[#CBEFDD] px-2.5 py-0.5 text-[11px] font-semibold text-[#168557] uppercase tracking-wider">
              Operations
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#182033] sm:text-3xl">
            Requests
          </h1>
          <p className="mt-0.5 text-sm text-[#667085]">
            Submit and track your work requests
          </p>
        </div>

        <Link href="/rep/requests/new">
          <Button className="h-10 rounded-[10px] bg-gp-rep-primary px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(22,133,87,0.22)] transition-all duration-[170ms] hover:bg-gp-rep-primary-hover focus-visible:ring-2 focus-visible:ring-[#168557]/30">
            <Plus className="mr-1.5 h-4 w-4" />
            New Request
          </Button>
        </Link>
      </header>

      <section className="space-y-6">
        <RequestStats
          total={total}
          pending={pending}
          approved={approved}
          rejected={rejected}
        />

        <RequestHistory
          requests={requests}
          page={page}
          limit={limit}
          totalCount={requestsTotalCount}
        />
      </section>
    </PageContainer>
  );
}
