"use client";

import { TrendingUp, BarChart3, Calendar as CalendarIcon } from "lucide-react";
import { StatCards } from "@/core/ui/StatCards";
import { useRoleUI } from "@/core/ui/role-ui-context";
import type { SaleApiResponse, SalesRepOption } from "../lib/types";
import { useMemo, useState } from "react";
import type { StatCardConfig } from "@/core/ui/stat-card-types";
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

  const { statsConfig, data } = useMemo(() => {
    const total = sales.length;

    const statsConfig: StatCardConfig[] = [
      {
        id: "total-records",
        label: "Total Records",
        dataKey: "total",
        icon: BarChart3,
        bgColor: "bg-dashboard-blue",
      },
      {
        id: "this-month",
        label: "This Month",
        dataKey: "thisMonth",
        icon: CalendarIcon,
        bgColor: "bg-dashboard-green",
      },
      {
        id: "this-year",
        label: "This Year",
        dataKey: "thisYear",
        icon: TrendingUp,
        bgColor: "bg-gold",
      },
    ];

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

    return {
      statsConfig,
      data: { total, thisMonth, thisYear },
    };
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
    <>
      <header className="flex w-full flex-wrap items-center justify-start gap-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-normal text-black md:text-[34px]">Sales Data</h1>
          <p className="text-secondary-dark text-[16px]">
            Track and analyze sales performance across all regions
          </p>
        </div>
        {isManager && <UploadSalesDialog />}
      </header>

      {(isManager || isRep) && (
        <form
          onSubmit={onApplyFilters}
          className={`mt-4 mb-6 grid grid-cols-1 gap-3 ${isManager ? "md:grid-cols-3" : "md:grid-cols-2"}`}
        >
          {isManager && (
            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Medical Rep
              </label>
              <Select value={repId} onValueChange={setRepId}>
                <SelectTrigger className="bg-secondary-very-light h-10 w-full rounded-md border-[0.8px] border-[#E2E8F0] text-sm">
                  <SelectValue placeholder="All reps" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All reps</SelectItem>
                  {repOptions.map((rep) => (
                    <SelectItem key={rep.id} value={rep.id}>
                      {rep.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-black">
              Date
            </label>
            <p className="text-secondary-dark mb-1 text-xs">
              Uses Saudi Arabia timezone (Asia/Riyadh).
            </p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-secondary-very-light h-10 w-full justify-start border-[0.8px] border-[#E2E8F0] text-left text-sm font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
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

          <div>
            <label className="mb-1 block text-sm font-medium text-black">
              Sheet Name
            </label>
            <div className="flex w-full items-center gap-2">
              <Input
                value={sheetName}
                onChange={(event) => setSheetName(event.target.value)}
                placeholder="e.g. first sheet"
                className="flex-1 min-w-0"
              />
              <Button type="submit" className="bg-system-primary shrink-0 text-white">
                Apply
              </Button>
            </div>
          </div>
        </form>
      )}

      <StatCards stats={statsConfig} data={data} />
    </>
  );
}
