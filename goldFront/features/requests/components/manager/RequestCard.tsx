"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { CalendarDays, ChevronDown, User2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TRequest } from "@/features/requests/lib/types";
import {
  formatDate,
  isBlank,
  requestTypeMeta,
  renderValue,
  statusAccentTone,
  statusBadgeTone,
  statusDotTone,
  urgencyBadgeTone,
  urgencyDotTone,
} from "./requests-workflow-utils";
import { RequestMetadata } from "./RequestMetadata";
import { RequestTypeDetails } from "./RequestTypeDetails";
import { RequestAttachments } from "./RequestAttachments";
import { RequestStatusPanel } from "./RequestStatusPanel";
import { RequestActions } from "./RequestActions";

type RequestCardProps = {
  request: TRequest;
  animationIndex?: number;
};

export default function RequestCard({
  request,
  animationIndex = 0,
}: RequestCardProps) {
  const [open, setOpen] = useState(false);
  const typeMeta = requestTypeMeta[request.type];
  const TypeIcon = typeMeta.icon;
  const displayTitle = isBlank(request.title) ? request.subject : request.title;

  return (
    <Card
      className="requests-card requests-card-reveal border-gp-border-default bg-gp-surface-card shadow-gp-card group/card relative gap-0 overflow-hidden rounded-[14px] border py-0"
      style={
        {
          "--requests-card-delay": `${animationIndex * 60}ms`,
        } as CSSProperties
      }
    >
      <span
        className={cn(
          "requests-card-status-rail absolute top-4 bottom-4 left-0 z-10 w-[2px] rounded-r-full opacity-55",
          statusAccentTone[request.status],
        )}
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={`request-inspector-${request.id}`}
        aria-label={`${open ? "Collapse" : "Expand"} ${renderValue(displayTitle)}`}
        className="requests-card-trigger focus-visible:ring-gp-gold-500/25 relative flex w-full cursor-pointer items-start gap-3.5 p-4 text-left focus-visible:ring-3 focus-visible:outline-none sm:p-5"
      >
        <span className="requests-type-icon-shell bg-gp-navy-900 text-gp-gold-500 ring-gp-gold-500/20 flex size-10 shrink-0 items-center justify-center rounded-[10px] shadow-[0_4px_10px_rgba(16,29,54,0.14)] ring-1 ring-inset">
          <TypeIcon className="size-5" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-gp-navy-900 truncate text-base leading-6 font-semibold">
                {renderValue(displayTitle)}
              </h3>
              <p className="text-gp-text-muted mt-0.5 truncate text-sm leading-5 font-medium">
                {typeMeta.description}
              </p>
            </div>

            <span className="flex shrink-0 items-center gap-2 max-sm:flex-col max-sm:items-end">
              <span
                className={cn(
                  "requests-badge requests-status-badge inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] leading-4 font-semibold tracking-[0.02em] uppercase",
                  statusBadgeTone[request.status],
                )}
                aria-label={`Request status ${request.status.toLowerCase()}`}
              >
                <span
                  className={cn(
                    "requests-status-dot size-1.5 rounded-full",
                    statusDotTone[request.status],
                  )}
                  aria-hidden="true"
                />
                {request.status}
              </span>
              <span
                className={cn(
                  "requests-expand-button text-gp-text-muted border-gp-border-control flex size-8 shrink-0 items-center justify-center rounded-[8px] border bg-white",
                  open && "is-open",
                )}
                aria-hidden="true"
              >
                <ChevronDown
                  className={cn("requests-chevron size-4", open && "is-open")}
                />
              </span>
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="requests-badge border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs leading-4 font-semibold">
              <span
                className="bg-gp-gold-500 size-1 rounded-full"
                aria-hidden="true"
              />
              {typeMeta.label}
            </span>
            <span
              className={cn(
                "requests-badge inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs leading-4 font-semibold",
                urgencyBadgeTone[request.urgency],
              )}
            >
              <span
                className={cn(
                  "size-1 rounded-full",
                  urgencyDotTone[request.urgency],
                )}
                aria-hidden="true"
              />
              {request.urgency}
            </span>
            <span className="text-gp-text-muted inline-flex items-center gap-1 text-xs leading-5 font-medium">
              <CalendarDays
                className="requests-meta-icon size-3.5"
                aria-hidden="true"
              />
              {formatDate(request.submittedDate)}
            </span>
            <span className="text-gp-text-muted inline-flex min-w-0 items-center gap-1 text-xs leading-5 font-medium">
              <User2
                className="requests-meta-icon size-3.5"
                aria-hidden="true"
              />
              <span className="truncate">{request.rep.name}</span>
            </span>
          </div>
        </div>
      </button>

      <div
        id={`request-inspector-${request.id}`}
        className={cn("requests-accordion-panel", open && "is-open")}
        aria-hidden={!open}
      >
        <div className="requests-accordion-inner">
          <div className="requests-accordion-content border-gp-border-subtle flex flex-col gap-5 border-t p-4 sm:p-5">
            <RequestMetadata request={request} />
            <RequestTypeDetails request={request} />
            <RequestAttachments request={request} />
            <RequestStatusPanel request={request} />
            {request.status === "PENDING" && (
              <RequestActions request={request} />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
