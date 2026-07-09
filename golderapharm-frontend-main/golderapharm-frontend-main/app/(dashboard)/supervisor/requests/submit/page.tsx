import { getMyRequestsAction } from "@/features/requests/api";
import RequestHistory from "@/features/requests/components/RequestHistory";
import RequestStats from "@/features/requests/components/RequestStats";
import SubmitRequestForm from "@/features/requests/components/SubmitRequestForm";
import { getDoctorsAction } from "@/features/doctors/api";
import { getProductsAction } from "@/features/products/api";
import { extractProducts } from "@/features/products/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { fetchProfile } from "@/features/profile/api";
import { getRegionsAction } from "@/lib/requests/regions";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [requestsResult, doctorsResult, productsResult, profile] =
    await Promise.all([
      getMyRequestsAction(),
      getDoctorsAction(),
      getProductsAction(),
      fetchProfile().catch(() => null),
    ]);

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
  const allDoctors = doctorsResult.success ? (doctorsResult.data ?? []) : [];
  const doctors = userSubRegionName
    ? allDoctors.filter((d) => d.subRegion === userSubRegionName)
    : allDoctors;
  const products = productsResult.success
    ? extractProducts(productsResult.data)
    : [];

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
        <Link
          href="/supervisor/requests"
          className="border-system-primary text-system-primary hover:bg-system-primary inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white hover:border-transparent hover:text-white"
        >
          <ArrowLeft size={16} />
        </Link>
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
        <SubmitRequestForm doctors={doctors} products={products} />
        <RequestHistory requests={requests} />
      </section>
    </main>
  );
}
