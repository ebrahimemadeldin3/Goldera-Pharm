import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type Props = {
  period: string;
  location: string;
  tab: "all" | "supervisors" | "reps";
  query: string;
  onChangePeriod: (v: string) => void;
  onChangeLocation: (v: string) => void;
  onChangeTab: (v: "all" | "supervisors" | "reps") => void;
  onChangeQuery: (v: string) => void;
};

export function AppraisalFilters({
  period,
  location,
  tab,
  query,
  onChangePeriod,
  onChangeLocation,
  onChangeTab,
  onChangeQuery,
}: Props) {
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base/4 font-normal text-black">
          Performance Reviews
        </h3>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <Select value={period} onValueChange={onChangePeriod}>
            <SelectTrigger className="data-placeholder:text-secondary-text cursor-pointer border-[0.8px] border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm/5 font-normal shadow-none">
              <SelectValue placeholder="All Periods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Periods</SelectItem>
              <SelectItem value="Q1 2025">Q1 2025</SelectItem>
              <SelectItem value="Q2 2025">Q2 2025</SelectItem>
              <SelectItem value="03 2025">03 2025</SelectItem>
            </SelectContent>
          </Select>
          <Select value={location} onValueChange={onChangeLocation}>
            <SelectTrigger className="data-placeholder:text-secondary-text cursor-pointer border-[0.8px] border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm/5 font-normal shadow-none">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Riyadh">Riyadh</SelectItem>
              <SelectItem value="Jeddah">Jeddah</SelectItem>
              <SelectItem value="Dammam">Dammam</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative w-full sm:w-70">
            <Search className="text-secondary-text pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => onChangeQuery(e.target.value)}
              className="data-placeholder:text-secondary-text cursor-pointer border-[0.8px] border-[#E2E8F0] bg-[#F8FAFC] pl-8 text-sm/5 font-normal shadow-none"
              placeholder="Search by name, location, or reviewer..."
            />
          </div>
        </div>
      </div>
      <div className="flex w-fit max-w-full flex-wrap items-center gap-1 rounded-[14px] bg-[#F1F5F9] p-1 text-sm/5 font-medium *:cursor-pointer *:rounded-[14px] *:border-[0.8px] *:px-2 *:py-1">
        <button
          className={`${tab === "all" ? "bg-white" : "bg-transparent"}`}
          onClick={() => onChangeTab("all")}
        >
          All Reviews
        </button>
        <button
          className={`${tab === "supervisors" ? "bg-white" : "bg-transparent"}`}
          onClick={() => onChangeTab("supervisors")}
        >
          Supervisors
        </button>
        <button
          className={`${tab === "reps" ? "bg-white" : "bg-transparent"}`}
          onClick={() => onChangeTab("reps")}
        >
          Medical Reps
        </button>
      </div>
    </section>
  );
}
