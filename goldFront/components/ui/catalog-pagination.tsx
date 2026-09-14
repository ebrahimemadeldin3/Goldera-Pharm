"use client";

import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";

interface CatalogPaginationProps {
  page?: number;
  limit?: number;
  totalCount?: number;
  itemLabel: string;
  ariaLabel?: string;
  pageSizeOptions?: number[];
  onPageChangeStart?: () => void;
}

export function CatalogPagination({
  page = 1,
  limit = 10,
  totalCount = 0,
  itemLabel,
  ariaLabel = "Catalog pagination",
  pageSizeOptions,
  onPageChangeStart,
}: CatalogPaginationProps) {
  return (
    <TablePaginationFooter
      page={page}
      limit={limit}
      totalCount={totalCount}
      itemLabel={itemLabel}
      ariaLabel={ariaLabel}
      pageNavAriaLabel={ariaLabel}
      pageSizeOptions={pageSizeOptions}
      onPageChangeStart={onPageChangeStart}
    />
  );
}
