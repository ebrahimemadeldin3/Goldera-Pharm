"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { format } from "date-fns";
import type { ProductApiResponse } from "../lib/types";
import Pagination from "@/components/ui/Pagination";

interface ProductsListProps {
  products: ProductApiResponse[];
  page?: number;
  limit?: number;
  totalCount?: number;
}

function getCategory(internalRef: string | null): string {
  if (!internalRef) return "General";
  const code = internalRef.substring(1, 3);
  const map: Record<string, string> = {
    "01": "Topical Care",
    "02": "Nutritional Supplements",
    "03": "Healthcare",
  };
  return map[code] || "General";
}

export default function ProductsList({ products, page = 1, limit = 10, totalCount = 0 }: ProductsListProps) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.internalRef?.toLowerCase().includes(term),
    );
  }, [products, q]);

  return (
    <section className="border-secondary-light mt-6 rounded-[14px] border-[.8px] bg-white p-6">
     
           <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <p className="text-secondary-dark text-xs">
          Showing {filtered.length} of {totalCount || products.length} products
        </p>
        <Pagination page={page} limit={limit} totalCount={totalCount || products.length} />
      </div>
     
      {/* Filters */}
      <header className="mb-6 flex flex-wrap items-center gap-4">
        <h2 className="text-xl font-semibold">Product Catalog</h2>
        <div className="relative ml-auto w-full max-w-70">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#717182]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or reference..."
            className="h-9 w-full rounded-md border bg-white pl-10 text-sm"
          />
        </div>
      </header>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-secondary-light border-b text-left">
              <th className="text-secondary-dark pr-4 pb-3 font-medium">#</th>
              <th className="text-secondary-dark pr-4 pb-3 font-medium">
                Product Name
              </th>
              <th className="text-secondary-dark pr-4 pb-3 font-medium">
                Internal Ref
              </th>
              <th className="text-secondary-dark pr-4 pb-3 font-medium">
                Category
              </th>
              <th className="text-secondary-dark pr-4 pb-3 font-medium">
                Sales Price (SAR)
              </th>
              <th className="text-secondary-dark pb-3 font-medium">Added</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product, index) => (
              <tr
                key={product.id}
                className="border-secondary-light border-b last:border-0 hover:bg-[#f8fafc]"
              >
                <td className="py-3 pr-4 text-[#717182]">{index + 1}</td>
                <td className="py-3 pr-4 font-medium text-black">
                  {product.name}
                </td>
                <td className="py-3 pr-4">
                  <span className="rounded-md bg-[#EBF1FF] px-2 py-0.5 text-xs font-medium text-[#2563EB]">
                    {product.internalRef || "—"}
                  </span>
                </td>
                <td className="py-3 pr-4 text-[#334155]">
                  {getCategory(product.internalRef)}
                </td>
                <td className="py-3 pr-4 font-medium text-black">
                  {product.salesPrice
                    ? new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(product.salesPrice)
                    : "—"}
                </td>
                <td className="py-3 text-[#717182]">
                  {product.createdAt
                    ? format(new Date(product.createdAt), "MMM d, yyyy")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="rounded-md border border-dashed border-slate-200 bg-white/60 p-8 text-center text-sm text-slate-500">
            No products found.
          </div>
        )}
      </div>


    </section>
  );
}
