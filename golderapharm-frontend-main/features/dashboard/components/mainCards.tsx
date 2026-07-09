import Image from "next/image";
import Link from "next/link";

import coverageIcon from "@/features/dashboard/assets/icons/coverage.svg";
import requestsIcon from "@/features/dashboard/assets/icons/requests.svg";
import salesIcon from "@/features/dashboard/assets/icons/sales.svg";
import targetIcon from "@/features/dashboard/assets/icons/target.svg";

type CardItem = {
  id: string;
  title: string;
  metric: React.ReactNode;
  sub?: string;
  delta?: string;
  deltaPositive?: boolean;
  Icon: React.ReactElement;
};

interface MainCardsProps {
  roleBasePath?: "/manager" | "/supervisor" | "/rep";
  // Manager props
  totalSales?: number;
  // Rep props
  coverage?: string;
  targetAchievement?: string;
  pendingRequestsCount?: number;
}

export default function MainCards({
  roleBasePath,
  totalSales,
  coverage,
  targetAchievement,
  pendingRequestsCount = 0,
}: MainCardsProps) {
  // Determine if this is rep view based on presence of rep-specific props
  const isRepView = coverage !== undefined || targetAchievement !== undefined;

  const data: CardItem[] = isRepView
    ? [
        {
          id: "target",
          title: "Target Achievement",
          metric: (
            <span className="text-[34px] font-bold">
              {targetAchievement || "0%"}
            </span>
          ),
          sub: "This Month",
          Icon: <Image src={targetIcon} alt="target" width={24} height={24} />,
        },
        {
          id: "coverage",
          title: "Coverage",
          metric: (
            <span className="text-[34px] font-bold">{coverage || "0%"}</span>
          ),
          sub: "This Month",
          Icon: (
            <Image src={coverageIcon} alt="coverage" width={24} height={24} />
          ),
        },
        {
          id: "sales",
          title: "Total Sales",
          metric: (
            <span className="text-[24px] font-bold tracking-tight min-[1440px]:text-[34px]">
              {new Intl.NumberFormat("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(totalSales || 0)}{" "}
              <span className="font text-[15px]">SAR</span>
            </span>
          ),
          Icon: <Image src={salesIcon} alt="sales" width={24} height={24} />,
        },
        {
          id: "pending",
          title: "Pending Requests",
          metric: (
            <span className="text-[34px] font-bold">
              {pendingRequestsCount}
            </span>
          ),
          sub: "Requests",
          Icon: (
            <Image src={requestsIcon} alt="requests" width={24} height={24} />
          ),
        },
      ]
    : [
        {
          id: "sales",
          title: "Total Sales",
          metric: (
            <span className="text-[24px] font-bold tracking-tight min-[1440px]:text-[34px]">
              {new Intl.NumberFormat("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(totalSales || 0)}{" "}
              <span className="font text-[15px]">SAR</span>
            </span>
          ),
          Icon: <Image src={salesIcon} alt="sales" width={24} height={24} />,
        },
        {
          id: "pending",
          title: "Pending Requests",
          metric: (
            <span className="text-[34px] font-bold">
              {pendingRequestsCount}
            </span>
          ),
          sub: "Requests",
          Icon: (
            <Image src={requestsIcon} alt="requests" width={24} height={24} />
          ),
        },
      ];
  return (
    <section className="grid grid-cols-1 gap-6 min-[1440px]:w-[714px] sm:grid-cols-2">
      {data.map((c) => (
        <div
          key={c.id}
          className="border-secondary-light flex flex-col justify-between rounded-[25px] border bg-white px-4 py-6 text-nowrap"
          role="region"
          aria-labelledby={`card-${c.id}-title`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-system-primary flex size-11 items-center justify-center rounded-lg">
                {c.Icon}
              </div>
              <h3
                id={`card-${c.id}-title`}
                className="text-[20px] font-semibold"
              >
                {c.title}
              </h3>
            </div>

            {roleBasePath && (c.id === "sales" || c.id === "pending") ? (
              <Link
                href={`${roleBasePath}/${c.id === "sales" ? "sales" : "requests"}`}
                className="text-system-primary text-xs font-medium hover:underline"
              >
                View
              </Link>
            ) : (
              <div aria-hidden />
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            {c.metric}
            <div className="flex items-center justify-center gap-5">
              {c.sub && <div className="text-[12px]">{c.sub}</div>}
              {c.delta && (
                <div
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white ${
                    c.deltaPositive ? "bg-dashboard-green" : "bg-dashboard-red"
                  }`}
                  aria-hidden
                >
                  {c.delta}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
