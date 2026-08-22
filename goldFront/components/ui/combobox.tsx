"use client";

import React, { useState, useRef, useEffect, ReactNode } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  metadata?: string;
  subText?: string;
  badge?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  startTypingText?: string;
  disabled?: boolean;
  className?: string;
  labelFormatter?: (option: ComboboxOption) => ReactNode;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Type to search...",
  emptyText = "No results found",
  startTypingText,
  disabled = false,
  className,
  labelFormatter,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter((opt) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase().trim();
    const labelMatch = opt.label.toLowerCase().includes(term);
    const metaMatch = opt.metadata ? opt.metadata.toLowerCase().includes(term) : false;
    const subMatch = opt.subText ? opt.subText.toLowerCase().includes(term) : false;
    return labelMatch || metaMatch || subMatch;
  });

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Combobox Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen(!open);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-2xs hover:border-slate-300",
          open && "border-blue-500 ring-2 ring-blue-500/20"
        )}
        aria-expanded={open}
      >
        <span className="truncate flex items-center gap-1.5 min-w-0">
          {selectedOption ? (
            labelFormatter ? (
              labelFormatter(selectedOption)
            ) : (
              <span className="font-medium text-slate-900 truncate">
                {selectedOption.label}
                {selectedOption.subText && (
                  <span className="ml-1.5 text-slate-500 font-normal">
                    ({selectedOption.subText})
                  </span>
                )}
              </span>
            )
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </span>

        <span className="flex items-center gap-1 shrink-0 ml-2">
          {selectedOption && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClear(e as unknown as React.MouseEvent);
                }
              }}
              className="p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Clear selection"
            >
              <X size={13} />
            </span>
          )}
          <ChevronsUpDown size={14} className="text-slate-400 opacity-60" />
        </span>
      </button>

      {/* Dropdown Content */}
      {open && (
        <div className="absolute z-50 mt-1.5 max-h-72 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg animate-in fade-in-50 zoom-in-95">
          {/* Search Input Box */}
          <div className="flex items-center border-b border-slate-100 px-3 py-2 bg-slate-50/50">
            <Search size={14} className="mr-2 shrink-0 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1 text-xs">
            {options.length > 50 && !search.trim() && startTypingText ? (
              <div className="px-3 py-3 text-center text-xs text-slate-400 italic">
                {startTypingText}
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-slate-500">
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between rounded-md px-2.5 py-2 text-left transition-colors duration-100",
                      isSelected
                        ? "bg-blue-50 text-blue-900 font-medium"
                        : "hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-slate-900 truncate">
                          {opt.label}
                        </span>
                        {opt.badge && (
                          <span className="rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {(opt.subText || opt.metadata) && (
                        <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                          {opt.subText}
                          {opt.subText && opt.metadata ? " • " : ""}
                          {opt.metadata}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-blue-600 shrink-0 ml-1" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
