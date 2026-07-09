import { redirect } from "next/navigation";
import AllActiveTargets from "@/features/target/components/AllActiveTargets";
import Badge from "@/features/target/components/Badge";
import MonthlyProgressTracking from "@/features/target/components/MonthlyProgressTracking";
import MonthlySalesTarget from "@/features/target/components/MonthlySalesTarget";
import SalesbyProduct from "@/features/target/components/SalesbyProduct";
import Stats from "@/features/target/components/Stats";
import WeeklyBreakdown from "@/features/target/components/WeeklyBreakdown";

export default async function Page() {
  // Target page is disabled for medical rep - remove this line to re-enable
  redirect("/rep");

  return (
    <main className="bg-secondary-very-light py-6 *:min-[1440px]:w-270.75! *:min-[1440px]:px-6 lg:w-5xl">
      <header className="mb-6 flex items-center justify-start gap-4">
        <div>
          <h1 className="text-4xl/10 font-normal">My Targets & Goals</h1>
          <p className="text-secondary-dark mt-2 text-base/6 font-normal">
            Track your performance and achieve your goals
          </p>
        </div>
      </header>
      <section className="flex flex-col gap-6 *:min-[1440px]:w-270.75!">
        <MonthlySalesTarget />
        <Stats />
        <section className="flex gap-6">
          <section className="flex flex-1 flex-col gap-6">
            <MonthlyProgressTracking />
            <AllActiveTargets />
          </section>
          <section className="flex w-73.25! flex-col gap-6">
            <SalesbyProduct />
            <WeeklyBreakdown />
            <Badge />
          </section>
        </section>
      </section>
    </main>
  );
}
