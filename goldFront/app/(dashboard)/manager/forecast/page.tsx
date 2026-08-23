import { AlertCircle } from "lucide-react";
import ForecastApprovalCenter from "@/features/forecast/components/ForecastApprovalCenter";
import { getAllForecastsAction } from "@/features/forecast/api/management";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams?: { page?: string; limit?: string };
}) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const result = await getAllForecastsAction(page, limit);

  if (!result.success || !result.data) {
    return (
      <PageContainer className="min-h-[calc(100vh-80px)] overflow-x-hidden bg-[#F6F8FB]">
        <div className="flex items-start gap-3 rounded-[16px] border border-[#F5C9C5] bg-[#FFF1F0] p-5 text-[#B42318] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white">
            <AlertCircle className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-base font-semibold">
              Failed to load forecast requests
            </h1>
            <p className="mt-1 text-sm font-medium">
              {result.error?.message ||
                "Please refresh the page or try again later."}
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const { data, results } = result.data;

  return (
    <PageContainer className="min-h-[calc(100vh-80px)] overflow-x-hidden bg-[#F6F8FB]">
      <ForecastApprovalCenter
        forecasts={data}
        page={page}
        limit={limit}
        totalCount={result.totalCount ?? results}
      />
    </PageContainer>
  );
}
