interface SummaryProps {
  todayVisitsCount?: number;
  todayVisits?: { status: string }[];
}

export default function Summary({
  todayVisitsCount = 0,
  todayVisits = [],
}: SummaryProps) {
  // Calculate completed visits
  const completedVisits =
    todayVisits?.filter((visit) => visit.status === "COMPLETED").length || 0;
  return (
    <div className="flex flex-col gap-8 rounded-[14px] border-[0.8px] border-[#E2E8F0] bg-linear-to-b from-[#FEF9E7] to-[#FFFFFF] p-6">
      {/* Title */}
      <h2 className="text-xl/6 font-normal text-black">Today&apos;s Summary</h2>
      <div className="text-secondary-text space-y-3 text-sm/5 font-normal">
        <p className="flex items-center justify-between">
          <span className="">Visits Today</span>
          <span className="bg-dashboard-green rounded-lg px-2 py-0.5 text-xs/[16px] font-medium text-white">
            {completedVisits}/{todayVisitsCount}
          </span>
        </p>
        <p className="flex items-center justify-between">
          <span className="">Scheduled Visits</span>
          <span className="text-sm/5 font-normal text-black">
            {todayVisitsCount}
          </span>
        </p>
        <p className="flex items-center justify-between">
          <span className="">Completed</span>
          <span className="text-sm/5 font-normal text-black">
            {completedVisits}
          </span>
        </p>
      </div>
    </div>
  );
}
