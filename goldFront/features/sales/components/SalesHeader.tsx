"use client";

import {
  BarChart3,
  Filter,
  PackageCheck,
  TrendingUp,
  UsersRound,
  X,
} from "lucide-react";
import { useRoleUI } from "@/core/ui/role-ui-context";
import type { SaleApiResponse, SalesRepOption } from "../lib/types";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { UploadSalesDialog } from "./UploadSalesDialog";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  filterSales,
  getSaleAmount,
  getSaleOrderKey,
  getSaleQuantity,
} from "../lib/utils";
import type { DateFilter } from "../lib/types";
import { SalesDateFilter } from "./SalesDateFilter";

interface SalesHeaderProps {
  sales: SaleApiResponse[];
  repOptions?: SalesRepOption[];
  selectedRepId?: string;
  selectedDate?: string;
  selectedDateFrom?: string;
  selectedDateTo?: string;
  selectedSheetName?: string;
  selectedTimeFilter?: DateFilter;
  searchQuery?: string;
}

export default function SalesHeader({
  sales,
  repOptions = [],
  selectedRepId = "",
  selectedDate = "",
  selectedDateFrom = "",
  selectedDateTo = "",
  selectedSheetName = "",
  selectedTimeFilter = "all",
  searchQuery = "",
}: SalesHeaderProps) {
  const { role } = useRoleUI();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isManager = role === "MANAGER";
  const isRep = role === "MEDICAL_REP" || pathname?.startsWith("/rep");
  const [repId, setRepId] = useState(selectedRepId || "all");
  const [sheetName, setSheetName] = useState(selectedSheetName || "");
  const selectedRepName =
    repOptions.find((rep) => rep.id === selectedRepId)?.name || "";

  const filteredSales = useMemo(
    () =>
      filterSales(sales, {
        dateRange: {
          from: selectedDateFrom || selectedDate,
          to: selectedDateTo || selectedDateFrom || selectedDate,
        },
        dateFilter: selectedTimeFilter,
        query: searchQuery,
      }),
    [
      sales,
      searchQuery,
      selectedDate,
      selectedDateFrom,
      selectedDateTo,
      selectedTimeFilter,
    ],
  );

  const stats = useMemo(() => {
    const totalSales = filteredSales.reduce(
      (sum, sale) => sum + getSaleAmount(sale),
      0,
    );
    const unitsSold = filteredSales.reduce(
      (sum, sale) => sum + getSaleQuantity(sale),
      0,
    );
    const uniqueOrders = new Set(
      filteredSales
        .map(getSaleOrderKey)
        .filter((orderKey) => orderKey.trim().length > 0),
    ).size;
    const averageOrderValue = uniqueOrders > 0 ? totalSales / uniqueOrders : 0;

    return [
      {
        id: "total-sales",
        label: "Total Sales",
        value: `${totalSales.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} SAR`,
        helper: "Across current filters",
        icon: TrendingUp,
      },
      {
        id: "sales-records",
        label: "Sales Records",
        value: filteredSales.length.toLocaleString(),
        helper: "Filtered line items",
        icon: BarChart3,
        iconClassName: isRep
          ? "bg-[#F6F8FB] border border-[#E5E8EF] text-[#344054]"
          : "bg-[#EEF4FF] text-[#3972D5]",
      },
      {
        id: "units-sold",
        label: "Units Sold",
        value: unitsSold.toLocaleString(),
        helper: "Sum of valid quantities",
        icon: PackageCheck,
      },
      {
        id: "average-order-value",
        label: "Avg. Order Value",
        value: `${averageOrderValue.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} SAR`,
        helper: uniqueOrders
          ? `Based on ${uniqueOrders.toLocaleString()} unique orders`
          : "No order IDs in scope",
        icon: UsersRound,
      },
    ];
  }, [filteredSales, isRep]);

  const activeChips = [
    selectedTimeFilter !== "all"
      ? {
          key: "timeFilter",
          label:
            selectedTimeFilter === "day"
              ? "Today"
              : selectedTimeFilter === "week"
                ? "This Week"
                : selectedTimeFilter === "month"
                  ? "This Month"
                  : "This Year",
          params: ["timeFilter", "date", "dateFrom", "dateTo"],
        }
      : null,
    selectedDate || selectedDateFrom || selectedDateTo
      ? {
          key: "date",
          label:
            selectedDate ||
            [selectedDateFrom, selectedDateTo].filter(Boolean).join(" - "),
          params: ["date", "dateFrom", "dateTo", "timeFilter"],
        }
      : null,
    selectedRepId
      ? {
          key: "repId",
          label: selectedRepName || "Selected representative",
          params: ["repId"],
        }
      : null,
    selectedSheetName
      ? {
          key: "sheetName",
          label: selectedSheetName,
          params: ["sheetName"],
        }
      : null,
    searchQuery.trim()
      ? {
          key: "q",
          label: `"${searchQuery.trim()}"`,
          params: ["q"],
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    params: string[];
  }>;

  function clearParams(paramNames: string[]) {
    const query = new URLSearchParams(Array.from(searchParams.entries()));
    paramNames.forEach((paramName) => query.delete(paramName));
    query.set("page", "1");
    const qs = query.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function clearAllFilters() {
    const query = new URLSearchParams(Array.from(searchParams.entries()));
    [
      "repId",
      "date",
      "dateFrom",
      "dateTo",
      "sheetName",
      "timeFilter",
      "q",
    ].forEach((paramName) => query.delete(paramName));
    query.set("page", "1");
    const qs = query.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const onApplyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = new URLSearchParams(Array.from(searchParams.entries()));
    if (isManager && repId && repId !== "all") query.set("repId", repId);
    else query.delete("repId");

    if (sheetName.trim()) query.set("sheetName", sheetName.trim());
    else query.delete("sheetName");

    query.set("page", "1");

    const qs = query.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="space-y-5">
      <header className="sales-page-enter flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {isRep ? (
            <>
              <p
                className={`text-[11px] font-semibold tracking-[0.08em] uppercase ${
                  isRep ? "text-[#168557]" : "text-[#B18732]"
                }`}
              >
                {isRep ? "Personal Territory" : "Commercial"}
              </p>
              <h1 className="mt-1 text-[26px] leading-tight font-semibold text-[#182033] sm:text-[30px]">
                {isRep ? "Sales" : "Sales Data"}
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#667085]">
                {isRep
                  ? "Track your personal sales activity and product performance"
                  : "Track and analyze sales performance across all regions and representatives."}
              </p>
            </>
          ) : (
            <>
              <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] text-[#B18732] uppercase">
                <span className="h-px w-8 bg-[#C9A44C]" aria-hidden="true" />
                Commercial / Sales Management
              </p>
              <h1 className="mt-1 text-[26px] leading-tight font-semibold text-[#101D36] sm:text-[30px]">
                Sales Performance
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#667085]">
                Track revenue, orders, products and representative performance
                across your commercial network.
              </p>
            </>
          )}
        </div>
        {isManager && (
          <div className="w-full sm:w-auto">
            <UploadSalesDialog />
          </div>
        )}
      </header>

      {(isManager || isRep) && (
        <form
          onSubmit={onApplyFilters}
          className="sales-page-enter sales-page-enter-delay-1 rounded-2xl border border-[#E5E8EF] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6"
        >
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#182033]">
                Sales Filters
              </h2>
              <p className="mt-0.5 text-xs text-[#667085]">
                Uses Saudi Arabia timezone (Asia/Riyadh).
              </p>
            </div>
            <p className="text-xs font-semibold text-[#667085]">
              {filteredSales.length.toLocaleString()} records shown
            </p>
          </div>

          <div
            className={`grid grid-cols-1 gap-4 ${isManager ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"}`}
          >
            {isManager && (
              <div className="min-w-0">
                <label className="mb-2 block text-xs font-semibold text-[#344054]">
                  Medical Rep
                </label>
                <Select value={repId} onValueChange={setRepId}>
                  <SelectTrigger className="h-11 w-full rounded-[10px] border border-[#DDE3EE] bg-[#F9FAFB] px-3 text-sm text-[#182033] shadow-none transition-colors focus:border-[#C9A44C] focus:ring-[3px] focus:ring-[#C9A44C]/10">
                    <SelectValue placeholder="All Representatives" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Representatives</SelectItem>
                    {repOptions.map((rep) => (
                      <SelectItem key={rep.id} value={rep.id}>
                        {rep.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="min-w-0">
              <label className="mb-2 block text-xs font-semibold text-[#344054]">
                Date
              </label>
              <SalesDateFilter
                selectedDate={selectedDate}
                selectedDateFrom={selectedDateFrom}
                selectedDateTo={selectedDateTo}
              />
            </div>

            <div className="min-w-0">
              <label className="mb-2 block text-xs font-semibold text-[#344054]">
                Sheet Name
              </label>
              <Input
                value={sheetName}
                onChange={(event) => setSheetName(event.target.value)}
                placeholder="e.g. first sheet"
                className={`h-11 rounded-[10px] border border-[#DDE3EE] bg-[#F9FAFB] px-3 text-sm font-medium text-[#182033] shadow-none transition-colors placeholder:text-[#98A2B3] ${
                  isRep
                    ? "focus-visible:border-[#168557] focus-visible:ring-2 focus-visible:ring-[#168557]/20"
                    : "focus-visible:border-[#C9A44C] focus-visible:ring-[3px] focus-visible:ring-[#C9A44C]/10"
                }`}
              />
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                className={`h-11 w-full rounded-[10px] px-5 text-sm font-semibold text-white transition-all duration-[170ms] lg:w-auto ${
                  isRep
                    ? "bg-gp-rep-primary hover:bg-gp-rep-primary-hover shadow-[0_4px_14px_rgba(22,133,87,0.22)] focus-visible:ring-2 focus-visible:ring-[#168557]/30"
                    : "gp-primary-action h-11 rounded-[10px] bg-[#101D36] px-5 shadow-[0_8px_18px_rgba(16,29,54,0.16)] hover:-translate-y-px hover:bg-[#101D36]/95 focus-visible:ring-[3px] focus-visible:ring-[#C9A44C]/20 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                }`}
              >
                <Filter className="h-4 w-4 text-[#C9A44C]" />
                Apply Filters
              </Button>
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#EEF1F6] pt-4">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => clearParams(chip.params)}
                  className="inline-flex h-8 max-w-full items-center gap-2 rounded-full border border-[#E9DDB8] bg-[#FFF8E5] px-3 text-xs font-semibold text-[#8A6515] transition-[background-color,border-color,transform] duration-[160ms] hover:-translate-y-px hover:border-[#C9A44C] hover:bg-[#FFF3D1] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/25 focus-visible:outline-none"
                >
                  <span className="truncate">{chip.label}</span>
                  <X className="size-3.5 shrink-0" aria-hidden="true" />
                </button>
              ))}
              <button
                type="button"
                onClick={clearAllFilters}
                className="h-8 rounded-full px-3 text-xs font-semibold text-[#667085] transition-[background-color,color] duration-[160ms] hover:bg-[#F4F6FA] hover:text-[#101D36] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20 focus-visible:outline-none"
              >
                Clear all
              </button>
            </div>
          )}
        </form>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.id}
              className="sales-page-enter sales-kpi-card rounded-[14px] border border-[#E5E8EF] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
              style={
                {
                  "--sales-enter-delay": `${160 + index * 55}ms`,
                } as CSSProperties
              }
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-[0.04em] text-[#667085] uppercase">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl leading-none font-semibold text-[#101D36]">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs font-medium text-[#667085]">
                    {stat.helper}
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-[#E9DDB8] bg-[#FFF8E5] text-[#B18732]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
