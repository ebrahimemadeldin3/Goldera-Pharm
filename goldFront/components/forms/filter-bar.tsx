"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: FilterOption[];
}

interface FilterBarProps {
  filters?: FilterConfig[];
  searchConfig?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    width?: string;
  };
}

export function FilterBar({ filters = [], searchConfig }: FilterBarProps) {
  return (
    <div className="ml-auto flex w-full flex-wrap items-center gap-3 sm:w-auto">
      {filters.map((filter, index) => (
        <Select
          key={index}
          value={filter.value}
          onValueChange={filter.onChange}
        >
          <SelectTrigger className="data-placeholder:text-secondary-text w-full cursor-pointer border-[0.8px] border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm/5 font-normal text-black shadow-none sm:w-40">
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {searchConfig && (
        <div className="relative w-full max-w-[320px]" style={{ width: searchConfig.width }}>
          <Search className="text-secondary-text absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={searchConfig.value}
            onChange={(e) => searchConfig.onChange(e.target.value)}
            className="data-placeholder:text-secondary-text cursor-pointer border-[0.8px] border-[#E2E8F0] bg-[#F8FAFC] pl-8 text-sm/5 font-normal shadow-none"
            placeholder={searchConfig.placeholder || "Search..."}
          />
        </div>
      )}
    </div>
  );
}
