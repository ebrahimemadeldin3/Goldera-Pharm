"use client";

import { Package, Tag, DollarSign } from "lucide-react";
import { StatCards } from "@/core/ui/StatCards";
import { useRoleUI } from "@/core/ui/role-ui-context";
import type { ProductApiResponse } from "../lib/types";
import { useMemo } from "react";
import type { StatCardConfig } from "@/core/ui/stat-card-types";
import { AddProductDialog } from "./AddProductDialog";

interface ProductsHeaderProps {
  products: ProductApiResponse[];
}

export default function ProductsHeader({ products }: ProductsHeaderProps) {
  const { role } = useRoleUI();
  const isManager = role === "MANAGER";

  const { statsConfig, data } = useMemo(() => {
    const total = products.length;
    const avgPrice =
      total > 0
        ? Math.round(
            products.reduce((sum, p) => sum + (p.salesPrice || 0), 0) / total,
          )
        : 0;

    const statsConfig: StatCardConfig[] = [
      {
        id: "total-products",
        label: "Total Products",
        dataKey: "total",
        icon: Package,
        bgColor: "bg-dashboard-blue",
      },
      {
        id: "avg-price",
        label: "Avg. Sales Price (SAR)",
        dataKey: "avgPrice",
        icon: DollarSign,
        bgColor: "bg-dashboard-green",
      },
      {
        id: "categories",
        label: "Unique Categories",
        dataKey: "categories",
        icon: Tag,
        bgColor: "bg-gold",
      },
    ];

    const uniqueCategories = new Set(
      products.map((p) => {
        if (!p.internalRef) return "General";
        const code = p.internalRef.substring(1, 3);
        return code;
      }),
    ).size;

    return {
      statsConfig,
      data: { total, avgPrice, categories: uniqueCategories },
    };
  }, [products]);

  return (
    <>
      <header className="flex flex-wrap items-center justify-start gap-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-normal text-black md:text-[34px]">
            Products Catalog
          </h1>
          <p className="text-secondary-dark text-[16px]">
            Manage all pharmaceutical products and their pricing
          </p>
        </div>
        {isManager && <AddProductDialog />}
      </header>
      <StatCards stats={statsConfig} data={data} />
    </>
  );
}
