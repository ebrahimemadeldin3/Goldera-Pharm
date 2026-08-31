"use client";

import { useMemo, useState } from "react";
import { Product } from "../lib/types";
import { Search, Package, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface ForecastProductStepProps {
  products: Product[];
  selectedProductIds: string[];
  onToggleProduct: (productId: string) => void;
  onClearAll: () => void;
}

export function ForecastProductStep({
  products,
  selectedProductIds,
  onToggleProduct,
  onClearAll,
}: ForecastProductStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categoryOptions = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category))).sort();
    return ["all", ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.internalRef && product.internalRef.toLowerCase().includes(query));

      const matchesCat =
        selectedCategory === "all" || product.category === selectedCategory;

      return matchesQuery && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  const selectedProducts = useMemo(
    () => products.filter((p) => selectedProductIds.includes(p.id)),
    [products, selectedProductIds]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#182033]">Select Products</h2>
          <p className="text-xs text-[#667085]">
            Choose the products you plan to distribute during this forecast period.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#E9F8F1] border border-[#CBEFDD] px-3 py-1 text-xs font-bold text-[#168557]">
            {selectedProductIds.length} Selected
          </span>
          {selectedProductIds.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-semibold text-[#667085] hover:text-[#D92D20] transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Toolbar: Search + Category Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98A2B3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product name or SKU..."
            className="h-10 w-full rounded-[10px] border border-[#DDE3EE] bg-[#F9FAFB] pr-3 pl-9 text-sm font-medium text-[#182033] placeholder:text-[#98A2B3] outline-none transition-colors focus:border-[#168557] focus:ring-2 focus:ring-[#168557]/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categoryOptions.map((cat) => {
            const isActive = selectedCategory === cat;
            const label = cat === "all" ? "All Categories" : cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors border",
                  isActive
                    ? "bg-[#E9F8F1] text-[#168557] border-[#CBEFDD]"
                    : "bg-white text-[#667085] border-[#E5E8EF] hover:bg-[#F9FAFB] hover:text-[#182033]"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-[#DDE3EE] bg-[#F9FAFB] p-8 text-center">
          <Package className="mx-auto size-8 text-[#98A2B3] mb-2" />
          <p className="text-sm font-semibold text-[#344054]">
            No products match your search
          </p>
          <p className="text-xs text-[#667085] mt-1">
            Try adjusting your query or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const isSelected = selectedProductIds.includes(product.id);

            return (
              <div
                key={product.id}
                onClick={() => onToggleProduct(product.id)}
                className={cn(
                  "group relative cursor-pointer rounded-[12px] border p-4 transition-all duration-150 text-left",
                  isSelected
                    ? "border-[#168557] bg-[#E9F8F1]/30 shadow-xs"
                    : "border-[#E5E8EF] bg-white hover:border-[#CBEFDD] hover:bg-[#F9FAFB]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center rounded-md bg-[#F4F6FA] px-2 py-0.5 text-[11px] font-semibold text-[#667085] truncate max-w-full">
                      {product.category}
                    </span>
                    <h3 className="mt-1.5 text-sm font-bold text-[#182033] line-clamp-1">
                      {product.name}
                    </h3>
                    {product.internalRef && (
                      <p className="mt-0.5 text-xs font-mono text-[#98A2B3]">
                        Ref: {product.internalRef}
                      </p>
                    )}
                  </div>

                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleProduct(product.id)}
                    className={cn(
                      "mt-0.5 size-5 transition-colors",
                      isSelected && "border-[#168557] bg-[#168557] text-white"
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Products Summary Bar */}
      {selectedProducts.length > 0 && (
        <div className="rounded-[12px] border border-[#CBEFDD] bg-[#E9F8F1] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-[#168557] uppercase tracking-wider">
              Selected Products Summary ({selectedProducts.length})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedProducts.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#CBEFDD] px-3 py-1 text-xs font-semibold text-[#182033]"
              >
                <span>{p.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleProduct(p.id);
                  }}
                  className="text-[#98A2B3] hover:text-[#D92D20] transition-colors"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
