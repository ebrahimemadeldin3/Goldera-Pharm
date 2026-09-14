"use client";

import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";

interface PaginationProps {
  page?: number;
  limit?: number;
  totalCount?: number;
  itemLabel?: string;
  ariaLabel?: string;
  pageNavAriaLabel?: string;
  pageSizeOptions?: number[];
  onPageChangeStart?: () => void;
}

export default function Pagination({
  page = 1,
  limit = 10,
  totalCount = 0,
  itemLabel = "items",
  ariaLabel = "Pagination",
  pageNavAriaLabel = "Pages",
  pageSizeOptions,
  onPageChangeStart,
}: PaginationProps) {
  return (
    <TablePaginationFooter
      page={page}
      limit={limit}
      totalCount={totalCount}
      itemLabel={itemLabel}
      ariaLabel={ariaLabel}
      pageNavAriaLabel={pageNavAriaLabel}
      pageSizeOptions={pageSizeOptions}
      onPageChangeStart={onPageChangeStart}
    />
  );
}
