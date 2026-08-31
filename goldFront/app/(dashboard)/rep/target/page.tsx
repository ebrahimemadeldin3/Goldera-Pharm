import { redirect } from "next/navigation";
import AllActiveTargets from "@/features/target/components/AllActiveTargets";
import Badge from "@/features/target/components/Badge";
import MonthlyProgressTracking from "@/features/target/components/MonthlyProgressTracking";
import MonthlySalesTarget from "@/features/target/components/MonthlySalesTarget";
import SalesbyProduct from "@/features/target/components/SalesbyProduct";
import Stats from "@/features/target/components/Stats";
import WeeklyBreakdown from "@/features/target/components/WeeklyBreakdown";
import { PageContainer } from "@/components/layout/page-container";

export default async function Page() {
  // Target page is disabled for medical rep - redirect to dashboard
  redirect("/rep");

  return (
    <PageContainer className="flex flex-col gap-6">
      <header className="flex flex-col items-start justify-center">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#E9F8F1] border border-[#CBEFDD] px-2.5 py-0.5 text-[11px] font-semibold text-[#168557] uppercase tracking-wider">
            Performance
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#182033] sm:text-3xl">
          My Target Progress
        </h1>
        <p className="mt-0.5 text-sm text-[#667085]">
          Track your personal sales target and monthly goals
        </p>
      </header>

      <section className="flex flex-col gap-6">
        <MonthlySalesTarget />
        <Stats />
        <section className="flex flex-col gap-6 lg:flex-row">
          <section className="flex flex-1 flex-col gap-6">
            <MonthlyProgressTracking />
            <AllActiveTargets />
          </section>
          <section className="flex w-full flex-col gap-6 lg:w-[320px]">
            <SalesbyProduct />
            <WeeklyBreakdown />
            <Badge />
          </section>
        </section>
      </section>
    </PageContainer>
  );
}
