"use client";

import {
  Fragment,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import {
  Calendar,
  Check,
  ChevronRight,
  ClipboardCopy,
  Search,
  Settings2,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";
import { cn, formatSaudiDateDisplay, parseDateValue } from "@/lib/utils";
import type { DateFilter, SaleApiResponse } from "../lib/types";
import { filterSales, normalizeSalesDateFilter } from "../lib/utils";

interface SalesTableProps {
  sales: SaleApiResponse[];
  page?: number;
  limit?: number;
  selectedDate?: string;
  selectedDateFrom?: string;
  selectedDateTo?: string;
  selectedTimeFilter?: DateFilter;
  searchQuery?: string;
  hasAppliedFilters?: boolean;
}

type OptionalColumnId =
  "sheet" | "externalId" | "productId" | "createdAt" | "updatedAt";

type DetailItem = {
  label: string;
  value: string;
  mono?: boolean;
};

type RowSummary = {
  rowId: string;
  customerName: string;
  customerCode: string;
  orderNumber: string;
  orderDate: string;
  productName: string;
  productReference: string;
  productId: string;
  quantity: string;
  amount: string;
  sheetName: string;
  externalId: string;
  createdAt: string;
  updatedAt: string;
  copyId: string;
};

const DATE_FILTERS: { label: string; value: DateFilter }[] = [
  { label: "All Time", value: "all" },
  { label: "This Year", value: "year" },
  { label: "This Month", value: "month" },
  { label: "This Week", value: "week" },
  { label: "Today", value: "day" },
];

const PRIMARY_COLUMN_LABELS = [
  "Customer",
  "Order",
  "Product",
  "Quantity",
  "Amount",
];

const COLUMN_STORAGE_KEY = "golderapharm.sales.visibleOptionalColumns";

const OPTIONAL_COLUMN_DEFINITIONS: Array<{
  id: OptionalColumnId;
  label: string;
  heading: string;
  getValue: (summary: RowSummary) => string;
  mono?: boolean;
}> = [
  {
    id: "sheet",
    label: "Sheet",
    heading: "Sheet",
    getValue: (summary) => summary.sheetName,
  },
  {
    id: "externalId",
    label: "External ID",
    heading: "External ID",
    getValue: (summary) => summary.externalId,
    mono: true,
  },
  {
    id: "productId",
    label: "Product ID",
    heading: "Product ID",
    getValue: (summary) => summary.productId,
    mono: true,
  },
  {
    id: "createdAt",
    label: "Created At",
    heading: "Created",
    getValue: (summary) => summary.createdAt,
  },
  {
    id: "updatedAt",
    label: "Updated At",
    heading: "Updated",
    getValue: (summary) => summary.updatedAt,
  },
];

function readPrimitiveValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.name === "string" && obj.name.trim()) {
      return obj.name;
    }
    if (typeof obj.internalRef === "string" && obj.internalRef.trim()) {
      return obj.internalRef;
    }
    if (typeof obj.id === "string" && obj.id.trim()) {
      return obj.id;
    }
    return "";
  }

  return String(value);
}

function getFirstValue(sale: SaleApiResponse, keys: string[]): string {
  for (const key of keys) {
    const value = readPrimitiveValue(sale[key]);
    if (value) return value;
  }

  return "";
}

function getNestedProductValue(
  sale: SaleApiResponse,
  key: keyof NonNullable<SaleApiResponse["product"]>,
): string {
  const product = sale.product;
  if (!product || typeof product !== "object") return "";

  return readPrimitiveValue(product[key]);
}

