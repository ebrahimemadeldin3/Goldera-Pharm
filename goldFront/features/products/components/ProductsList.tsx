"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
} from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  CalendarDays,
  ChevronDown,
  Check,
  Pencil,
  Leaf,
  MoreHorizontal,
  Package,
  PackageOpen,
  Search,
  SlidersHorizontal,
  Tag,
  Trash2,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useRoleUI } from "@/core/ui/role-ui-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";
import { AddProductDialog } from "./AddProductDialog";
import type { ProductApiResponse } from "../lib/types";
import {
  getProductCategory,
  getProductDisplayName,
  getProductImageInfo,
  getStoredProductImageInfo,
  readRemovedProductIds,
  readStoredProductOverrides,
  readStoredProductImages,
  saveRemovedProductId,
  type StoredProductOverrideMap,
  type StoredProductImageMap,
} from "../lib/utils";

interface ProductsListProps {
  products: ProductApiResponse[];
  page?: number;
  limit?: number;
  totalCount?: number;
}

type SummaryCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "gold";
  animationDelay?: string;
};
type PriceRange = [number, number];
type PriceLimits = {
  min: number;
  max: number;
  hasPrices: boolean;
};
type FilterPanelMode = "desktop" | "mobile";
type DateFilterValue = "any" | "today" | "last7" | "last30";
type ProductFilterCriteria = {
  term: string;
  selectedCategories: string[];
  priceRange: PriceRange;
  hasPriceFilter: boolean;
  dateFilter: DateFilterValue;
};

const numberFormatter = new Intl.NumberFormat("en-US");
const priceFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFilterOptions: Array<{ value: DateFilterValue; label: string }> = [
  { value: "any", label: "Any date" },
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
];

const dateFilterLabels: Record<DateFilterValue, string> = {
  any: "Any date",
  today: "Today",
  last7: "Last 7 days",
  last30: "Last 30 days",
};

const summaryToneStyles: Record<SummaryCardProps["tone"], string> = {
  blue: "bg-[#EDF4FF] text-[#3972D5]",
  green: "bg-[#E9F8F1] text-[#168557]",
  gold: "bg-[#FFF3D7] text-[#B18732]",
};

const categoryBadgeStyles: Record<
  string,
  { icon: LucideIcon; className: string; iconClassName: string }
> = {
  "Topical Care": {
    icon: Tag,
    className: "border-[#D7E5FF] bg-[#EDF4FF] text-[#2F63C4]",
    iconClassName: "text-[#3972D5]",
  },
  "Nutritional Supplements": {
    icon: Leaf,
    className: "border-[#CBEFDD] bg-[#E9F8F1] text-[#168557]",
    iconClassName: "text-[#20A66A]",
  },
  Healthcare: {
    icon: Package,
    className: "border-[#C9F1F4] bg-[#EAF9FA] text-[#197983]",
    iconClassName: "text-[#1B9AAA]",
  },
  General: {
    icon: PackageOpen,
    className: "border-[#E5E8EF] bg-[#F4F6FA] text-[#667085]",
    iconClassName: "text-[#8A94A6]",
  },
};

function formatProductPrice(price: number | null | undefined) {
  if (typeof price !== "number" || !Number.isFinite(price)) {
    return "N/A";
  }

  return `${priceFormatter.format(price)} SAR`;
}

function formatProductDate(value: string | null | undefined) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return format(date, "MMM d, yyyy");
}

function formatFilterPrice(value: number) {
  return Number.isInteger(value) ? String(value) : priceFormatter.format(value);
}

function formatFilterPriceRange(range: PriceRange) {
  return `${formatFilterPrice(range[0])}-${formatFilterPrice(range[1])} SAR`;
}

function getPriceLimits(products: ProductApiResponse[]): PriceLimits {
  const prices = products
    .map((product) => product.salesPrice)
    .filter((price) => Number.isFinite(price));

  if (prices.length === 0) {
    return { min: 0, max: 0, hasPrices: false };
  }

  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
    hasPrices: true,
  };
}

function clampPriceRange(range: PriceRange, limits: PriceLimits): PriceRange {
  if (!limits.hasPrices) {
    return [0, 0];
  }

  const min = Math.min(Math.max(range[0], limits.min), limits.max);
  const max = Math.min(Math.max(range[1], limits.min), limits.max);

  return min <= max ? [min, max] : [max, min];
}

function isPriceRangeActive(range: PriceRange, limits: PriceLimits) {
  return limits.hasPrices && (range[0] > limits.min || range[1] < limits.max);
}

function isDateFilterActive(dateFilter: DateFilterValue) {
  return dateFilter !== "any";
}

function matchesDateFilter(
  value: string | null | undefined,
  dateFilter: DateFilterValue,
) {
  if (dateFilter === "any") {
    return true;
  }

  if (!value) {
    return false;
  }

  const productDate = new Date(value);
  if (Number.isNaN(productDate.getTime())) {
    return false;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  if (dateFilter === "today") {
    return productDate >= todayStart && productDate < tomorrowStart;
  }

  const startDate = new Date(todayStart);
  startDate.setDate(todayStart.getDate() - (dateFilter === "last7" ? 6 : 29));

  return productDate >= startDate && productDate < tomorrowStart;
}

function getEffectiveCategories(
  selectedCategories: string[],
  categoryOptions: string[],
) {
  const availableCategories = new Set(categoryOptions);

  return selectedCategories.filter((category) =>
    availableCategories.has(category),
  );
}

function filterProductsByCriteria(
  products: ProductApiResponse[],
  criteria: ProductFilterCriteria,
) {
  const normalizedTerm = criteria.term.toLowerCase();
  const selectedCategorySet = new Set(criteria.selectedCategories);
  const hasCategoryFilter = selectedCategorySet.size > 0;

  return products.filter((product) => {
    const category = getProductCategory(product.internalRef);
    const matchesSearch =
      !normalizedTerm ||
      product.name?.toLowerCase().includes(normalizedTerm) ||
      product.internalRef?.toLowerCase().includes(normalizedTerm);
    const matchesCategory =
      !hasCategoryFilter || selectedCategorySet.has(category);
    const matchesPrice =
      !criteria.hasPriceFilter ||
      (Number.isFinite(product.salesPrice) &&
        product.salesPrice >= criteria.priceRange[0] &&
        product.salesPrice <= criteria.priceRange[1]);
    const matchesDate = matchesDateFilter(
      product.createdAt,
      criteria.dateFilter,
    );

    return matchesSearch && matchesCategory && matchesPrice && matchesDate;
  });
}

function useIsMobileFilterPanel() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsMobile(query.matches);

    sync();
    query.addEventListener("change", sync);

    return () => query.removeEventListener("change", sync);
  }, []);

  return isMobile;
}

