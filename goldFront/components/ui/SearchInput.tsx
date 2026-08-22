"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
  disabled = false,
}: SearchInputProps) {
  return (
    <div className={cn("relative flex-1 min-w-48 sm:max-w-72", className)}>
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        disabled={disabled}
        className="w-full h-8.5 rounded-lg border border-slate-200 bg-slate-50/50 pl-8.5 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search input"
          disabled={disabled}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
