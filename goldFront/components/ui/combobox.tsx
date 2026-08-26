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

interface ComboboxProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "onChange"
> {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  startTypingText?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  searchShellClassName?: string;
  searchInputClassName?: string;
  optionClassName?: string;
  selectedOptionClassName?: string;
  badgeClassName?: string;
  clearButtonClassName?: string;
  chevronClassName?: string;
  checkClassName?: string;
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
  triggerClassName,
  dropdownClassName,
  searchShellClassName,
  searchInputClassName,
  optionClassName,
  selectedOptionClassName,
  badgeClassName,
  clearButtonClassName,
  chevronClassName,
  checkClassName,
  labelFormatter,
  onClick,
  ...triggerProps
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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
    const metaMatch = opt.metadata
      ? opt.metadata.toLowerCase().includes(term)
      : false;
    const subMatch = opt.subText
      ? opt.subText.toLowerCase().includes(term)
      : false;
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
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;

          if (!disabled) {
            setOpen(!open);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className={cn(
          "flex h-9 w-full cursor-pointer items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 shadow-2xs transition-all duration-150 hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-blue-500 ring-2 ring-blue-500/20",
          triggerClassName,
        )}
        aria-expanded={open}
        {...triggerProps}
      >
        <span className="flex min-w-0 items-center gap-1.5 truncate">
          {selectedOption ? (
            labelFormatter ? (
              labelFormatter(selectedOption)
            ) : (
              <span className="truncate font-medium text-slate-900">
                {selectedOption.label}
                {selectedOption.subText && (
                  <span className="ml-1.5 font-normal text-slate-500">
                    ({selectedOption.subText})
                  </span>
                )}
              </span>
            )
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </span>

        <span className="ml-2 flex shrink-0 items-center gap-1">
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
              className={cn(
                "rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600",
                clearButtonClassName,
              )}
              aria-label="Clear selection"
            >
              <X size={13} />
            </span>
          )}
          <ChevronsUpDown
            size={14}
            className={cn("text-slate-400 opacity-60", chevronClassName)}
          />
        </span>
      </button>

      {/* Dropdown Content */}
      {open && (
        <div
          className={cn(
            "animate-in fade-in-50 zoom-in-95 absolute z-50 mt-1.5 max-h-72 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg",
            dropdownClassName,
          )}
        >
          {/* Search Input Box */}
          <div
            className={cn(
              "flex items-center border-b border-slate-100 bg-slate-50/50 px-3 py-2",
              searchShellClassName,
            )}
          >
            <Search size={14} className="mr-2 shrink-0 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                "w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none",
                searchInputClassName,
              )}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="p-0.5 text-slate-400 hover:text-slate-600"
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
                        ? "bg-blue-50 font-medium text-blue-900"
                        : "text-slate-700 hover:bg-slate-50",
                      optionClassName,
                      isSelected && selectedOptionClassName,
                    )}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="truncate font-semibold text-slate-900">
                          {opt.label}
                        </span>
                        {opt.badge && (
                          <span
                            className={cn(
                              "rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700",
                              badgeClassName,
                            )}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {(opt.subText || opt.metadata) && (
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          {opt.subText}
                          {opt.subText && opt.metadata ? " - " : ""}
                          {opt.metadata}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <Check
                        size={14}
                        className={cn(
                          "ml-1 shrink-0 text-blue-600",
                          checkClassName,
                        )}
                      />
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
