import RequestHistory from "@/features/requests/components/RequestHistory";
import RequestStats from "@/features/requests/components/RequestStats";
import SubmitRequestForm from "@/features/requests/components/SubmitRequestForm";
import { getMyRequestsAction } from "@/features/requests/api";
import { getDoctorsAction } from "@/features/doctors/api";
import { getProductsAction } from "@/features/products/api";
import { fetchProfile } from "@/features/profile/api";
import { getRegionsAction } from "@/lib/requests/regions";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { page?: string; limit?: string };
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

 
  const [requestsResult, doctorsResult, productsResult, profile] =
    await Promise.all([
      getMyRequestsAction(page, limit),
      getDoctorsAction(),
      getProductsAction(),
      fetchProfile().catch(() => null),
    ]);

  // Resolve subRegion name for doctor filtering
  let userSubRegionName: string | null = null;
  if (profile && profile.subRegionId) {
    const regionsResult = await getRegionsAction();
    if (regionsResult.success && regionsResult.regions) {
      for (const region of regionsResult.regions) {
        const found = region.subRegions.find(
          (sr) => sr.id === profile.subRegionId,
        );
        if (found) {
          userSubRegionName = found.name;
          break;
        }
      }
    }
  }

  const requests = requestsResult.success ? (requestsResult.data ?? []) : [];
  const requestsTotalCount = requestsResult.success
    ? requestsResult.totalCount ?? requests.length
    : 0;

  const allDoctors = doctorsResult.success
    ? (doctorsResult.data ?? [])
    : [];
  const doctors = userSubRegionName
    ? allDoctors.filter((d) => d.subRegion === userSubRegionName)
    : allDoctors;
  const products = productsResult.success
    ? (productsResult.data ?? [])
    : [];

     

  // Calculate stats from requests
  const total = requests.length;
  const pending = requests.filter(
    (r: { status: string }) => r.status === "PENDING",
  ).length;
  const approved = requests.filter(
    (r: { status: string }) => r.status === "APPROVED",
  ).length;
  const rejected = requests.filter(
    (r: { status: string }) => r.status === "REJECTED",
  ).length;

  return (
    <main className="bg-secondary-very-light p-6 *:min-[1440px]:w-270.75! lg:w-5xl">
      <header className="mb-6 flex items-center justify-start gap-4">
        <div>
          <h1 className="text-4xl/10 font-normal">Requests</h1>
          <p className="text-secondary-dark mt-2 text-base/6 font-normal">
            Submit requests and track their status
          </p>
        </div>
      </header>
      <section className="space-y-6">
        <RequestStats
          total={total}
          pending={pending}
          approved={approved}
          rejected={rejected}
        />
        <SubmitRequestForm doctors={doctors} products={products as []} />
        <RequestHistory
          requests={requests}
          page={page}
          limit={limit}
          totalCount={requestsTotalCount}
        />
      </section>
    </main>
  );
}
