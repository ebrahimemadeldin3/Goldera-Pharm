"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CircleCheckBig, CircleX, ClipboardList, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";
import { cn } from "@/lib/utils";
import type { TRequest } from "@/features/requests/lib/types";
import { RequestsToolbar } from "./RequestsToolbar";
import RequestCard from "./RequestCard";
import type { StatusTabId } from "./requests-workflow-utils";

type RequestsListProps = {
  requestsData: TRequest[];
  page?: number;
  limit?: number;
  totalCount?: number;
};

const emptyStates: Record<
  StatusTabId,
  { icon: LucideIcon; title: string; description: string }
> = {
  all: {
    icon: ClipboardList,
    title: "No requests found",
    description:
      "Submitted requests will appear here once your team creates them.",
  },
  PENDING: {
    icon: Clock,
    title: "No pending requests",
    description:
      "Every request has been reviewed — nothing is awaiting approval.",
  },
  APPROVED: {
    icon: CircleCheckBig,
    title: "No approved requests",
    description: "Approved requests will be listed here.",
  },
  REJECTED: {
    icon: CircleX,
    title: "No rejected requests",
    description: "Rejected requests will be listed here.",
  },
};

export default function RequestsList({
  requestsData,
  page = 1,
  limit = 10,
  totalCount = 0,
}: RequestsListProps) {
  const [status, setStatus] = useState<StatusTabId>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  const counts = useMemo(
    () => ({
      all: requestsData.length,
      PENDING: requestsData.filter((r) => r.status === "PENDING").length,
      APPROVED: requestsData.filter((r) => r.status === "APPROVED").length,
      REJECTED: requestsData.filter((r) => r.status === "REJECTED").length,
    }),
    [requestsData],
  );

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return requestsData.filter((request) => {
      const matchesType =
        typeFilter === "all" ||
        request.type.toLowerCase() === typeFilter.toLowerCase();
      const matchesStatus = status === "all" || request.status === status;
      const searchableValues = [
        request.title,
        request.subject,
        request.description,
        request.type,
        request.status,
        request.rep.name,
      ];
      const matchesSearch =
        query === "" ||
        searchableValues.some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
        );
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [requestsData, status, typeFilter, searchQuery]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsPageTransitioning(false);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [page, limit, status, typeFilter, searchQuery]);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || revealed) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [revealed]);

  const emptyState = emptyStates[status];
  const EmptyIcon = emptyState.icon;

  function resetFilters() {
    setStatus("all");
    setTypeFilter("all");
    setSearchQuery("");
  }

  return (
    <section
      ref={(element) => {
        sectionRef.current = element;
      }}
      aria-label="Requests list"
      className={cn(
        "requests-reveal border-gp-border-default bg-gp-surface-card shadow-gp-card overflow-hidden rounded-[16px] border",
        revealed && "is-revealed",
      )}
    >
      <header className="border-gp-border-subtle border-b px-4 py-4 sm:px-5">
        <RequestsToolbar
          status={status}
          onStatusChange={setStatus}
          counts={counts}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          visibleCount={filteredRequests.length}
          onResetFilters={resetFilters}
        />
      </header>

      <div
        key={`${status}-${typeFilter}-${searchQuery}`}
        id="requests-results-panel"
        role="tabpanel"
        aria-labelledby={`requests-status-tab-${status}`}
        aria-busy={isPageTransitioning}
        className={cn(
          "requests-results-transition p-4 sm:p-5",
          isPageTransitioning && "requests-results-exit",
        )}
      >
        {filteredRequests.length > 0 ? (
          <div className="flex flex-col gap-3.5">
            {filteredRequests.map((request, index) => (
              <RequestCard
                key={request.id}
                request={request}
                animationIndex={index}
              />
            ))}
          </div>
        ) : (
          <div className="requests-empty-state border-gp-border-control bg-gp-surface-subtle rounded-[14px] border border-dashed px-5 py-8 text-center">
            <span className="bg-gp-gold-50 text-gp-gold-700 mx-auto flex size-11 items-center justify-center rounded-full">
              <EmptyIcon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="text-gp-navy-900 mt-3 text-[15px] font-semibold">
              {emptyState.title}
            </h3>
            <p className="text-gp-text-muted mx-auto mt-1 max-w-md text-sm leading-6 font-medium">
              {emptyState.description}
            </p>
          </div>
        )}
      </div>

      <TablePaginationFooter
        page={page}
        limit={limit}
        totalCount={totalCount}
        itemLabel="requests"
        ariaLabel="Requests pagination"
        pageNavAriaLabel="Requests pages"
        tone="navy"
        onPageChangeStart={() => setIsPageTransitioning(true)}
      />
    </section>
  );
}
