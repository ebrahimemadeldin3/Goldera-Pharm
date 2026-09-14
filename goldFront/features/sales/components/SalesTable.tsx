"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardCopy,
  FileText,
  Info,
  Package,
  Search,
  Settings2,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  amountValue: number | null;
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
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} SAR`;
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
    amountValue: amount,
    sheetName: getFirstValue(sale, ["sheetName"]) || "-",
    externalId: externalId || "-",
    createdAt: formatDateCell(sale.createdAt) || "-",
    updatedAt: formatDateCell(sale.updatedAt) || "-",
    copyId: recordId,
  };
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
          className="sales-column-trigger group inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-[10px] border border-[#DDE3EE] bg-white px-3 text-sm font-semibold text-[#182033] transition-[background-color,border-color,color,transform] duration-[180ms] ease-out hover:-translate-y-px hover:border-[#101D36]/20 hover:bg-[#101D36]/5 hover:text-[#101D36] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto"
          aria-label="Customize sales table columns"
        >
          <Settings2
            className="size-4 text-[#344054] transition-colors duration-[180ms] group-hover:text-[#C9A44C]"
            aria-hidden="true"
          />
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

function DetailLine({
  label,
  value,
  mono = false,
  dir,
}: {
  label: string;
  value: string;
  mono?: boolean;
  dir?: "auto";
}) {
  return (
    <div className="border-gp-border-subtle grid gap-1 border-b px-4 py-3 last:border-b-0 sm:grid-cols-[140px_minmax(0,1fr)]">
      <dt className="text-gp-text-muted text-xs font-semibold">{label}</dt>
      <dd
        className={cn(
          "text-gp-navy-900 min-w-0 text-sm font-medium break-words",
          mono && "font-mono text-xs",
        )}
        dir={dir}
      >
        {value || "-"}
      </dd>
    </div>
  );
}

function SalesRecordDetailsDrawer({
  summary,
  open,
  onOpenChange,
  copiedRowId,
  onCopyValue,
}: {
  summary: RowSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  copiedRowId: string | null;
  onCopyValue: (value: string, copyKey: string) => void;
}) {
  const isZeroAmount = summary?.amountValue === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-gp-surface-page border-gp-border-default shadow-gp-dialog w-full gap-0 p-0 sm:max-w-[560px]"
        overlayClassName="bg-gp-navy-900/35"
      >
        {summary && (
          <>
            <SheetHeader className="border-gp-border-subtle border-b bg-white px-5 py-5">
              <div className="flex min-w-0 items-start gap-3 pr-8">
                <span className="bg-gp-navy-900 text-gp-gold-500 border-gp-gold-300 flex size-12 shrink-0 items-center justify-center rounded-[12px] border shadow-[0_8px_18px_rgba(16,29,54,0.16)]">
                  <ShoppingCart className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-gp-gold-700 mb-1 text-[11px] font-semibold tracking-[0.12em] uppercase">
                    Sales Record
                  </p>
                  <SheetTitle
                    className="text-gp-navy-900 text-xl leading-7 font-semibold"
                    dir="auto"
                  >
                    {summary.orderNumber}
                  </SheetTitle>
                  <SheetDescription className="text-gp-text-muted mt-1 text-sm font-medium">
                    <span className="block truncate" dir="auto">
                      {summary.customerName}
                    </span>
                    <span
                      className={cn(
                        "mt-1 block font-semibold",
                        isZeroAmount
                          ? "text-gp-text-muted"
                          : "text-gp-navy-900",
                      )}
                    >
                      {summary.amount}
                    </span>
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <div className="border-gp-gold-300 bg-gp-gold-50 rounded-[14px] border p-4">
                <p className="text-gp-gold-700 text-[11px] font-semibold tracking-[0.08em] uppercase">
                  Commercial Summary
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gp-text-muted text-xs font-semibold">
                      Quantity
                    </p>
                    <p className="text-gp-navy-900 mt-1 font-mono text-lg font-semibold">
                      {summary.quantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-gp-text-muted text-xs font-semibold">
                      Amount
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-lg font-semibold tabular-nums",
                        isZeroAmount
                          ? "text-gp-text-muted"
                          : "text-gp-navy-900",
                      )}
                    >
                      {summary.amount}
                    </p>
                  </div>
                </div>
              </div>

              <section className="mt-5">
                <h3 className="text-gp-navy-900 flex items-center gap-2 text-sm font-semibold">
                  <FileText className="text-gp-gold-700 size-4" />
                  Order
                </h3>
                <dl className="border-gp-border-subtle mt-3 overflow-hidden rounded-[12px] border bg-white">
                  <DetailLine
                    label="Order ID"
                    value={summary.orderNumber}
                    mono
                  />
                  <DetailLine label="Order date" value={summary.orderDate} />
                  <DetailLine label="Sheet" value={summary.sheetName} />
                </dl>
              </section>

              <section className="mt-5">
                <h3 className="text-gp-navy-900 flex items-center gap-2 text-sm font-semibold">
                  <UserRound className="text-gp-gold-700 size-4" />
                  Customer
                </h3>
                <dl className="border-gp-border-subtle mt-3 overflow-hidden rounded-[12px] border bg-white">
                  <DetailLine
                    label="Customer"
                    value={summary.customerName}
                    dir="auto"
                  />
                  <DetailLine
                    label="Identifier"
                    value={summary.customerCode || "-"}
                    mono
                  />
                </dl>
              </section>

              <section className="mt-5">
                <h3 className="text-gp-navy-900 flex items-center gap-2 text-sm font-semibold">
                  <Package className="text-gp-gold-700 size-4" />
                  Product
                </h3>
                <dl className="border-gp-border-subtle mt-3 overflow-hidden rounded-[12px] border bg-white">
                  <DetailLine
                    label="Product"
                    value={summary.productName}
                    dir="auto"
                  />
                  <DetailLine
                    label="Product ID"
                    value={summary.productId}
                    mono
                  />
                  <DetailLine
                    label="Reference"
                    value={summary.productReference}
                    mono
                  />
                  <DetailLine label="Quantity" value={summary.quantity} mono />
                </dl>
              </section>

              <section className="mt-5">
                <h3 className="text-gp-navy-900 flex items-center gap-2 text-sm font-semibold">
                  <Info className="text-gp-gold-700 size-4" />
                  System Information
                </h3>
                <dl className="border-gp-border-subtle mt-3 overflow-hidden rounded-[12px] border bg-white">
                  <DetailLine
                    label="External ID"
                    value={summary.externalId}
                    mono
                  />
                  <DetailLine label="Record ID" value={summary.copyId} mono />
                  <DetailLine label="Created at" value={summary.createdAt} />
                  <DetailLine label="Updated at" value={summary.updatedAt} />
                </dl>
              </section>
            </div>

            <SheetFooter className="border-gp-border-subtle grid gap-2 border-t bg-white p-4 sm:grid-cols-2">
              <ButtonLikeCopy
                copied={copiedRowId === `${summary.rowId}:order`}
                disabled={!summary.orderNumber || summary.orderNumber === "-"}
                onClick={() =>
                  onCopyValue(summary.orderNumber, `${summary.rowId}:order`)
                }
              >
                Copy Order
              </ButtonLikeCopy>
              <ButtonLikeCopy
                copied={copiedRowId === `${summary.rowId}:record`}
                disabled={!summary.copyId || summary.copyId === "-"}
                onClick={() =>
                  onCopyValue(summary.copyId, `${summary.rowId}:record`)
                }
              >
                Copy ID
              </ButtonLikeCopy>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ButtonLikeCopy({
  children,
  copied,
  disabled,
  onClick,
}: {
  children: string;
  copied: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-gold-50 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] border bg-white px-3 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-[170ms] hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {copied ? (
        <CheckCircle2 className="text-gp-gold-700 size-4" aria-hidden="true" />
      ) : (
        <ClipboardCopy className="text-gp-gold-700 size-4" aria-hidden="true" />
      )}
      {copied ? "Copied" : children}
    </button>
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
  const [selectedSummary, setSelectedSummary] = useState<RowSummary | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState(searchQuery);
  const [visibleOptionalColumnIds, setVisibleOptionalColumnIds] = useState<
    OptionalColumnId[]
  >(getStoredOptionalColumns);
  const tableTransitionTimerRef = useRef<number | null>(null);
  const copiedTimerRef = useRef<number | null>(null);
  const timeFilterButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dateFilter = normalizeSalesDateFilter(selectedTimeFilter);
  const trimmedSearchQuery = searchQuery.trim();

  const startTablePresentationTransition = useCallback((duration: number) => {
    setIsPageTransitioning(true);

    if (tableTransitionTimerRef.current !== null) {
      window.clearTimeout(tableTransitionTimerRef.current);
    }

    tableTransitionTimerRef.current = window.setTimeout(() => {
      setIsPageTransitioning(false);
      tableTransitionTimerRef.current = null;
    }, duration);
  }, []);

  const updateTableQuery = useCallback(
    (next: { dateFilter?: DateFilter; query?: string }) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));

      if (typeof next.dateFilter !== "undefined") {
        params.delete("date");
        params.delete("dateFrom");
        params.delete("dateTo");

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
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchDraft(searchQuery);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (searchDraft.trim() === trimmedSearchQuery) {
      return;
    }

    const timer = window.setTimeout(() => {
      startTablePresentationTransition(180);
      updateTableQuery({ query: searchDraft });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [
    searchDraft,
    startTablePresentationTransition,
    trimmedSearchQuery,
    updateTableQuery,
  ]);

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
  const hasSearch = trimmedSearchQuery.length > 0;
  const noDataAtAll = sales.length === 0 && !hasActiveFilters;
  const emptyTitle = noDataAtAll
    ? "No sales records available."
    : hasSearch
      ? `No sales found for "${trimmedSearchQuery}".`
      : "No sales records match these filters.";
  const emptyDescription = noDataAtAll
    ? "Upload an Excel file to import sales records."
    : hasSearch
      ? "Clear the search or adjust filters to see matching records."
      : "Clear filters or adjust the selected criteria.";
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

  function clearSearch() {
    setSearchDraft("");
    startTablePresentationTransition(180);
    updateTableQuery({ query: "" });
  }

  function clearAllFilters() {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    [
      "repId",
      "date",
      "dateFrom",
      "dateTo",
      "sheetName",
      "timeFilter",
      "q",
    ].forEach((paramName) => params.delete(paramName));
    params.set("page", "1");
    startTablePresentationTransition(180);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function openDetails(summary: RowSummary) {
    setSelectedSummary(summary);
    setDetailsOpen(true);
  }

  function handleRowKeyDown(
    event: KeyboardEvent<HTMLTableRowElement>,
    summary: RowSummary,
  ) {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    openDetails(summary);
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

  async function handleCopyValue(value: string, copyKey: string) {
    if (!value || value === "-") return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedRowId(copyKey);

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
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#344054]" />
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search sales..."
              className="h-10 w-full rounded-[10px] border border-[#DDE3EE] bg-white pr-9 pl-9 text-sm font-medium text-[#182033] transition-colors outline-none placeholder:text-[#98A2B3] focus:border-[#C9A44C] focus:ring-[3px] focus:ring-[#C9A44C]/10"
            />
            {searchDraft && (
              <button
                type="button"
                aria-label="Clear sales search"
                onClick={() => {
                  setSearchDraft("");
                  startTablePresentationTransition(180);
                  updateTableQuery({ query: "" });
                }}
                className="absolute top-1/2 right-2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-[#667085] transition-[background-color,color] duration-[150ms] hover:bg-[#F8F1DC] hover:text-[#9A7426] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/25 focus-visible:outline-none"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            )}
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
          {!noDataAtAll && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {hasSearch && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-gold-50 h-9 rounded-[10px] border bg-white px-3 text-xs font-semibold"
                >
                  Clear search
                </button>
              )}
              <button
                type="button"
                onClick={clearAllFilters}
                className="bg-gp-navy-900 h-9 rounded-[10px] px-3 text-xs font-semibold text-white"
              >
                Clear filters
              </button>
            </div>
          )}
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
                  const isSelected =
                    detailsOpen && selectedSummary?.rowId === summary.rowId;

                  return (
                    <tr
                      key={summary.rowId}
                      tabIndex={0}
                      aria-controls="sales-record-details-drawer"
                      data-expanded={isSelected}
                      className="sales-record-row sales-table-row-enter border-b border-[#EEF1F6] outline-none last:border-0"
                      style={
                        {
                          "--sales-row-delay": `${Math.min(idx * 20, 140)}ms`,
                        } as CSSProperties
                      }
                      onClick={() => openDetails(summary)}
                      onKeyDown={(event) => handleRowKeyDown(event, summary)}
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
                      <td className="px-4 py-3 text-center align-middle font-mono text-sm font-semibold text-[#182033] tabular-nums">
                        {summary.quantity}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 text-right align-middle text-sm font-bold whitespace-nowrap tabular-nums",
                          summary.amountValue === 0
                            ? "text-[#667085]"
                            : "text-[#182033]",
                        )}
                      >
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
                          aria-controls="sales-record-details-drawer"
                          aria-label={`View details for sales row ${rowNumber}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            openDetails(summary);
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
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 border-t border-[#EEF1F6] p-4 md:hidden">
            {rowSummaries.map((summary, idx) => {
              const rowNumber = startIndex + idx + 1;
              const isSelected =
                detailsOpen && selectedSummary?.rowId === summary.rowId;

              return (
                <article
                  key={summary.rowId}
                  className={cn(
                    "sales-mobile-record rounded-[14px] border border-[#E5E8EF] bg-white",
                    isSelected && "sales-mobile-record-expanded",
                  )}
                >
                  <button
                    type="button"
                    aria-controls="sales-record-details-drawer"
                    onClick={() => openDetails(summary)}
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
                      <p
                        className={cn(
                          "text-sm font-bold",
                          summary.amountValue === 0
                            ? "text-[#667085]"
                            : "text-[#182033]",
                        )}
                      >
                        {summary.amount}
                      </p>
                    </div>
                    <div className="mt-4">
                      <span className="bg-gp-navy-900 inline-flex h-9 items-center justify-center gap-2 rounded-[10px] px-3 text-xs font-semibold text-white">
                        View Details
                        <ChevronRight
                          className="text-gp-gold-500 size-3.5"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </button>
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
          <Calendar size={32} className="mx-auto mb-3 text-[#667085]" />
          <p className="text-sm font-semibold text-[#344054]">{emptyTitle}</p>
          <p className="mt-1 text-xs text-[#667085]">{emptyDescription}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {hasSearch && (
              <button
                type="button"
                onClick={clearSearch}
                className="border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-gold-50 h-9 rounded-[10px] border bg-white px-3 text-xs font-semibold"
              >
                Clear search
              </button>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="bg-gp-navy-900 h-9 rounded-[10px] px-3 text-xs font-semibold text-white"
            >
              Clear filters
            </button>
          </div>
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
      <SalesRecordDetailsDrawer
        summary={selectedSummary}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        copiedRowId={copiedRowId}
        onCopyValue={handleCopyValue}
      />
    </section>
  );
}
