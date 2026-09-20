import { AlertTriangle } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { getHRMembersAction } from "@/features/hr/api";
import { HRMembersList } from "@/features/hr/components/HRMembersList";
import { HRStatsCards } from "@/features/hr/components/HRStatsCards";

export const dynamic = "force-dynamic";

const HR_DIRECTORY_FETCH_LIMIT = 1000;

type HRPageProps = {
  searchParams?: Promise<{
    page?: string;
    limit?: string;
  }>;
};

async function loadHRDirectory() {
  const firstResult = await getHRMembersAction(1, HR_DIRECTORY_FETCH_LIMIT);

  if (!firstResult.success || !firstResult.data) {
    return firstResult;
  }

  const firstMembers = firstResult.data.members;
  const apiTotalCount = firstResult.totalCount ?? firstMembers.length;
  const totalPages = Math.max(
    1,
    Math.ceil(apiTotalCount / HR_DIRECTORY_FETCH_LIMIT),
  );
  const remainingResults = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getHRMembersAction(index + 2, HR_DIRECTORY_FETCH_LIMIT),
    ),
  );
  const allMembers = [
    ...firstMembers,
    ...remainingResults.flatMap((result) => {
      if (!result.success || !result.data) return [];
      return result.data.members;
    }),
  ];
  const membersById = new Map(allMembers.map((member) => [member.id, member]));
  const members = Array.from(membersById.values());
  const totalMembers = members.length;
  const supervisorsCount = members.filter(
    (member) => member.role === "SUPERVISOR",
  ).length;
  const repsCount = members.filter(
    (member) => member.role === "MEDICAL_REP",
  ).length;
  const leaveTotal = members.reduce(
    (sum, member) => sum + member.leaveDaysCountTotal,
    0,
  );

  return {
    success: true,
    data: {
      members,
      stats: {
        totalMembers,
        supervisorsCount,
        repsCount,
        avgVacationUsed:
          totalMembers > 0 ? Math.round(leaveTotal / totalMembers) : 0,
      },
    },
    totalCount: totalMembers,
  };
}

function HRPageHeader() {
  return (
    <header className="hr-page-header hr-page-header-hero relative overflow-hidden">
      <span
        className="pointer-events-none absolute inset-x-0 -bottom-8 h-16 bg-[linear-gradient(100deg,rgba(201,164,76,0.16)_0%,rgba(201,164,76,0)_42%,rgba(201,164,76,0.05)_78%,rgba(16,29,54,0.07)_100%)]"
        aria-hidden="true"
      />
      <p className="hr-eyebrow text-gp-gold-600 flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
        <span
          className="bg-gp-gold-500 inline-block h-px w-6"
          aria-hidden="true"
        />
        Management
      </p>
      <h1 className="text-gp-navy-900 mt-2 text-[26px] leading-tight font-semibold sm:text-[30px]">
        Human Resources
      </h1>
      <p className="text-gp-text-muted mt-1 max-w-2xl text-sm leading-6 font-medium">
        Manage employee records, leave, documents and personnel information.
      </p>
    </header>
  );
}

export default async function Page({ searchParams }: HRPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params?.page || "1", 10) || 1);
  const limit = Math.max(1, Number.parseInt(params?.limit || "10", 10) || 10);
  const result = await loadHRDirectory();

  if (!result.success || !result.data) {
    return (
      <PageContainer className="bg-gp-surface-page flex min-h-[calc(100vh-80px)] flex-col gap-5 overflow-x-hidden">
        <HRPageHeader />
        <section
          role="alert"
          className="hr-section-enter border-gp-danger-border bg-gp-danger-soft rounded-[16px] border px-5 py-8 text-center"
        >
          <span className="text-gp-danger mx-auto flex size-11 items-center justify-center rounded-full bg-white/80">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <h2 className="text-gp-navy-900 mt-4 text-base font-semibold">
            Employee records could not be loaded
          </h2>
          <p className="text-gp-text-muted mx-auto mt-2 max-w-md text-sm leading-6 font-medium">
            {result.error?.message ||
              "Please refresh the page or try again in a moment."}
          </p>
        </section>
      </PageContainer>
    );
  }

  const { members, stats } = result.data;

  return (
    <PageContainer className="bg-gp-surface-page flex min-h-[calc(100vh-80px)] flex-col gap-5 overflow-x-hidden">
      <HRPageHeader />
      <HRStatsCards stats={stats} />
      <HRMembersList
        members={members}
        page={page}
        limit={limit}
        totalCount={members.length}
        isCompleteDataset
      />
    </PageContainer>
  );
}
