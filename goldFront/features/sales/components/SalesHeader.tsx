"use client";

import {
  BarChart3,
  Calendar as CalendarIcon,
  Filter,
  TrendingUp,
} from "lucide-react";
import { useRoleUI } from "@/core/ui/role-ui-context";
import type { SaleApiResponse, SalesRepOption } from "../lib/types";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { UploadSalesDialog } from "./UploadSalesDialog";
import { usePathname, useRouter } from "next/navigation";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  formatDateOnly,
  formatSaudiDateDisplay,
  getSaudiYearMonthKey,
  parseDateValue,
} from "@/lib/utils";

interface SalesHeaderProps {
  sales: SaleApiResponse[];
  repOptions?: SalesRepOption[];
  selectedRepId?: string;
  selectedDate?: string;
  selectedSheetName?: string;
}

export default function SalesHeader({
  sales,
  repOptions = [],
  selectedRepId = "",
  selectedDate = "",
  selectedSheetName = "",
}: SalesHeaderProps) {
  const { role } = useRoleUI();
  const isManager = role === "MANAGER";
  const isRep = role === "MEDICAL_REP";
  const router = useRouter();
  const pathname = usePathname();
  const [repId, setRepId] = useState(selectedRepId || "all");
  const [sheetName, setSheetName] = useState(selectedSheetName || "");
  const [selectedDateValue, setSelectedDateValue] = useState<Date | undefined>(
    selectedDate ? parseDateValue(selectedDate) : undefined,
  );

  const stats = useMemo(() => {
    const total = sales.length;
    const now = new Date();
    const currentMonthKey = getSaudiYearMonthKey(now);
    const currentYear = currentMonthKey.slice(0, 4);
    const thisMonth = sales.filter((s) => {
      const dateField =
        s.date || s.createdAt || s.saleDate || s.soldAt || s.updatedAt;
      if (!dateField) return false;
      return getSaudiYearMonthKey(new Date(dateField)) === currentMonthKey;
    }).length;

    const thisYear = sales.filter((s) => {
      const dateField =
        s.date || s.createdAt || s.saleDate || s.soldAt || s.updatedAt;
      if (!dateField) return false;
      return getSaudiYearMonthKey(new Date(dateField)).startsWith(currentYear);
    }).length;

    return [
      {
        id: "total-records",
        label: "Total Records",
        value: total,
        icon: BarChart3,
        iconClassName: "bg-[#EEF4FF] text-[#3972D5]",
      },
      {
        id: "this-month",
        label: "Sales This Month",
        value: thisMonth,
        icon: CalendarIcon,
        iconClassName: "bg-[#EAF8F2] text-[#20A66A]",
      },
      {
        id: "this-year",
        label: "Sales This Year",
        value: thisYear,
        icon: TrendingUp,
        iconClassName: "bg-[#FFF7E0] text-[#B18732]",
      },
    ];
  }, [sales]);

  const onApplyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const date = selectedDateValue ? formatDateOnly(selectedDateValue) : "";

    const query = new URLSearchParams();
    if (isManager && repId && repId !== "all") query.set("repId", repId);
    if (date) query.set("date", date);
    if (sheetName.trim()) query.set("sheetName", sheetName.trim());

    const qs = query.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="space-y-5">
      <header className="sales-page-enter flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[#B18732] uppercase">
            Commercial
          </p>
          <h1 className="mt-1 text-[26px] leading-tight font-semibold text-[#182033] sm:text-[30px]">
            Sales Data
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#667085]">
            Track and analyze sales performance across all regions and
            representatives.
          </p>
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
          className="sales-page-enter sales-page-enter-delay-1 rounded-2xl border border-[#E5E8EF] bg-white p-5 shadow-none sm:p-6"
        >
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-[#182033]">Filters</h2>
            <p className="mt-0.5 text-xs text-[#667085]">
              Uses Saudi Arabia timezone (Asia/Riyadh).
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 w-full justify-start rounded-[10px] border border-[#DDE3EE] bg-[#F9FAFB] px-3 text-left text-sm font-medium text-[#182033] shadow-none transition-colors hover:bg-[#F9FAFB] focus-visible:border-[#C9A44C] focus-visible:ring-[3px] focus-visible:ring-[#C9A44C]/10"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#667085]" />
                    {selectedDateValue
                      ? formatSaudiDateDisplay(selectedDateValue)
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDateValue}
                    onSelect={setSelectedDateValue}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="min-w-0">
              <label className="mb-2 block text-xs font-semibold text-[#344054]">
                Sheet Name
              </label>
              <Input
                value={sheetName}
                onChange={(event) => setSheetName(event.target.value)}
                placeholder="e.g. first sheet"
                className="h-11 rounded-[10px] border border-[#DDE3EE] bg-[#F9FAFB] px-3 text-sm font-medium text-[#182033] shadow-none transition-colors placeholder:text-[#98A2B3] focus-visible:border-[#C9A44C] focus-visible:ring-[3px] focus-visible:ring-[#C9A44C]/10"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                className="h-11 w-full rounded-[10px] bg-[#C9A44C] px-5 text-sm font-semibold text-white shadow-none transition-all duration-[170ms] hover:-translate-y-px hover:bg-[#B18732] focus-visible:ring-[3px] focus-visible:ring-[#C9A44C]/20 motion-reduce:transition-none motion-reduce:hover:translate-y-0 lg:w-auto"
              >
                <Filter className="h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </form>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.id}
              className="sales-page-enter rounded-[14px] border border-[#E5E8EF] bg-white p-5 shadow-none"
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
                  <p className="mt-2 text-2xl leading-none font-semibold text-[#182033]">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`${stat.iconClassName} flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