function getNumericValue(sale: SaleApiResponse, keys: string[]): number | null {
  for (const key of keys) {
    const value = sale[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;

    if (typeof value === "string") {
      const parsed = Number(value.replace(/,/g, ""));
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return null;
}

function formatDateCell(value: unknown): string {
  const rawValue = readPrimitiveValue(value);
  if (!rawValue) return "";

  try {
    const date = parseDateValue(rawValue);
    if (Number.isNaN(date.getTime())) return rawValue;
    return formatSaudiDateDisplay(date);
  } catch {
    return rawValue;
  }
}

function formatAmount(value: number | null): string {
  if (value === null) return "-";
  return `${value.toLocaleString()} SAR`;
}

function createRowSummary(
  sale: SaleApiResponse,
  fallbackRowId: string,
): RowSummary {
  const externalId = getFirstValue(sale, ["externalId", "externalID"]);
  const productId =
    getFirstValue(sale, ["productId", "productID"]) ||
    getNestedProductValue(sale, "id");
  const productReference =
    getNestedProductValue(sale, "internalRef") ||
    getFirstValue(sale, ["productRef", "productReference"]) ||
    productId;
  const quantity = getNumericValue(sale, ["qtyOrdered", "quantity", "qty"]);
  const amount = getNumericValue(sale, [
    "untaxedTotal",
    "amount",
    "total",
    "totalAmount",
  ]);
  const recordId = readPrimitiveValue(sale.id) || externalId || fallbackRowId;

  return {
    rowId: recordId,
    customerName:
      getFirstValue(sale, ["customer", "customerName"]) || "Unknown customer",
    customerCode: getFirstValue(sale, [
      "customerCode",
      "customerId",
      "customerID",
      "customerRef",
      "customerReference",
      "customerNumber",
      "customerNo",
    ]),
    orderNumber:
      getFirstValue(sale, ["order", "orderNumber", "orderNo"]) ||
      externalId ||
      "-",
    orderDate:
      formatDateCell(
        sale.orderDate ?? sale.date ?? sale.saleDate ?? sale.soldAt,
      ) || "-",
    productName:
      getNestedProductValue(sale, "name") ||
      getFirstValue(sale, ["product", "productName"]) ||
      "Unknown product",
    productReference,
    productId,
    quantity: quantity === null ? "-" : quantity.toLocaleString(),
    amount: formatAmount(amount),
    sheetName: getFirstValue(sale, ["sheetName"]) || "-",
    externalId: externalId || "-",
    createdAt: formatDateCell(sale.createdAt) || "-",
    updatedAt: formatDateCell(sale.updatedAt) || "-",
    copyId: recordId,
  };
}

function getDetailItems(summary: RowSummary): DetailItem[] {
  return [
    { label: "Sheet", value: summary.sheetName },
    { label: "External ID", value: summary.externalId, mono: true },
    { label: "Product ID", value: summary.productId || "-", mono: true },
    { label: "Order Date", value: summary.orderDate },
    { label: "Created At", value: summary.createdAt },
    { label: "Updated At", value: summary.updatedAt },
    { label: "Record ID", value: summary.copyId, mono: true },
  ];
}

function getStoredOptionalColumns(): OptionalColumnId[] {
  if (typeof window === "undefined") return [];

  try {
    const storedValue = window.localStorage.getItem(COLUMN_STORAGE_KEY);
    if (!storedValue) return [];

    const parsedValue = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) return [];

    const allowedIds = new Set(
      OPTIONAL_COLUMN_DEFINITIONS.map((column) => column.id),
    );

    return parsedValue.filter((value): value is OptionalColumnId =>
      allowedIds.has(value),
    );
  } catch {
    return [];
  }
}

function persistOptionalColumns(nextColumns: OptionalColumnId[]) {
  if (typeof window === "undefined") return;

  try {
    if (nextColumns.length === 0) {
      window.localStorage.removeItem(COLUMN_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(
      COLUMN_STORAGE_KEY,
      JSON.stringify(nextColumns),
    );
  } catch {
    // localStorage can be unavailable in private browsing contexts.
  }
}

function ColumnSelector({
  visibleOptionalColumnIds,
  onToggleColumn,
  onResetColumns,
}: {
  visibleOptionalColumnIds: OptionalColumnId[];
  onToggleColumn: (columnId: OptionalColumnId, checked: boolean) => void;
  onResetColumns: () => void;
}) {
  const visibleCount = visibleOptionalColumnIds.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="sales-column-trigger inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-[10px] border border-[#DDE3EE] bg-[#F9FAFB] px-3 text-sm font-semibold text-[#344054] transition-[background-color,border-color,color,transform] duration-[160ms] hover:-translate-y-px hover:border-[#E9DDB8] hover:bg-[#FBF7EA] hover:text-[#8A6515] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto"
          aria-label="Customize sales table columns"
        >
          <Settings2 className="size-4" aria-hidden="true" />
          <span>Columns</span>
          {visibleCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C9A44C] px-1.5 text-[11px] leading-none font-bold text-white">
              {visibleCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="sales-column-popover-content w-[280px] overflow-hidden rounded-2xl border border-[#E5E8EF] bg-white p-0 text-[#182033] shadow-[0_18px_46px_rgba(16,27,51,0.14)]"
      >
        <div className="border-b border-[#EEF1F6] px-4 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#182033]">
                Customize columns
              </p>
              <p className="mt-1 text-xs font-medium text-[#667085]">
                Choose visible fields
              </p>
            </div>
            <button
              type="button"
              onClick={onResetColumns}
              disabled={visibleCount === 0}
              className="rounded-full px-2 py-1 text-xs font-bold text-[#8A6515] transition-colors hover:bg-[#FFF8E5] disabled:cursor-not-allowed disabled:text-[#B7BFCC] disabled:hover:bg-transparent"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="p-2">
          {PRIMARY_COLUMN_LABELS.map((label) => (
            <div
              key={label}
              className="flex h-9 items-center gap-2 rounded-[9px] px-2 text-sm font-medium text-[#344054]"
            >
              <Checkbox
                checked
                disabled
                className="border-[#C9A44C] bg-[#C9A44C] text-white"
                aria-label={`${label} column is always visible`}
              />
              <span>{label}</span>
            </div>
          ))}

          <div className="mt-2 border-t border-[#EEF1F6] pt-3">
            <p className="px-2 text-[10px] font-bold tracking-[0.08em] text-[#8A94A6] uppercase">
              Additional information
            </p>
            <div className="mt-1">
              {OPTIONAL_COLUMN_DEFINITIONS.map((column) => {
                const checked = visibleOptionalColumnIds.includes(column.id);

                return (
                  <label
                    key={column.id}
                    className="sales-column-option flex h-9 cursor-pointer items-center gap-2 rounded-[9px] px-2 text-sm font-medium text-[#344054] transition-[background-color,color] duration-[150ms] hover:bg-[#FBF7EA] hover:text-[#8A6515]"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(nextChecked) =>
                        onToggleColumn(column.id, nextChecked === true)
                      }
                      className="data-[state=checked]:border-[#C9A44C] data-[state=checked]:bg-[#C9A44C] data-[state=checked]:text-white"
                      aria-label={`Toggle ${column.label} column`}
                    />
                    <span>{column.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MetadataGrid({ summary }: { summary: RowSummary }) {
  return (
    <dl className="sales-row-details-grid grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {getDetailItems(summary).map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-[10px] font-bold tracking-[0.08em] text-[#8A94A6] uppercase">
            {item.label}
          </dt>
          <dd
            title={item.value}
            className={cn(
              "mt-1 truncate text-sm font-semibold text-[#182033]",
              item.mono && "font-mono text-[12px] text-[#344054]",
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function SalesRowDetails({
  summary,
  isCollapsing,
  copiedRowId,
  onCopyId,
}: {
  summary: RowSummary;
  isCollapsing: boolean;
  copiedRowId: string | null;
  onCopyId: (summary: RowSummary, event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const copied = copiedRowId === summary.rowId;

  return (
    <div
      className={cn(
        "sales-row-details-panel rounded-[14px] border border-[#E9DDB8] bg-[#FFFDF7] p-4",
        isCollapsing && "sales-row-details-panel-exit",
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="mb-3 text-[11px] font-bold tracking-[0.08em] text-[#8A6515] uppercase">
            Sale details
          </p>
          <MetadataGrid summary={summary} />
        </div>

        <button
          type="button"
          onClick={(event) => onCopyId(summary, event)}
          disabled={!summary.copyId || summary.copyId === "-"}
          className="sales-row-copy-button inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-[9px] border border-[#E5E8EF] bg-white px-3 text-sm font-semibold text-[#344054] transition-[background-color,border-color,color,transform] duration-[160ms] hover:-translate-y-px hover:border-[#E9DDB8] hover:bg-[#FBF7EA] hover:text-[#8A6515] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          {copied ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <ClipboardCopy className="size-4" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy ID"}
        </button>
      </div>
    </div>
  );
}

function SecondaryText({
  children,
  mono = false,
}: {
  children: string;
  mono?: boolean;
}) {
  if (!children || children === "-") return null;

  return (
    <span
      title={children}
      className={cn(
        "mt-1 block truncate text-xs font-medium text-[#667085]",
        mono && "font-mono text-[11px]",
      )}
    >
      {children}
    </span>
  );
}

export default function SalesTable({
  sales,
  page = 1,
  limit = 10,
  selectedDate = "",
  selectedDateFrom = "",
  selectedDateTo = "",
  selectedTimeFilter = "all",
  searchQuery = "",
  hasAppliedFilters = false,
}: SalesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [collapsingRowId, setCollapsingRowId] = useState<string | null>(null);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);
  const [visibleOptionalColumnIds, setVisibleOptionalColumnIds] = useState<
    OptionalColumnId[]
  >(getStoredOptionalColumns);
  const tableTransitionTimerRef = useRef<number | null>(null);
  const rowCollapseTimerRef = useRef<number | null>(null);
  const copiedTimerRef = useRef<number | null>(null);
  const timeFilterButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dateFilter = normalizeSalesDateFilter(selectedTimeFilter);
  const trimmedSearchQuery = searchQuery.trim();

  const filtered = useMemo(() => {
    return filterSales(sales, {
      dateRange: {
        from: selectedDateFrom || selectedDate,
        to: selectedDateTo || selectedDateFrom || selectedDate,
      },
      dateFilter,
      query: trimmedSearchQuery,
    });
  }, [
    sales,
    selectedDate,
    selectedDateFrom,
    selectedDateTo,
    dateFilter,
    trimmedSearchQuery,
  ]);

  const count = filtered.length;
  const totalPages = Math.max(1, Math.ceil(count / limit));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * limit;
  const visibleRows = filtered.slice(startIndex, startIndex + limit);
  const rowSummaries = useMemo(
    () =>
      visibleRows.map((sale, idx) =>
        createRowSummary(sale, `${startIndex + idx + 1}`),
      ),
    [startIndex, visibleRows],
  );
  const visibleOptionalColumns = useMemo(
    () =>
      OPTIONAL_COLUMN_DEFINITIONS.filter((column) =>
        visibleOptionalColumnIds.includes(column.id),
      ),
    [visibleOptionalColumnIds],
  );
  const startRecord = count === 0 ? 0 : startIndex + 1;
  const endRecord = Math.min(count, startIndex + visibleRows.length);
  const hasActiveFilters =
    hasAppliedFilters ||
    Boolean(selectedDate || selectedDateFrom || selectedDateTo) ||
    dateFilter !== "all" ||
    trimmedSearchQuery.length > 0;
  const emptyTitle = hasActiveFilters
    ? "No records match the selected filter"
    : "No sales data yet";
  const emptyDescription = hasActiveFilters
    ? "Adjust the active filters or search query to see matching records."
    : "Upload an Excel file to import sales records";
  const tableMotionKey = `${currentPage}-${limit}-${selectedDate}-${selectedDateFrom}-${selectedDateTo}-${dateFilter}-${trimmedSearchQuery}-${filtered.length}`;
  const tableMotionClass = isPageTransitioning
    ? "sales-table-page-exit"
    : "sales-table-page-enter";
  const recordsSummary =
    count === 0
      ? "Viewing 0 of 0 records"
      : `Viewing records ${startRecord}-${endRecord} of ${count}`;
  const activeFilterIndex = Math.max(
    0,
    DATE_FILTERS.findIndex((f) => f.value === dateFilter),
  );
  const activeFilterTabId = `sales-time-filter-tab-${dateFilter}`;
  const timeFilterStyle = {
    "--sales-time-filter-count": DATE_FILTERS.length,
    "--sales-time-filter-index": activeFilterIndex,
  } as CSSProperties;
  const detailColumnSpan = 7 + visibleOptionalColumns.length;

  function startTablePresentationTransition(duration: number) {
    setIsPageTransitioning(true);

    if (tableTransitionTimerRef.current !== null) {
      window.clearTimeout(tableTransitionTimerRef.current);
    }

    tableTransitionTimerRef.current = window.setTimeout(() => {
      setIsPageTransitioning(false);
      tableTransitionTimerRef.current = null;
    }, duration);
  }

  function updateTableQuery(next: { dateFilter?: DateFilter; query?: string }) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));

    if (typeof next.dateFilter !== "undefined") {
      if (next.dateFilter === "all") {
        params.delete("timeFilter");
      } else {
        params.set("timeFilter", next.dateFilter);
      }
    }

    if (typeof next.query !== "undefined") {
      const nextQuery = next.query.trim();
      if (nextQuery) {
        params.set("q", nextQuery);
      } else {
        params.delete("q");
      }
    }

    params.set("page", "1");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleTimeFilterChange(nextDateFilter: DateFilter) {
    if (nextDateFilter === dateFilter) {
      return;
    }

    startTablePresentationTransition(220);
    updateTableQuery({ dateFilter: nextDateFilter });
  }

  function handleTimeFilterKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    const lastIndex = DATE_FILTERS.length - 1;
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = lastIndex;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    timeFilterButtonRefs.current[nextIndex]?.focus();
    handleTimeFilterChange(DATE_FILTERS[nextIndex].value);
  }

  function handlePageChangeStart() {
    startTablePresentationTransition(240);
  }

  function toggleRow(rowId: string) {
    if (rowCollapseTimerRef.current !== null) {
      window.clearTimeout(rowCollapseTimerRef.current);
      rowCollapseTimerRef.current = null;
    }

    if (expandedRowId === rowId) {
      setExpandedRowId(null);
      setCollapsingRowId(rowId);
      rowCollapseTimerRef.current = window.setTimeout(() => {
        setCollapsingRowId(null);
        rowCollapseTimerRef.current = null;
      }, 220);
      return;
    }

    setCollapsingRowId(null);
    setExpandedRowId(rowId);
  }

  function handleRowKeyDown(
    event: KeyboardEvent<HTMLTableRowElement>,
    rowId: string,
  ) {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    toggleRow(rowId);
  }

  function handleOptionalColumnToggle(
    columnId: OptionalColumnId,
    checked: boolean,
  ) {
    setVisibleOptionalColumnIds((currentColumns) => {
      const nextColumns = checked
        ? Array.from(new Set([...currentColumns, columnId]))
        : currentColumns.filter((id) => id !== columnId);

      persistOptionalColumns(nextColumns);
      return nextColumns;
    });
  }

  function handleResetColumns() {
    setVisibleOptionalColumnIds([]);
    persistOptionalColumns([]);
  }

  async function handleCopyId(
    summary: RowSummary,
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation();
    if (!summary.copyId || summary.copyId === "-") return;

    try {
      await navigator.clipboard.writeText(summary.copyId);
      setCopiedRowId(summary.rowId);

      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current);
      }

      copiedTimerRef.current = window.setTimeout(() => {
        setCopiedRowId(null);
        copiedTimerRef.current = null;
      }, 1600);
    } catch {
      setCopiedRowId(null);
    }
  }

  return (
    <section className="sales-page-enter sales-page-enter-delay-2 overflow-hidden rounded-2xl border border-[#E5E8EF] bg-white shadow-none">
      <div className="flex flex-col gap-4 px-4 py-5 sm:px-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-[#182033]">
            Sales Records
          </h2>
          <p
            key={recordsSummary}
            className="sales-record-count-refresh mt-1 text-xs font-medium text-[#667085]"
          >
            {recordsSummary}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <div className="relative min-w-0 sm:w-[280px]">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
            <input
              value={searchQuery}
              onChange={(event) =>
                updateTableQuery({ query: event.target.value })
              }
              placeholder="Search sales..."
              className="h-10 w-full rounded-[10px] border border-[#DDE3EE] bg-[#F9FAFB] pr-3 pl-9 text-sm font-medium text-[#182033] transition-colors outline-none placeholder:text-[#98A2B3] focus:border-[#C9A44C] focus:ring-[3px] focus:ring-[#C9A44C]/10"
            />
          </div>

          <ColumnSelector
            visibleOptionalColumnIds={visibleOptionalColumnIds}
            onToggleColumn={handleOptionalColumnToggle}
            onResetColumns={handleResetColumns}
          />
        </div>
      </div>

      <div className="border-t border-[#EEF1F6] px-4 py-3 sm:px-5">
        <div className="sales-time-filter-scroll max-w-full overflow-x-auto overscroll-x-contain">
          <div
            role="tablist"
            aria-label="Sales time range"
            className="sales-time-filter-tablist relative inline-grid h-11 min-w-[520px] grid-cols-5 items-center overflow-hidden rounded-[13px] border border-[#E7EAF0] bg-[#F5F7FA] p-1 align-top sm:min-w-[540px]"
            style={timeFilterStyle}
          >
            <span className="sales-time-filter-indicator" aria-hidden="true" />

            {DATE_FILTERS.map((f, index) => {
              const isActive = dateFilter === f.value;

              return (
                <button
                  type="button"
                  role="tab"
                  key={f.value}
                  id={`sales-time-filter-tab-${f.value}`}
                  aria-selected={isActive}
                  aria-controls="sales-records-panel"
                  tabIndex={isActive ? 0 : -1}
                  ref={(button) => {
                    timeFilterButtonRefs.current[index] = button;
                  }}
                  onClick={() => handleTimeFilterChange(f.value)}
                  onKeyDown={(event) => handleTimeFilterKeyDown(event, index)}
                  className={`sales-time-filter-tab relative z-10 flex h-full min-w-0 items-center justify-center rounded-[9px] px-3 text-xs font-semibold transition-[background-color,color,transform] duration-[160ms] ease-out outline-none focus-visible:ring-2 focus-visible:ring-[#C9A44C]/30 focus-visible:ring-offset-1 focus-visible:ring-offset-[#F5F7FA] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
                    isActive ? "text-white" : "text-[#344054]"
                  }`}
                >
                  <span className="sales-time-filter-label truncate">
                    {f.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {sales.length === 0 ? (
        <div
          id="sales-records-panel"
          role="tabpanel"
          aria-labelledby={activeFilterTabId}
          aria-busy={isPageTransitioning}
          key={`empty-${tableMotionKey}`}
          className={`sales-table-content ${tableMotionClass} mx-4 mb-5 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#DDE3EE] bg-[#F9FAFB] p-12 text-center sm:mx-5`}
        >
          <Calendar size={36} className="mb-3 text-[#667085]" />
          <p className="text-sm font-semibold text-[#344054]">{emptyTitle}</p>
          <p className="mt-1 text-xs text-[#667085]">{emptyDescription}</p>
        </div>
      ) : rowSummaries.length > 0 ? (
        <div
          id="sales-records-panel"
          role="tabpanel"
          aria-labelledby={activeFilterTabId}
          aria-busy={isPageTransitioning}
          key={tableMotionKey}
          className={`sales-table-content ${tableMotionClass}`}
        >
          <div className="hidden overflow-x-auto md:block">
            <table className="sales-compact-table w-full table-fixed border-t border-[#EEF1F6] text-left text-sm">
              <thead className="bg-[#F9FAFB]">
                <tr>
                  <th className="w-[56px] border-b border-[#EEF1F6] px-4 py-3 text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-[#667085] uppercase">
                    #
                  </th>
                  <th className="border-b border-[#EEF1F6] px-4 py-3 text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-[#667085] uppercase">
                    Customer
                  </th>
                  <th className="border-b border-[#EEF1F6] px-4 py-3 text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-[#667085] uppercase">
                    Order
                  </th>
                  <th className="border-b border-[#EEF1F6] px-4 py-3 text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-[#667085] uppercase">
                    Product
                  </th>
                  <th className="w-[80px] border-b border-[#EEF1F6] px-4 py-3 text-right text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-[#667085] uppercase">
                    Qty
                  </th>
                  <th className="w-[130px] border-b border-[#EEF1F6] px-4 py-3 text-right text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-[#667085] uppercase">
                    Amount
                  </th>
                  {visibleOptionalColumns.map((column) => (
                    <th
                      key={column.id}
                      className="border-b border-[#EEF1F6] px-4 py-3 text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-[#667085] uppercase"
                    >
                      {column.heading}
                    </th>
                  ))}
                  <th className="w-[74px] border-b border-[#EEF1F6] px-4 py-3 text-right text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-[#667085] uppercase">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {rowSummaries.map((summary, idx) => {
                  const rowNumber = startIndex + idx + 1;
                  const isExpanded = expandedRowId === summary.rowId;
                  const isCollapsing = collapsingRowId === summary.rowId;
                  const showDetails = isExpanded || isCollapsing;

                  return (
                    <Fragment key={summary.rowId}>
                      <tr
                        tabIndex={0}
                        aria-expanded={isExpanded}
                        aria-controls={`sales-row-details-${summary.rowId}`}
                        data-expanded={isExpanded}
                        className="sales-record-row sales-table-row-enter border-b border-[#EEF1F6] outline-none last:border-0"
                        style={
                          {
                            "--sales-row-delay": `${Math.min(idx * 20, 140)}ms`,
                          } as CSSProperties
                        }
                        onClick={() => toggleRow(summary.rowId)}
                        onKeyDown={(event) =>
                          handleRowKeyDown(event, summary.rowId)
                        }
                      >
                        <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap text-[#667085]">
                          {rowNumber}
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <span
                            dir="auto"
                            title={summary.customerName}
                            className="block truncate font-semibold text-[#182033]"
                          >
                            {summary.customerName}
                          </span>
                          <SecondaryText mono>
                            {summary.customerCode}
                          </SecondaryText>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <span
                            title={summary.orderNumber}
                            className="block truncate font-semibold text-[#182033]"
                          >
                            {summary.orderNumber}
                          </span>
                          <SecondaryText>{summary.orderDate}</SecondaryText>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <span
                            dir="auto"
                            title={summary.productName}
                            className="block truncate font-semibold text-[#182033]"
                          >
                            {summary.productName}
                          </span>
                          <SecondaryText mono>
                            {summary.productReference}
                          </SecondaryText>
                        </td>
                        <td className="px-4 py-3 text-right align-middle font-mono text-sm font-semibold text-[#182033] tabular-nums">
                          {summary.quantity}
                        </td>
                        <td className="px-4 py-3 text-right align-middle text-sm font-bold whitespace-nowrap text-[#182033] tabular-nums">
                          {summary.amount}
                        </td>
                        {visibleOptionalColumns.map((column) => {
                          const value = column.getValue(summary);

                          return (
                            <td
                              key={column.id}
                              className="px-4 py-3 align-middle"
                            >
                              <span
                                title={value}
                                className={cn(
                                  "block truncate text-xs font-semibold text-[#344054]",
                                  column.mono && "font-mono text-[11px]",
                                )}
                              >
                                {value || "-"}
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-right align-middle">
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            aria-controls={`sales-row-details-${summary.rowId}`}
                            aria-label={`${isExpanded ? "Collapse" : "Expand"} sales row ${rowNumber}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleRow(summary.rowId);
                            }}
                            className="sales-row-chevron-button inline-flex size-8 items-center justify-center rounded-[9px] text-[#667085] transition-[background-color,color,transform] duration-[170ms] hover:bg-[#FBF7EA] hover:text-[#8A6515] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20 focus-visible:outline-none"
                          >
                            <ChevronRight
                              className="sales-row-chevron size-4"
                              aria-hidden="true"
                            />
                          </button>
                        </td>
                      </tr>
                      {showDetails && (
                        <tr
                          id={`sales-row-details-${summary.rowId}`}
                          className="sales-row-details-row"
                        >
                          <td colSpan={detailColumnSpan} className="px-4 py-0">
                            <div className="sales-row-details-shell py-3">
                              <SalesRowDetails
                                summary={summary}
                                isCollapsing={isCollapsing}
                                copiedRowId={copiedRowId}
                                onCopyId={handleCopyId}
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 border-t border-[#EEF1F6] p-4 md:hidden">
            {rowSummaries.map((summary, idx) => {
              const rowNumber = startIndex + idx + 1;
              const isExpanded = expandedRowId === summary.rowId;
              const isCollapsing = collapsingRowId === summary.rowId;
              const showDetails = isExpanded || isCollapsing;

              return (
                <article
                  key={summary.rowId}
                  className={cn(
                    "sales-mobile-record rounded-[14px] border border-[#E5E8EF] bg-white",
                    isExpanded && "sales-mobile-record-expanded",
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={`sales-mobile-row-details-${summary.rowId}`}
                    onClick={() => toggleRow(summary.rowId)}
                    className="w-full p-4 text-left focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20 focus-visible:outline-none"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#182033]">
                          {summary.orderNumber}
                        </p>
                        <p className="mt-1 text-xs font-medium text-[#667085]">
                          #{rowNumber} - {summary.orderDate}
                        </p>
                      </div>
                      <ChevronRight
                        className="sales-row-chevron mt-0.5 size-4 shrink-0 text-[#667085]"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="mt-3 min-w-0">
                      <p
                        dir="auto"
                        title={summary.customerName}
                        className="truncate text-sm font-semibold text-[#182033]"
                      >
                        {summary.customerName}
                      </p>
                      <p
                        dir="auto"
                        title={summary.productName}
                        className="mt-2 truncate text-sm font-medium text-[#344054]"
                      >
                        {summary.productName}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-[#667085]">
                        Qty{" "}
                        <span className="font-mono text-sm text-[#182033]">
                          {summary.quantity}
                        </span>
                      </p>
                      <p className="text-sm font-bold text-[#182033]">
                        {summary.amount}
                      </p>
                    </div>
                  </button>

                  {showDetails && (
                    <div
                      id={`sales-mobile-row-details-${summary.rowId}`}
                      className="px-3 pb-3"
                    >
                      <SalesRowDetails
                        summary={summary}
                        isCollapsing={isCollapsing}
                        copiedRowId={copiedRowId}
                        onCopyId={handleCopyId}
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          id="sales-records-panel"
          role="tabpanel"
          aria-labelledby={activeFilterTabId}
          aria-busy={isPageTransitioning}
          key={`filtered-empty-${tableMotionKey}`}
          className={`sales-table-content ${tableMotionClass} border-t border-[#EEF1F6] bg-white p-8 text-center text-sm text-[#667085]`}
        >
          No records match the selected filter.
        </div>
      )}

      <TablePaginationFooter
        page={currentPage}
        limit={limit}
        totalCount={count}
        itemLabel="sales records"
        ariaLabel="Sales pagination"
        onPageChangeStart={handlePageChangeStart}
      />
    </section>
  );
}
