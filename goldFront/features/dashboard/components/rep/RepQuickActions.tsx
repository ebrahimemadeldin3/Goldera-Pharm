import Link from "next/link";
import {
  CheckSquare,
  FilePlus2,
  TrendingUp,
  PackageSearch,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export function RepQuickActions() {
  const actions = [
    {
      id: "visit-report",
      title: "Submit Visit Report",
      subtitle: "File details for completed visits",
      href: "/rep/visits/report",
      icon: CheckSquare,
      iconBg: "bg-[#E9F8F1] text-[#168557] border-[#CBEFDD]",
      badge: "High Priority",
      badgeColor: "bg-[#E9F8F1] text-[#168557] border-[#CBEFDD]",
    },
    {
      id: "new-request",
      title: "New Request",
      subtitle: "Leave, expenses & sample orders",
      href: "/rep/requests",
      icon: FilePlus2,
      iconBg: "bg-[#FEF6EE] text-[#B54708] border-[#F9DBAF]",
    },
    {
      id: "submit-forecast",
      title: "Submit Forecast",
      subtitle: "Commit monthly product targets",
      href: "/rep/forecast/new",
      icon: TrendingUp,
      iconBg: "bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]",
    },
    {
      id: "product-catalog",
      title: "Product Catalog",
      subtitle: "Drugs, indications & inventory",
      href: "/rep/products",
      icon: PackageSearch,
      iconBg: "bg-[#F9F5FF] text-[#6941C6] border-[#E9D7FE]",
    },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-[18px] border border-[#E5E8EF] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
      <div className="flex items-center justify-between border-b border-[#EEF1F6] pb-3.5">
        <div>
          <h2 className="text-base font-semibold text-[#182033]">
            Quick Actions
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Essential daily operational shortcuts
          </p>
        </div>
        <span className="flex size-7 items-center justify-center rounded-lg bg-[#F4F6FA] text-[#667085]">
          <Sparkles size={14} />
        </span>
      </div>

      <div className="flex flex-col gap-2.5 pt-1">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className="group/action flex items-center justify-between gap-3 rounded-[12px] border border-[#E7EAF0] bg-[#FAFCFF] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D0D5DD] hover:bg-white hover:shadow-[0_4px_12px_rgba(16,24,40,0.06)]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-[10px] border ${action.iconBg} transition-transform duration-200 group-hover/action:scale-105`}
                >
                  <Icon size={18} />
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#182033] group-hover/action:text-[#101828] truncate">
                      {action.title}
                    </span>
                    {action.badge && (
                      <span
                        className={`rounded-full border px-1.5 py-0.2 text-[10px] font-semibold ${action.badgeColor}`}
                      >
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#667085] truncate mt-0.5">
                    {action.subtitle}
                  </p>
                </div>
              </div>

              <ChevronRight
                size={16}
                className="shrink-0 text-[#98A2B3] transition-all duration-200 group-hover/action:translate-x-0.5 group-hover/action:text-[#182033]"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