function SummaryCard({
  label,
  value,
  helper,
  icon: Icon,
  tone,
  animationDelay = "180ms",
}: SummaryCardProps) {
  return (
    <article
      className="products-kpi-card products-upper-kpi-enter group/kpi flex min-h-[118px] items-start justify-between gap-4 rounded-[14px] border border-[#E5E8EF] bg-white p-5 shadow-none"
      style={
        {
          "--products-upper-delay": animationDelay,
        } as CSSProperties
      }
    >
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.04em] text-[#667085] uppercase">
          {label}
        </p>
        <p className="mt-2 text-2xl leading-none font-semibold text-[#182033]">
          {value}
        </p>
        <p className="mt-2 truncate text-xs font-medium text-[#8A94A6]">
          {helper}
        </p>
      </div>
      <span
        className={`products-kpi-icon-shell products-kpi-icon-shell-${tone} flex size-10 shrink-0 items-center justify-center rounded-[10px] ${summaryToneStyles[tone]}`}
      >
        <Icon
          className={`products-kpi-icon products-kpi-icon-${tone} size-5`}
          aria-hidden="true"
        />
      </span>
    </article>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const presentation =
    categoryBadgeStyles[category] || categoryBadgeStyles.General;
  const Icon = presentation.icon;

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-[8px] border px-2.5 py-1 text-xs font-semibold transition-colors duration-[180ms] ${presentation.className}`}
      title={category}
    >
      <Icon
        className={`size-3.5 shrink-0 ${presentation.iconClassName}`}
        aria-hidden="true"
      />
      <span className="truncate">{category}</span>
    </span>
  );
}

type FilterTriggerButtonProps = {
  activeFilterCount: number;
  isOpen: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const FilterTriggerButton = forwardRef<
  HTMLButtonElement,
  FilterTriggerButtonProps
>(function FilterTriggerButton(
  { activeFilterCount, isOpen, className = "", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={`products-catalog-filter-field products-catalog-filter-button group/filter inline-flex h-11 w-full items-center justify-between gap-2 rounded-[12px] border border-[#E5E8EF] bg-white px-3.5 text-sm font-semibold text-[#4B5568] outline-none ${className} ${
        isOpen ? "products-catalog-filter-open" : ""
      }`}
      aria-label={`Open product filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ""}`}
      {...props}
    >
      <span className="flex min-w-0 items-center gap-2">
        <SlidersHorizontal
          className="products-catalog-filter-icon size-4 shrink-0 text-[#667085]"
          aria-hidden="true"
        />
        <span className="truncate">Filters</span>
        {activeFilterCount > 0 && (
          <span className="products-catalog-filter-count-badge inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#C9A44C] px-1.5 text-[11px] leading-none font-bold text-[#182033]">
            {activeFilterCount}
          </span>
        )}
      </span>
      <ChevronDown
        className={`products-catalog-filter-chevron size-4 shrink-0 text-[#98A2B3] ${
          isOpen ? "rotate-180" : ""
        }`}
        aria-hidden="true"
      />
    </button>
  );
});

function FilterCategoryButton({
  category,
  isActive,
  onSelect,
}: {
  category: string;
  isActive: boolean;
  onSelect: () => void;
}) {
  const presentation =
    categoryBadgeStyles[category] || categoryBadgeStyles.General;
  const Icon = presentation.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={`products-catalog-filter-option products-catalog-filter-category-option inline-flex min-h-10 items-center gap-2 rounded-[12px] border px-3.5 py-2 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-[170ms] ease-out focus-visible:ring-3 focus-visible:ring-[#C9A44C]/15 focus-visible:outline-none ${
        isActive
          ? "border-[#D4AF4F] bg-[#FBF7EA] text-[#182033] shadow-[0_7px_16px_rgba(201,164,76,0.1)]"
          : "border-[#E5E8EF] bg-white text-[#5F6B7C] hover:border-[#E9DDB8] hover:bg-[#FFFCF4] hover:text-[#182033]"
      }`}
    >
      <Icon
        className={`size-3.5 shrink-0 ${
          isActive ? "text-[#B18732]" : "text-[#8A94A6]"
        }`}
        aria-hidden="true"
      />
      <span className="truncate">{category}</span>
      {isActive && (
        <Check
          className="products-filter-option-check size-3.5 shrink-0 text-[#B18732]"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

function FilterDateButton({
  option,
  isActive,
  onSelect,
}: {
  option: { value: DateFilterValue; label: string };
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={`products-catalog-filter-option products-catalog-filter-date-option inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border px-3 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-[170ms] ease-out focus-visible:ring-3 focus-visible:ring-[#C9A44C]/15 focus-visible:outline-none ${
        isActive
          ? "border-[#D4AF4F] bg-[#FBF7EA] text-[#182033] shadow-[0_7px_16px_rgba(201,164,76,0.08)]"
          : "border-[#E5E8EF] bg-white text-[#5F6B7C] hover:border-[#E9DDB8] hover:bg-[#FFFCF4] hover:text-[#182033]"
      }`}
    >
      {option.label}
      {isActive && (
        <Check
          className="products-filter-option-check size-3.5 shrink-0 text-[#B18732]"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

function ActiveFilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="products-catalog-active-filter-chip inline-flex h-8 max-w-full items-center gap-1.5 rounded-full border border-[#E9DDB8] bg-[#FFF8E5] px-3 text-xs font-semibold text-[#5C4918]">
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[#8A6515] transition-[background-color,color] duration-[150ms] hover:bg-[#E9DDB8] hover:text-[#182033] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/25 focus-visible:outline-none"
      >
        <X className="size-3" aria-hidden="true" />
      </button>
    </span>
  );
}

function ProductFilterPanel({
  mode,
  categoryOptions,
  selectedCategories,
  onCategoryToggle,
  priceLimits,
  priceRange,
  priceStep,
  onPriceRangeChange,
  dateFilter,
  onDateFilterChange,
  draftFilterCount,
  resultCount,
  onReset,
  onApply,
  onClose,
}: {
  mode: FilterPanelMode;
  categoryOptions: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  priceLimits: PriceLimits;
  priceRange: PriceRange;
  priceStep: number;
  onPriceRangeChange: (range: PriceRange) => void;
  dateFilter: DateFilterValue;
  onDateFilterChange: (dateFilter: DateFilterValue) => void;
  draftFilterCount: number;
  resultCount: number;
  onReset: () => void;
  onApply: () => void;
  onClose: () => void;
}) {
  const hasPriceChoices =
    priceLimits.hasPrices && priceLimits.min < priceLimits.max;
  const hasDraftFilters = draftFilterCount > 0;

  function updatePriceInput(index: 0 | 1, value: string) {
    const nextValue = Number(value);

    if (!Number.isFinite(nextValue)) {
      return;
    }

    const nextRange: PriceRange =
      index === 0 ? [nextValue, priceRange[1]] : [priceRange[0], nextValue];

    onPriceRangeChange(clampPriceRange(nextRange, priceLimits));
  }

  return (
    <div
      className={
        mode === "mobile"
          ? "products-catalog-filter-panel-inner flex max-h-[82vh] flex-col overflow-hidden rounded-t-[18px]"
          : "products-catalog-filter-panel-inner"
      }
    >
      {mode === "mobile" && (
        <span
          className="mx-auto mt-3 h-1 w-10 rounded-full bg-[#D0D5DD]"
          aria-hidden="true"
        />
      )}

      <div className="products-filter-panel-header products-filter-panel-stagger flex items-start justify-between gap-4 border-b border-[#EEF1F5] px-6 pt-5 pb-5">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-[20px] leading-tight font-semibold text-[#182033]">
            <span className="products-filter-title-icon inline-flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#FBF7EA] text-[#B18732]">
              <SlidersHorizontal className="size-4" aria-hidden="true" />
            </span>
            <span>Filter Products</span>
          </p>
          <p className="mt-2 text-sm leading-5 font-medium text-[#667085]">
            Refine your product catalog
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onReset}
            disabled={!hasDraftFilters}
            className={`products-filter-reset-action rounded-full px-2.5 py-1 text-xs font-bold transition-[background-color,color,opacity] duration-[150ms] focus-visible:ring-3 focus-visible:ring-[#C9A44C]/15 focus-visible:outline-none ${
              hasDraftFilters
                ? "text-[#9A7628] hover:bg-[#FFF8E5] hover:text-[#182033]"
                : "cursor-not-allowed text-[#B7BFCC] opacity-70"
            }`}
          >
            Reset
          </button>
          {mode === "mobile" && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close product filters"
              className="inline-flex size-8 items-center justify-center rounded-full text-[#667085] transition-[background-color,color] duration-[150ms] hover:bg-[#F4F6FA] hover:text-[#182033] focus-visible:ring-3 focus-visible:ring-[#C9A44C]/15 focus-visible:outline-none"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="products-filter-panel-body grid gap-6 overflow-y-auto px-6 py-5">
        <section className="products-filter-panel-section products-filter-panel-stagger products-filter-panel-stagger-category grid gap-3">
          <h3 className="text-[11px] font-bold tracking-[0.1em] text-[#344054] uppercase">
            Category
          </h3>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.length > 0 ? (
              categoryOptions.map((category) => (
                <FilterCategoryButton
                  key={category}
                  category={category}
                  isActive={selectedCategories.includes(category)}
                  onSelect={() => onCategoryToggle(category)}
                />
              ))
            ) : (
              <p className="text-sm font-medium text-[#8A94A6]">
                No categories available
              </p>
            )}
          </div>
        </section>

        {priceLimits.hasPrices && (
          <section className="products-filter-panel-section products-filter-panel-stagger products-filter-panel-stagger-price grid gap-3.5">
            <h3 className="text-[11px] font-bold tracking-[0.1em] text-[#344054] uppercase">
              Price Range
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold text-[#667085]">
                  Min Price
                </span>
                <span className="relative">
                  <input
                    type="number"
                    min={priceLimits.min}
                    max={priceLimits.max}
                    value={priceRange[0]}
                    onChange={(event) =>
                      updatePriceInput(0, event.target.value)
                    }
                    className="products-catalog-price-input h-12 w-full rounded-[12px] border border-[#E5E8EF] bg-white px-4 pr-12 text-[15px] font-bold text-[#182033] transition-[background-color,border-color,box-shadow] duration-[160ms] outline-none focus:border-[#C9A44C] focus:bg-[#FFFDF7] focus:ring-0"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-[#98A2B3]">
                    SAR
                  </span>
                </span>
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold text-[#667085]">
                  Max Price
                </span>
                <span className="relative">
                  <input
                    type="number"
                    min={priceLimits.min}
                    max={priceLimits.max}
                    value={priceRange[1]}
                    onChange={(event) =>
                      updatePriceInput(1, event.target.value)
                    }
                    className="products-catalog-price-input h-12 w-full rounded-[12px] border border-[#E5E8EF] bg-white px-4 pr-12 text-[15px] font-bold text-[#182033] transition-[background-color,border-color,box-shadow] duration-[160ms] outline-none focus:border-[#C9A44C] focus:bg-[#FFFDF7] focus:ring-0"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-[#98A2B3]">
                    SAR
                  </span>
                </span>
              </label>
            </div>
            <Slider
              min={priceLimits.min}
              max={priceLimits.max}
              step={priceStep}
              value={priceRange}
              disabled={!hasPriceChoices}
              onValueChange={(value) =>
                onPriceRangeChange(
                  clampPriceRange(
                    [value[0] ?? priceRange[0], value[1] ?? priceRange[1]],
                    priceLimits,
                  ),
                )
              }
              className="products-catalog-price-slider mt-1 py-3"
            />
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#98A2B3]">
              <span>SAR {formatFilterPrice(priceLimits.min)}</span>
              <span>SAR {formatFilterPrice(priceLimits.max)}</span>
            </div>
          </section>
        )}

        <section className="products-filter-panel-section products-filter-panel-stagger products-filter-panel-stagger-date grid gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays
              className="size-4 text-[#B18732]"
              aria-hidden="true"
            />
            <h3 className="text-[11px] font-bold tracking-[0.1em] text-[#344054] uppercase">
              Added Date
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {dateFilterOptions.map((option) => (
              <FilterDateButton
                key={option.value}
                option={option}
                isActive={dateFilter === option.value}
                onSelect={() => onDateFilterChange(option.value)}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="products-filter-panel-footer grid gap-3 border-t border-[#EEF1F5] bg-[#FBFCFE] px-6 py-4">
        <p
          key={resultCount}
          className="products-filter-result-count products-filter-panel-stagger products-filter-panel-stagger-results text-sm font-bold text-[#182033]"
        >
          <span className="text-[#B18732]">{resultCount}</span>{" "}
          {resultCount === 1 ? "product" : "products"} found
        </p>
        <div className="products-filter-panel-stagger products-filter-panel-stagger-actions grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-2.5">
          <button
            type="button"
            onClick={onReset}
            disabled={!hasDraftFilters}
            className={`products-filter-clear-button h-12 rounded-[12px] border px-4 text-sm font-bold transition-[background-color,border-color,color,opacity,transform] duration-[160ms] focus-visible:ring-3 focus-visible:ring-[#C9A44C]/15 focus-visible:outline-none ${
              hasDraftFilters
                ? "border-[#D7DCE5] bg-white text-[#4B5568] hover:border-[#C9A44C] hover:bg-[#FFFDF7] hover:text-[#182033]"
                : "cursor-not-allowed border-[#E5E8EF] bg-white text-[#B7BFCC] opacity-70"
            }`}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onApply}
            className="products-filter-show-button h-12 rounded-[12px] border border-[#C9A44C] bg-[#C9A44C] px-4 text-sm font-bold text-[#182033] shadow-[0_10px_22px_rgba(201,164,76,0.2)] transition-[box-shadow,filter,transform] duration-[160ms] hover:-translate-y-px focus-visible:ring-3 focus-visible:ring-[#C9A44C]/25 focus-visible:outline-none active:translate-y-0"
          >
            Show {resultCount} Products
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductThumbnail({
  product,
  storedProductImages,
}: {
  product: ProductApiResponse;
  storedProductImages: StoredProductImageMap;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageInfo =
    getStoredProductImageInfo(product, storedProductImages) ||
    getProductImageInfo(product);
  const shouldShowImage = Boolean(imageInfo && !imageFailed);

  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-[10px] bg-[#F4F6FA] p-1.5 text-[#3972D5]">
      {shouldShowImage && imageInfo ? (
        <Image
          src={imageInfo.src}
          alt={imageInfo.alt}
          width={48}
          height={48}
          unoptimized={!imageInfo.src.startsWith("/")}
          onError={() => setImageFailed(true)}
          className="products-catalog-thumbnail-media h-full w-full object-contain transition-transform duration-[180ms] ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <PackageOpen className="size-5" aria-hidden="true" />
      )}
    </span>
  );
}

function ProductName({ product }: { product: ProductApiResponse }) {
  const displayName = getProductDisplayName(product.name);

  return (
    <div className="min-w-0">
      <p
        className="truncate text-sm font-semibold text-[#182033]"
        dir="auto"
        title={displayName.primary}
      >
        {displayName.primary}
      </p>
      {displayName.secondary && (
        <p
          className="mt-1 truncate text-xs font-medium text-[#667085]"
          dir="rtl"
          title={displayName.secondary}
        >
          {displayName.secondary}
        </p>
      )}
    </div>
  );
}

function ProductActionsButton({
  product,
  canManageProducts,
  onEdit,
  onRemove,
}: {
  product: ProductApiResponse;
  canManageProducts: boolean;
  onEdit: (product: ProductApiResponse) => void;
  onRemove: (product: ProductApiResponse) => void;
}) {
  const buttonClassName =
    "inline-flex size-9 items-center justify-center rounded-[9px] border border-[#E5E8EF] bg-white text-[#667085] transition-[background-color,border-color,color] duration-[180ms]";

  if (!canManageProducts) {
    return (
      <button
        type="button"
        disabled
        title="No product actions configured"
        aria-label={`No product actions configured for ${product.name}`}
        className={`${buttonClassName} disabled:cursor-not-allowed disabled:opacity-70`}
      >
        <MoreHorizontal className="size-4" aria-hidden="true" />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="Product actions"
          aria-label={`Open actions for ${product.name}`}
          className={`${buttonClassName} hover:border-[#D4AF4F]/55 hover:bg-[#FFFDF7] hover:text-[#B18732] focus-visible:ring-4 focus-visible:ring-[#D4AF4F]/20 focus-visible:outline-none`}
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-36 rounded-[10px] border-[#E5E8EF] bg-white p-1.5 shadow-[0_14px_32px_rgba(16,24,40,0.14)]"
      >
        <DropdownMenuItem
          onSelect={() => onEdit(product)}
          className="cursor-pointer rounded-[8px] px-2.5 py-2 text-sm font-medium text-[#344054] focus:bg-[#F4F6FA] focus:text-[#182033]"
        >
          <Pencil className="size-4 text-[#667085]" aria-hidden="true" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => onRemove(product)}
          className="cursor-pointer rounded-[8px] px-2.5 py-2 text-sm font-medium text-[#B42318] focus:bg-[#FEF3F2] focus:text-[#B42318]"
        >
          <Trash2 className="size-4 text-[#B42318]" aria-hidden="true" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ProductsList({
  products,
  page = 1,
  limit = 10,
  totalCount = 0,
}: ProductsListProps) {
  const { role } = useRoleUI();
  const canManageProducts = role === "MANAGER";
  const [q, setQ] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterValue>("any");
  const [draftSelectedCategories, setDraftSelectedCategories] = useState<
    string[]
  >([]);
  const [draftPriceRange, setDraftPriceRange] = useState<PriceRange | null>(
    null,
  );
  const [draftDateFilter, setDraftDateFilter] =
    useState<DateFilterValue>("any");
  const [storedProductImages, setStoredProductImages] =
    useState<StoredProductImageMap>({});
  const [storedProductOverrides, setStoredProductOverrides] =
    useState<StoredProductOverrideMap>({});
  const [removedProductIds, setRemovedProductIds] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] =
    useState<ProductApiResponse | null>(null);
  const [productPendingRemoval, setProductPendingRemoval] =
    useState<ProductApiResponse | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const isMobileFilterPanel = useIsMobileFilterPanel();

  useEffect(() => {
    function syncStoredProductState() {
      setStoredProductImages(readStoredProductImages());
      setStoredProductOverrides(readStoredProductOverrides());
      setRemovedProductIds(readRemovedProductIds());
    }

    syncStoredProductState();
    window.addEventListener("storage", syncStoredProductState);
    window.addEventListener(
      "goldera-product-images-updated",
      syncStoredProductState,
    );
    window.addEventListener(
      "goldera-products-local-state-updated",
      syncStoredProductState,
    );

    return () => {
      window.removeEventListener("storage", syncStoredProductState);
      window.removeEventListener(
        "goldera-product-images-updated",
        syncStoredProductState,
      );
      window.removeEventListener(
        "goldera-products-local-state-updated",
        syncStoredProductState,
      );
    };
  }, []);

  const removedProductIdSet = useMemo(
    () => new Set(removedProductIds),
    [removedProductIds],
  );
  const visibleProducts = useMemo(
    () =>
      products
        .map((product) => ({
          ...product,
          ...storedProductOverrides[product.id],
        }))
        .filter((product) => !removedProductIdSet.has(product.id)),
    [products, removedProductIdSet, storedProductOverrides],
  );
  const safeTotalCount = Math.max(
    0,
    (totalCount || products.length) - removedProductIds.length,
  );

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          visibleProducts.map((product) =>
            getProductCategory(product.internalRef),
          ),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [visibleProducts],
  );
  const priceLimits = useMemo(
    () => getPriceLimits(visibleProducts),
    [visibleProducts],
  );
  const activePriceRange = useMemo<PriceRange>(
    () =>
      priceRange
        ? clampPriceRange(priceRange, priceLimits)
        : [priceLimits.min, priceLimits.max],
    [priceLimits, priceRange],
  );
  const draftActivePriceRange = useMemo<PriceRange>(
    () =>
      draftPriceRange
        ? clampPriceRange(draftPriceRange, priceLimits)
        : [priceLimits.min, priceLimits.max],
    [draftPriceRange, priceLimits],
  );
  const priceStep = useMemo(() => {
    if (!priceLimits.hasPrices) {
      return 1;
    }

    return Math.max(1, Math.round((priceLimits.max - priceLimits.min) / 100));
  }, [priceLimits]);
  const effectiveSelectedCategories = useMemo(
    () => getEffectiveCategories(selectedCategories, categoryOptions),
    [categoryOptions, selectedCategories],
  );
  const effectiveDraftSelectedCategories = useMemo(
    () => getEffectiveCategories(draftSelectedCategories, categoryOptions),
    [categoryOptions, draftSelectedCategories],
  );
  const hasPriceFilter = isPriceRangeActive(activePriceRange, priceLimits);
  const hasDraftPriceFilter = isPriceRangeActive(
    draftActivePriceRange,
    priceLimits,
  );
  const hasDateFilter = isDateFilterActive(dateFilter);
  const hasDraftDateFilter = isDateFilterActive(draftDateFilter);
  const activeFilterCount =
    (effectiveSelectedCategories.length > 0 ? 1 : 0) +
    (hasPriceFilter ? 1 : 0) +
    (hasDateFilter ? 1 : 0);
  const draftFilterCount =
    (effectiveDraftSelectedCategories.length > 0 ? 1 : 0) +
    (hasDraftPriceFilter ? 1 : 0) +
    (hasDraftDateFilter ? 1 : 0);
  const trimmedQuery = q.trim();
  const hasSearchQuery = trimmedQuery.length > 0;
  const hasActiveFilters = activeFilterCount > 0;
  const hasActiveCriteria = hasSearchQuery || hasActiveFilters;

  const summary = useMemo(() => {
    const pricedProducts = visibleProducts.filter(
      (product) =>
        typeof product.salesPrice === "number" &&
        Number.isFinite(product.salesPrice),
    );
    const averageSalesPrice =
      pricedProducts.length > 0
        ? pricedProducts.reduce((sum, product) => sum + product.salesPrice, 0) /
          pricedProducts.length
        : 0;

    return {
      totalProducts: safeTotalCount,
      averageSalesPrice,
      categories: categoryOptions.length,
    };
  }, [categoryOptions.length, safeTotalCount, visibleProducts]);

  const filtered = useMemo(() => {
    return filterProductsByCriteria(visibleProducts, {
      term: trimmedQuery,
      selectedCategories: effectiveSelectedCategories,
      priceRange: activePriceRange,
      hasPriceFilter,
      dateFilter,
    });
  }, [
    activePriceRange,
    dateFilter,
    effectiveSelectedCategories,
    hasPriceFilter,
    trimmedQuery,
    visibleProducts,
  ]);
  const draftFiltered = useMemo(() => {
    return filterProductsByCriteria(visibleProducts, {
      term: trimmedQuery,
      selectedCategories: effectiveDraftSelectedCategories,
      priceRange: draftActivePriceRange,
      hasPriceFilter: hasDraftPriceFilter,
      dateFilter: draftDateFilter,
    });
  }, [
    draftActivePriceRange,
    draftDateFilter,
    effectiveDraftSelectedCategories,
    hasDraftPriceFilter,
    trimmedQuery,
    visibleProducts,
  ]);

  const displayedTotalCount = hasActiveCriteria
    ? filtered.length
    : safeTotalCount;
  const displayedPage = hasActiveCriteria ? 1 : page;
  const criteriaSignature = `${trimmedQuery}-${effectiveSelectedCategories.join("|")}-${activePriceRange[0]}-${activePriceRange[1]}-${dateFilter}-${filtered.length}`;

  function resetFilters() {
    setSelectedCategories([]);
    setPriceRange(null);
    setDateFilter("any");
    setDraftSelectedCategories([]);
    setDraftPriceRange(null);
    setDraftDateFilter("any");
  }

  function clearAllCriteria() {
    setQ("");
    resetFilters();
  }

  function syncDraftFilters() {
    setDraftSelectedCategories(effectiveSelectedCategories);
    setDraftPriceRange(hasPriceFilter ? activePriceRange : null);
    setDraftDateFilter(dateFilter);
  }

  function handleFilterOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      syncDraftFilters();
    }

    setIsFilterOpen(nextOpen);
  }

  function resetDraftFilters() {
    setDraftSelectedCategories([]);
    setDraftPriceRange(null);
    setDraftDateFilter("any");
  }

  function handleDraftCategoryToggle(category: string) {
    setDraftSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }

  function handleDraftPriceRangeChange(nextRange: PriceRange) {
    setDraftPriceRange(clampPriceRange(nextRange, priceLimits));
  }

  function applyDraftFilters() {
    const nextPriceRange = hasDraftPriceFilter ? draftActivePriceRange : null;

    setSelectedCategories(effectiveDraftSelectedCategories);
    setPriceRange(nextPriceRange);
    setDateFilter(draftDateFilter);
    setIsFilterOpen(false);
  }

  function removeCategoryFilter(category: string) {
    setSelectedCategories((current) =>
      current.filter((item) => item !== category),
    );
    setDraftSelectedCategories((current) =>
      current.filter((item) => item !== category),
    );
  }

  function handleProductUpdated(updatedProduct: ProductApiResponse) {
    setStoredProductOverrides((current) => ({
      ...current,
      [updatedProduct.id]: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        internalRef: updatedProduct.internalRef,
        salesPrice: updatedProduct.salesPrice,
        updatedAt: updatedProduct.updatedAt,
      },
    }));
  }

  function handleConfirmRemove() {
    if (!productPendingRemoval) {
      return;
    }

    const productToRemove = productPendingRemoval;
    const productRemoved = saveRemovedProductId(productToRemove.id);

    if (!productRemoved) {
      toast.error("Failed to remove product in this browser");
      return;
    }

    setRemovedProductIds((current) =>
      Array.from(new Set([...current, productToRemove.id])),
    );
    setStoredProductOverrides((current) => {
      const next = { ...current };
      delete next[productToRemove.id];
      return next;
    });
    if (editingProduct?.id === productToRemove.id) {
      setEditingProduct(null);
    }
    setProductPendingRemoval(null);
    toast.success("Product removed successfully");
  }

  return (
    <div className="products-page-enter products-page-enter-delay-1 mt-5 space-y-5 sm:mt-6 sm:space-y-6">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Total Products"
          value={numberFormatter.format(summary.totalProducts)}
          helper="Active pharmaceutical items"
          icon={Package}
          tone="blue"
          animationDelay="120ms"
        />
        <SummaryCard
          label="Average Sales Price"
          value={formatProductPrice(summary.averageSalesPrice)}
          helper="Across all products"
          icon={TrendingUp}
          tone="green"
          animationDelay="175ms"
        />
        <SummaryCard
          label="Categories"
          value={numberFormatter.format(summary.categories)}
          helper="Product categories"
          icon={Tag}
          tone="gold"
          animationDelay="230ms"
        />
      </section>

      <section className="products-page-enter products-page-enter-delay-2 overflow-hidden rounded-[16px] border border-[#E5E8EF] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <header className="flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-start lg:gap-6">
          <div className="products-catalog-header-copy-enter min-w-0">
            <h2 className="text-[21px] leading-tight font-semibold text-[#182033] sm:text-[23px]">
              Product Catalog
            </h2>
            <p className="mt-1.5 max-w-[520px] text-sm leading-5 font-medium text-[#667085] lg:whitespace-nowrap">
              Manage, search and organize your pharmaceutical portfolio.
            </p>
            <p
              key={`${filtered.length}-${safeTotalCount}`}
              className="products-catalog-count-chip-enter mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm font-medium text-[#667085]"
            >
              <span
                className="size-1.5 rounded-full bg-[#C9A44C] shadow-[0_0_0_3px_rgba(201,164,76,0.12)]"
                aria-hidden="true"
              />
              <span>
                Showing{" "}
                <span className="font-semibold text-[#182033]">
                  {filtered.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#182033]">
                  {safeTotalCount}
                </span>{" "}
                products
                {hasSearchQuery && (
                  <>
                    {" "}
                    matching{" "}
                    <span className="text-[#182033]">
                      &quot;{trimmedQuery}&quot;
                    </span>
                  </>
                )}
              </span>
            </p>
          </div>

          <div className="products-catalog-controls-enter grid w-full gap-2 sm:grid-cols-[minmax(0,1fr)_136px] lg:max-w-[520px]">
            <div className="products-catalog-search-field relative min-w-0">
              <Search
                className="products-catalog-search-icon pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#98A2B3]"
                aria-hidden="true"
              />
              <input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="Search by name or reference..."
                className="products-catalog-search-input h-11 w-full rounded-[12px] border border-[#E5E8EF] bg-white pr-3 pl-10 text-sm font-medium text-[#182033] transition-[border-color,background-color,box-shadow] duration-[160ms] outline-none placeholder:text-[#98A2B3] focus:border-[#C9A44C] focus:bg-[#FFFDF7] focus:ring-0"
              />
            </div>

            {isMobileFilterPanel ? (
              <Sheet open={isFilterOpen} onOpenChange={handleFilterOpenChange}>
                <SheetTrigger asChild>
                  <FilterTriggerButton
                    activeFilterCount={activeFilterCount}
                    isOpen={isFilterOpen}
                    className="products-catalog-filter-field products-catalog-filter-button"
                    aria-label={`Open product filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ""}`}
                  />
                </SheetTrigger>
                <SheetContent
                  side="bottom"
                  className="products-catalog-filter-sheet rounded-t-[18px] border-[#E5E8EF] bg-white p-0 shadow-[0_-18px_46px_rgba(16,24,40,0.18)]"
                  hideCloseButton
                >
                  <SheetHeader className="sr-only">
                    <SheetTitle>Filter Products</SheetTitle>
                    <SheetDescription>
                      Refine the product catalog by category, sales price, and
                      added date.
                    </SheetDescription>
                  </SheetHeader>
                  <ProductFilterPanel
                    mode="mobile"
                    categoryOptions={categoryOptions}
                    selectedCategories={effectiveDraftSelectedCategories}
                    onCategoryToggle={handleDraftCategoryToggle}
                    priceLimits={priceLimits}
                    priceRange={draftActivePriceRange}
                    priceStep={priceStep}
                    onPriceRangeChange={handleDraftPriceRangeChange}
                    dateFilter={draftDateFilter}
                    onDateFilterChange={setDraftDateFilter}
                    draftFilterCount={draftFilterCount}
                    resultCount={draftFiltered.length}
                    onReset={resetDraftFilters}
                    onApply={applyDraftFilters}
                    onClose={() => setIsFilterOpen(false)}
                  />
                </SheetContent>
              </Sheet>
            ) : (
              <Popover
                open={isFilterOpen}
                onOpenChange={handleFilterOpenChange}
              >
                <PopoverTrigger asChild>
                  <FilterTriggerButton
                    activeFilterCount={activeFilterCount}
                    isOpen={isFilterOpen}
                    className="products-catalog-filter-field products-catalog-filter-button"
                    aria-label={`Open product filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ""}`}
                  />
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={10}
                  className="products-catalog-filter-panel w-[min(430px,calc(100vw-2rem))] overflow-visible rounded-[16px] border-[#E5E8EF] bg-white p-0 shadow-[0_18px_46px_rgba(16,24,40,0.16)]"
                >
                  <ProductFilterPanel
                    mode="desktop"
                    categoryOptions={categoryOptions}
                    selectedCategories={effectiveDraftSelectedCategories}
                    onCategoryToggle={handleDraftCategoryToggle}
                    priceLimits={priceLimits}
                    priceRange={draftActivePriceRange}
                    priceStep={priceStep}
                    onPriceRangeChange={handleDraftPriceRangeChange}
                    dateFilter={draftDateFilter}
                    onDateFilterChange={setDraftDateFilter}
                    draftFilterCount={draftFilterCount}
                    resultCount={draftFiltered.length}
                    onReset={resetDraftFilters}
                    onApply={applyDraftFilters}
                    onClose={() => setIsFilterOpen(false)}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </header>

        {hasActiveFilters && (
          <div className="products-catalog-active-filters border-t border-[#EEF1F5] bg-[#FBFCFE] px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-bold tracking-[0.04em] text-[#667085] uppercase">
                  Active filters
                </span>
                {effectiveSelectedCategories.map((category) => (
                  <ActiveFilterChip
                    key={category}
                    label={category}
                    onRemove={() => removeCategoryFilter(category)}
                  />
                ))}
                {hasPriceFilter && (
                  <ActiveFilterChip
                    label={formatFilterPriceRange(activePriceRange)}
                    onRemove={() => setPriceRange(null)}
                  />
                )}
                {hasDateFilter && (
                  <ActiveFilterChip
                    label={dateFilterLabels[dateFilter]}
                    onRemove={() => setDateFilter("any")}
                  />
                )}
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="w-fit rounded-full px-2.5 py-1 text-xs font-bold text-[#9A7628] transition-[background-color,color] duration-[150ms] hover:bg-[#FFF8E5] hover:text-[#182033] focus-visible:ring-3 focus-visible:ring-[#C9A44C]/15 focus-visible:outline-none"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {filtered.length > 0 ? (
          <div
            key={criteriaSignature}
            className="products-catalog-results-refresh"
          >
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8FAFC]">
                  <tr className="border-b border-[#E5E8EF]">
                    <th className="w-[56px] px-5 py-3 text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-[#667085] uppercase">
                      #
                    </th>
                    <th className="px-5 py-3 text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-[#667085] uppercase">
                      Product Name
                    </th>
                    <th className="w-[140px] px-5 py-3 text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-[#667085] uppercase">
                      Internal Ref
                    </th>
                    <th className="w-[220px] px-5 py-3 text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-[#667085] uppercase">
                      Category
                    </th>
                    <th className="w-[170px] px-5 py-3 text-right text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-[#667085] uppercase">
                      Sales Price (SAR)
                    </th>
                    <th className="w-[150px] px-5 py-3 text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-[#667085] uppercase">
                      Added Date
                    </th>
                    <th className="w-[88px] px-5 py-3 text-center text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-[#667085] uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product, index) => {
                    const category = getProductCategory(product.internalRef);

                    return (
                      <tr
                        key={product.id}
                        className="products-catalog-row-enter group border-b border-[#EDF0F5] transition-colors duration-[180ms] last:border-0 hover:bg-[#F8FAFC]"
                        style={
                          {
                            "--products-row-delay": `${index * 22}ms`,
                          } as CSSProperties
                        }
                      >
                        <td className="px-5 py-4 text-xs font-medium text-[#667085]">
                          {(displayedPage - 1) * limit + index + 1}
                        </td>
                        <td className="max-w-[360px] px-5 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <ProductThumbnail
                              product={product}
                              storedProductImages={storedProductImages}
                            />
                            <ProductName product={product} />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="inline-flex max-w-[116px] items-center rounded-[7px] bg-[#EEF3FF] px-2.5 py-1 text-xs font-semibold text-[#3972D5]"
                            dir="ltr"
                            title={product.internalRef || undefined}
                          >
                            <span className="truncate">
                              {product.internalRef || "N/A"}
                            </span>
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <CategoryBadge category={category} />
                        </td>
                        <td className="px-5 py-4 text-right font-semibold whitespace-nowrap text-[#182033]">
                          {formatProductPrice(product.salesPrice)}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-[#667085]">
                          {formatProductDate(product.createdAt)}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <ProductActionsButton
                            product={product}
                            canManageProducts={canManageProducts}
                            onEdit={setEditingProduct}
                            onRemove={setProductPendingRemoval}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 md:hidden">
              {filtered.map((product, index) => {
                const category = getProductCategory(product.internalRef);

                return (
                  <article
                    key={product.id}
                    className="products-catalog-row-enter group rounded-[12px] border border-[#E5E8EF] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)] transition-colors duration-[180ms] hover:bg-[#F8FAFC]"
                    style={
                      {
                        "--products-row-delay": `${index * 22}ms`,
                      } as CSSProperties
                    }
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <ProductThumbnail
                        product={product}
                        storedProductImages={storedProductImages}
                      />
                      <div className="min-w-0 flex-1">
                        <ProductName product={product} />
                        <p className="mt-2 text-xs font-medium text-[#98A2B3]">
                          #{(displayedPage - 1) * limit + index + 1}
                        </p>
                      </div>
                      <ProductActionsButton
                        product={product}
                        canManageProducts={canManageProducts}
                        onEdit={setEditingProduct}
                        onRemove={setProductPendingRemoval}
                      />
                    </div>

                    <dl className="mt-4 grid gap-3 text-sm">
                      <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-2">
                        <dt className="text-xs font-semibold text-[#8A94A6]">
                          Ref
                        </dt>
                        <dd>
                          <span
                            className="inline-flex max-w-full items-center rounded-[7px] bg-[#EEF3FF] px-2.5 py-1 text-xs font-semibold text-[#3972D5]"
                            dir="ltr"
                            title={product.internalRef || undefined}
                          >
                            <span className="truncate">
                              {product.internalRef || "N/A"}
                            </span>
                          </span>
                        </dd>
                      </div>
                      <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-2">
                        <dt className="text-xs font-semibold text-[#8A94A6]">
                          Category
                        </dt>
                        <dd className="min-w-0">
                          <CategoryBadge category={category} />
                        </dd>
                      </div>
                      <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-2">
                        <dt className="text-xs font-semibold text-[#8A94A6]">
                          Price
                        </dt>
                        <dd className="font-semibold text-[#182033]">
                          {formatProductPrice(product.salesPrice)}
                        </dd>
                      </div>
                      <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-2">
                        <dt className="text-xs font-semibold text-[#8A94A6]">
                          Added
                        </dt>
                        <dd className="font-medium text-[#667085]">
                          {formatProductDate(product.createdAt)}
                        </dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            key={criteriaSignature}
            className="products-catalog-empty-state products-catalog-results-refresh m-4 rounded-[14px] border border-dashed border-[#D0D5DD] bg-[#FBFCFE] px-5 py-10 text-center"
          >
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#FFF8E5] text-[#B18732]">
              <Search className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-base font-bold text-[#182033]">
              No products found
            </h3>
            <p className="mx-auto mt-2 max-w-[360px] text-sm leading-6 font-medium text-[#667085]">
              We couldn&apos;t find products matching your current search and
              filters.
            </p>
            {hasActiveCriteria && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={clearAllCriteria}
                  className="h-10 rounded-[10px] border border-[#C9A44C] bg-[#C9A44C] px-4 text-sm font-bold text-[#182033] shadow-[0_8px_18px_rgba(201,164,76,0.18)] transition-[background-color,border-color,transform] duration-[160ms] hover:-translate-y-px hover:bg-[#D7B861] focus-visible:ring-3 focus-visible:ring-[#C9A44C]/25 focus-visible:outline-none"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}

        <TablePaginationFooter
          page={displayedPage}
          limit={limit}
          totalCount={displayedTotalCount}
          itemLabel="products"
          ariaLabel="Product catalog pagination"
          pageNavAriaLabel="Product catalog pages"
        />
      </section>

      {canManageProducts && editingProduct && (
        <AddProductDialog
          key={editingProduct.id}
          product={editingProduct}
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setEditingProduct(null);
            }
          }}
          onProductUpdated={handleProductUpdated}
        />
      )}

      <AlertDialog
        open={Boolean(productPendingRemoval)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setProductPendingRemoval(null);
          }
        }}
      >
        <AlertDialogContent className="rounded-[14px] border-0 bg-white shadow-[0_24px_70px_rgba(12,22,42,0.22)] sm:max-w-[460px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-semibold text-[#B42318]">
              Remove Product
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-6 text-[#667085]">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-[#182033]">
                {productPendingRemoval?.name || "this product"}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10 cursor-pointer rounded-[9px] border-[#E5E8EF] px-4 font-semibold text-[#475467]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              className="h-10 cursor-pointer rounded-[9px] border border-[#B42318] bg-[#B42318] px-4 font-semibold text-white hover:bg-white hover:text-[#B42318]"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
