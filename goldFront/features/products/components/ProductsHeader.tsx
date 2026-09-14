"use client";

import { useRoleUI } from "@/core/ui/role-ui-context";
import { AddProductDialog } from "./AddProductDialog";

export default function ProductsHeader() {
  const { role } = useRoleUI();
  const isManager = role === "MANAGER";
  const isRep = role === "MEDICAL_REP";

  if (isRep) {
    return null;
  }

  return (
    <header className="products-page-enter flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] text-[#B18732] uppercase">
          <span className="h-px w-8 bg-[#C9A44C]" aria-hidden="true" />
          Commercial
        </p>
        <h1 className="mt-1 text-[26px] leading-tight font-semibold text-[#101D36] sm:text-[30px]">
          Product Catalog
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-[#667085]">
          Manage pharmaceutical products, categories, availability and
          commercial information.
        </p>
      </div>
      {isManager && (
        <div className="w-full sm:w-auto">
          <AddProductDialog />
        </div>
      )}
    </header>
  );
}
