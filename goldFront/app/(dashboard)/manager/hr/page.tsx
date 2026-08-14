import { getHRMembersAction } from "@/features/hr/api";
import { HRStatsCards } from "@/features/hr/components/HRStatsCards";
import { HRMembersList } from "@/features/hr/components/HRMembersList";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: { page?: string; limit?: string } }) {
   const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;
  
  const result = await getHRMembersAction(page, limit);

  // Handle error state
  if (!result.success || !result.data) {
    return (
      <PageContainer className="min-h-[calc(100vh-150px)]">
        <header className="flex flex-wrap items-center justify-start gap-6">
          <div>
            <h1 className="font-nomral text-2xl text-black md:text-[34px]">
              Human Resources Management
            </h1>
            <p className="text-secondary-dark text-[16px]">
              Manage employee records, vacation balances, and personnel
              documents
            </p>
          </div>
        </header>
        <div className="mt-6 rounded-md border border-dashed border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600">
            {result.error?.message || "Failed to load HR members"}
          </p>
        </div>
      </PageContainer>
    );
  }

  const { members, stats } = result.data;

  return (
    <PageContainer className="min-h-[calc(100vh-150px)]">
      <header className="flex flex-wrap items-center justify-start gap-6">
        <div>
          <h1 className="font-nomral text-2xl text-black md:text-[34px]">
            Human Resources Management
          </h1>
          <p className="text-secondary-dark text-[16px]">
            Manage employee records, vacation balances, and personnel documents
          </p>
        </div>
      </header>

      <HRStatsCards stats={stats} />
      <HRMembersList
        members={members}
        page={page}
        limit={limit}
        totalCount={result.totalCount ?? members.length}
      />
    </PageContainer>
  );
}
