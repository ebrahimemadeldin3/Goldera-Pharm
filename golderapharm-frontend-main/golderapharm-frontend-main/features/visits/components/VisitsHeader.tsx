import { Calendar } from "lucide-react";
import Link from "next/link";
import { UserRole } from "@/lib/types";

type VisitsHeaderProps = {
  role: UserRole;
  stats: {
    total: number;
    completed: number;
    today: number;
  };
};

export default function VisitsHeader({ role, stats }: VisitsHeaderProps) {
  const addVisitPath =
    role === "MANAGER"
      ? "/manager/visits/add"
      : role === "SUPERVISOR"
        ? "/supervisor/visits/add"
        : "/rep/visits/add";

  return (
    <>
      <header className="flex w-full items-center justify-start gap-6 min-[1440px]:w-270.75! lg:w-5xl">
        <div>
          <h1 className="font-nomral text-[34px] text-black">Visit Calendar</h1>
          <p className="text-secondary-dark text-[16px]">
            Track and manage medical rep visits and appointments
          </p>
        </div>
        <Link
          href={addVisitPath}
          type="button"
          className="bg-system-primary hover:text-system-primary hover:border-system-primary ml-auto inline-flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-transparent"
        >
          <Calendar className="h-4 w-4" />
          Add Visit
        </Link>
      </header>
      <section className="mt-6 flex items-center gap-6 *:flex-1">
        <div className="border-secondary-light flex flex-col items-start gap-2 rounded-[10px] border-[.8px] bg-white p-5">
          <h3 className="text-secondary-dark text-sm/5 font-normal">
            Total Visits
          </h3>
          <p className="text-[32px]/12 font-semibold">{stats.total}</p>
        </div>
        <div className="border-secondary-light flex flex-col items-start gap-2 rounded-[10px] border-[.8px] bg-white p-5">
          <h3 className="text-dashboard-green text-sm/5 font-normal">
            Completed
          </h3>
          <p className="text-[32px]/12 font-semibold">{stats.completed}</p>
        </div>
        <div className="border-secondary-light flex flex-col items-start gap-2 rounded-[10px] border-[.8px] bg-white p-5">
          <h3 className="text-dashboard-blue text-sm/5 font-normal">
            Today&apos;s Visits
          </h3>
          <p className="text-[32px]/12 font-semibold">{stats.today}</p>
        </div>
      </section>
    </>
  );
}
