import { CircleAlert } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { getRepAppraisalReviewsAction } from "@/features/appraisal/api/rep";
import { RepAppraisalClient } from "@/features/appraisal/components/rep/RepAppraisalClient";
import {
  REP_APPRAISAL_PREVIEW_MODE,
  getRepAppraisalPreviewData,
} from "@/features/appraisal/mocks/rep-appraisal-preview";
import { resolveRepTerritoryScope } from "@/features/geography/lib/rep-territory-scope";
import { fetchProfile } from "@/features/profile/api";
import { getRegionsAction } from "@/lib/requests/regions";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams?: { page?: string; limit?: string };
}) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  if (REP_APPRAISAL_PREVIEW_MODE) {
    // UI preview only - remove when Rep appraisal backend integration is ready.
    const profile = await fetchProfile().catch(() => null);
    const regionsResult = profile?.subRegionId
      ? await getRegionsAction()
      : null;
    const scope = resolveRepTerritoryScope(
      profile,
      regionsResult?.success ? regionsResult.regions : null,
    );
    const preview = getRepAppraisalPreviewData(profile, scope?.subRegionName);

    return (
      <PageContainer className="flex min-h-[calc(100vh-80px)] flex-col gap-6 overflow-x-hidden bg-[#F6F8FB]">
        <RepAppraisalClient
          reviews={preview.reviews}
          page={page}
          limit={limit}
          totalCount={preview.totalCount}
          stats={preview.stats}
          previewMode
        />
      </PageContainer>
    );
  }

  const result = await getRepAppraisalReviewsAction(page, limit);

  if (!result.success) {
    return (
      <PageContainer className="flex min-h-[calc(100vh-80px)] flex-col gap-6 overflow-x-hidden bg-[#F6F8FB]">
        <div className="flex items-start gap-3 rounded-[12px] border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3.5 text-[#B42318]">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">Unable to load appraisals</p>
            <p className="mt-0.5 text-sm text-[#B42318]/80">
              We couldn&apos;t load your performance appraisals.
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex min-h-[calc(100vh-80px)] flex-col gap-6 overflow-x-hidden bg-[#F6F8FB]">
      <RepAppraisalClient
        reviews={result.reviews}
        page={page}
        limit={limit}
        totalCount={result.totalCount}
        stats={result.stats}
        backendIntegrationPending={result.backendIntegrationPending}
      />
    </PageContainer>
  );
}
