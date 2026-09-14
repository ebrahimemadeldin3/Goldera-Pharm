"use client";

import type { ReactNode } from "react";
import {
  CalendarCheck2,
  CalendarClock,
  FileText,
  IdCard,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { TRequest } from "@/features/requests/lib/types";
import { CopyId } from "./CopyId";
import {
  formatDateTime,
  isBlank,
  renderValue,
  shortId,
} from "./requests-workflow-utils";

type RequestMetadataProps = {
  request: TRequest;
};

function InformationItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[104px_minmax(0,1fr)] gap-2 text-[13px] leading-5">
      <dt className="text-gp-text-muted font-medium">{label}</dt>
      <dd className="text-gp-navy-900 min-w-0 font-semibold break-words">
        {children}
      </dd>
    </div>
  );
}

function InformationGroup({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="requests-info-group min-w-0 py-1">
      <h4 className="text-gp-text-muted flex items-center gap-2 text-[11px] font-semibold tracking-[0.06em] uppercase">
        <Icon
          className="requests-section-head-icon text-gp-gold-600 size-3.5"
          aria-hidden="true"
        />
        {title}
      </h4>
      <dl className="mt-2.5 space-y-2">{children}</dl>
    </section>
  );
}

function PanelShell({ children }: { children: ReactNode }) {
  return (
    <div className="requests-detail-panel border-gp-border-subtle bg-gp-surface-subtle rounded-[12px] border p-4">
      {children}
    </div>
  );
}

export function RequestMetadata({ request }: RequestMetadataProps) {
  const repId = request.userId || request.rep.id;
  const handledBy = !isBlank(request.supervisor.name)
    ? request.supervisor.name
    : null;

  return (
    <section className="min-w-0">
      <h4 className="text-gp-text-muted flex items-center gap-2 text-[11px] font-semibold tracking-[0.06em] uppercase">
        <FileText
          className="requests-section-head-icon text-gp-gold-600 size-3.5"
          aria-hidden="true"
        />
        Request Information
      </h4>
      <div className="mt-3">
        <PanelShell>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-0">
            <InformationGroup icon={IdCard} title="Request Info">
              <InformationItem label="Request ID">
                <CopyId
                  value={request.id}
                  displayValue={shortId(request.id)}
                  ariaLabel="Copy request ID"
                />
              </InformationItem>
              <InformationItem label="Submitted">
                {formatDateTime(request.submittedDate)}
              </InformationItem>
              <InformationItem label="Updated">
                {formatDateTime(request.updatedAt)}
              </InformationItem>
            </InformationGroup>

            <InformationGroup icon={UserRound} title="Handling">
              <InformationItem label="Representative">
                <span className="block min-w-0 truncate">
                  {renderValue(request.rep.name)}
                </span>
              </InformationItem>
              <InformationItem label="User ID">
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <Link
                    href={`/manager/team/${repId}`}
                    className="text-gp-navy-900 hover:text-gp-gold-700 min-w-0 truncate font-mono text-xs leading-5 font-semibold transition-colors duration-[170ms] hover:underline"
                    title={repId}
                  >
                    {shortId(repId)}
                  </Link>
                  <CopyId
                    value={repId}
                    displayValue=""
                    ariaLabel="Copy representative ID"
                  />
                </span>
              </InformationItem>
              <InformationItem label="Handled by">
                {handledBy ? (
                  handledBy
                ) : (
                  <span className="text-gp-text-placeholder font-medium">
                    Not provided
                  </span>
                )}
              </InformationItem>
            </InformationGroup>

            <InformationGroup icon={CalendarCheck2} title="Activity">
              <InformationItem label="Response date">
                {formatDateTime(request.reviewedDate)}
              </InformationItem>
              <InformationItem label="Handled at">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock
                    className="text-gp-text-placeholder size-3.5"
                    aria-hidden="true"
                  />
                  {formatDateTime(request.handledAt)}
                </span>
              </InformationItem>
            </InformationGroup>
          </div>
        </PanelShell>
      </div>

      <div className="mt-4">
        <p className="text-gp-text-muted flex items-center gap-2 text-[11px] font-semibold tracking-[0.06em] uppercase">
          <FileText
            className="requests-section-head-icon text-gp-gold-600 size-3.5"
            aria-hidden="true"
          />
          Description
        </p>
        <p className="requests-description-box border-gp-border-subtle bg-gp-surface-subtle text-gp-text-secondary mt-2 rounded-[12px] border px-4 py-3 text-sm leading-6 font-medium break-words whitespace-pre-wrap">
          {isBlank(request.description)
            ? renderValue(request.description)
            : request.description}
        </p>
      </div>
    </section>
  );
}
