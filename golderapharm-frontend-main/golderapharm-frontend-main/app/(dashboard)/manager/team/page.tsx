import { getManagerTeamAction } from "@/features/team/api";
import { getRegionsAction } from "@/lib/requests/regions";
import TeamPageClient from "@/features/team/components/TeamPageClient";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { page?: string; limit?: string; openDialog?: string };
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  const page = params?.page ? Number(params.page) : 1;
  const limit = params?.limit ? Number(params.limit) : 10;
  
  const openDialog = params?.openDialog === "true";
  const res = await getManagerTeamAction(undefined, page, limit);
  const regionsRes = await getRegionsAction();

  return (
    <TeamPageClient
      supervisors={res.supervisors || []}
      medicalReps={res.medicalReps || []}
      regions={regionsRes.regions || []}
      stats={
        res.stats || { totalMembers: 0, supervisorsCount: 0, repsCount: 0 }
      }
      page={page}
      limit={limit}
      medicalRepsTotalCount={res.medicalRepsTotalCount ?? res.medicalReps?.length ?? 0}
      supervisorsTotalCount={res.supervisorsTotalCount ?? res.supervisors?.length ?? 0}
      success={res.success}
      openDialog={openDialog}
    />
  );
}
