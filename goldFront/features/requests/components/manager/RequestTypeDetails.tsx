"use client";

import type { ReactNode } from "react";
import {
  Briefcase,
  CalendarDays,
  DollarSign,
  Layers,
  Megaphone,
  Package,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { TRequest } from "@/features/requests/lib/types";
import {
  formatDate,
  formatMoney,
  renderValue,
  shortId,
} from "./requests-workflow-utils";

type RequestTypeDetailsProps = {
  request: TRequest;
};

function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="requests-detail-tile border-gp-border-subtle min-w-0 rounded-[10px] border bg-white px-3 py-2.5">
      <p className="text-gp-text-placeholder text-[11px] leading-4 font-semibold tracking-[0.04em] uppercase">
        {label}
      </p>
      <p className="text-gp-navy-900 mt-1 text-sm leading-5 font-semibold">
        {children}
      </p>
    </div>
  );
}

function PanelHead({ icon, title }: { icon: LucideIcon; title: string }) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-2">
      <Icon
        className="requests-section-head-icon text-gp-gold-600 size-3.5"
        aria-hidden="true"
      />
      <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.06em] uppercase">
        {title}
      </p>
    </div>
  );
}

function PanelShell({ children }: { children: ReactNode }) {
  return (
    <div className="requests-detail-panel border-gp-border-subtle bg-gp-surface-subtle mt-3 rounded-[12px] border p-4">
      {children}
    </div>
  );
}

function NeutralEmpty({ text }: { text: string }) {
  return (
    <p className="text-gp-text-placeholder py-1 text-sm font-medium italic">
      {text}
    </p>
  );
}

export function RequestTypeDetails({ request }: RequestTypeDetailsProps) {
  if (request.type === "LEAVE") {
    const days =
      request.leaveDaysCount !== null && request.leaveDaysCount !== undefined
        ? `${request.leaveDaysCount} ${request.leaveDaysCount === 1 ? "day" : "days"}`
        : null;
    return (
      <section>
        <PanelHead icon={CalendarDays} title="Leave Details" />
        <PanelShell>
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            <DetailField label="Type">
              {renderValue(request.leaveType)}
            </DetailField>
            <DetailField label="Start Date">
              {formatDate(request.leaveStartDate)}
            </DetailField>
            <DetailField label="End Date">
              {formatDate(request.leaveEndDate)}
            </DetailField>
            <DetailField label="Duration">{days ?? "Not provided"}</DetailField>
          </dl>
        </PanelShell>
      </section>
    );
  }

  if (request.type === "EXPENSE" || request.type === "MARKETING") {
    const doctors = request.doctors ?? [];
    const doctorIds = request.doctorIds ?? [];
    return (
      <section>
        <PanelHead
          icon={request.type === "MARKETING" ? Megaphone : DollarSign}
          title={
            request.type === "MARKETING"
              ? "Marketing Details"
              : "Expense Details"
          }
        />
        <PanelShell>
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <DetailField label="Budget">
              {formatMoney(request.budget)}
            </DetailField>
            <DetailField label="Doctors Count">{doctors.length}</DetailField>
            <DetailField label="Doctor Name(s)">
              {renderValue(request.doctorName)}
            </DetailField>
            <DetailField label="Doctor IDs">
              {doctorIds.length > 0 ? (
                <span className="block truncate font-mono text-xs">
                  {doctorIds.map(shortId).join(", ")}
                </span>
              ) : (
                "Not provided"
              )}
            </DetailField>
          </dl>
          <div className="mt-5">
            <p className="text-gp-text-placeholder text-[11px] leading-4 font-semibold tracking-[0.04em] uppercase">
              Doctors
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {doctors.length === 0 ? (
                <NeutralEmpty text="No doctors specified." />
              ) : (
                doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="requests-detail-row bg-gp-surface-card border-gp-border-control flex flex-col gap-2 rounded-[10px] border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-sm leading-5">
                      <p className="text-gp-navy-900 font-semibold">
                        {renderValue(doctor.nameEN || doctor.nameAR)}
                      </p>
                      {doctor.nameEN && doctor.nameAR && (
                        <p className="text-gp-text-muted font-medium" dir="rtl">
                          {doctor.nameAR}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/manager/doctors/${doctor.id}`}
                      className="text-gp-gold-700 hover:text-gp-navy-900 inline-flex min-w-0 items-center gap-1 font-mono text-xs font-semibold transition-colors duration-[170ms] hover:underline"
                    >
                      {shortId(doctor.id)}
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </PanelShell>
      </section>
    );
  }

  if (request.type === "SAMPLE") {
    const items = request.sampleData ?? [];
    return (
      <section>
        <PanelHead icon={Layers} title="Sample Details" />
        <PanelShell>
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            <DetailField label="Products requested">{items.length}</DetailField>
          </dl>
          <div className="mt-5">
            <p className="text-gp-text-placeholder text-[11px] leading-4 font-semibold tracking-[0.04em] uppercase">
              Products
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {items.length === 0 ? (
                <NeutralEmpty text="No products listed for this request." />
              ) : (
                items.map((item, index) => (
                  <div
                    key={`${item.productId}-${index}`}
                    className="requests-detail-row bg-gp-surface-card border-gp-border-control flex flex-col gap-3 rounded-[10px] border p-3 sm:flex-row sm:items-center"
                  >
                    <span className="bg-gp-navy-900/[0.04] text-gp-gold-700 border-gp-navy-900/10 flex size-9 shrink-0 items-center justify-center rounded-[9px] border">
                      <Package className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-gp-navy-900 truncate text-sm font-semibold"
                        dir="auto"
                      >
                        {renderValue(item.productName)}
                      </p>
                      <p className="text-gp-text-placeholder mt-1 truncate text-xs font-medium">
                        Product ID{" "}
                        <span className="font-mono font-semibold">
                          {shortId(item.productId)}
                        </span>
                      </p>
                    </div>
                    <p className="border-gp-border-subtle bg-gp-surface-subtle text-gp-text-secondary inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-xs font-semibold">
                      Qty{" "}
                      <span className="text-gp-navy-900">
                        {renderValue(item.amount)}
                      </span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </PanelShell>
      </section>
    );
  }

  if (request.type === "PERSONAL_EXPENSE") {
    const items = request.totalExpenseData ?? [];
    return (
      <section>
        <PanelHead icon={Briefcase} title="Personal Expense Details" />
        <PanelShell>
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <DetailField label="Visited City">
              {renderValue(request.visitedCity)}
            </DetailField>
            <DetailField label="Visit Days">
              {renderValue(request.visitDaysCount)}
            </DetailField>
            <DetailField label="Total Expense">
              {formatMoney(request.totalExpenseAmount)}
            </DetailField>
            <DetailField label="Items Count">{items.length}</DetailField>
          </dl>
          <div className="mt-5">
            <p className="text-gp-text-placeholder text-[11px] leading-4 font-semibold tracking-[0.04em] uppercase">
              Expense Items
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {items.length === 0 ? (
                <NeutralEmpty text="No expense items provided." />
              ) : (
                items.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="requests-detail-row bg-gp-surface-card border-gp-border-control flex items-center justify-between gap-3 rounded-[10px] border p-3"
                  >
                    <p className="text-gp-navy-900 min-w-0 truncate text-sm font-semibold">
                      {renderValue(item.name)}
                    </p>
                    <p className="text-gp-text-secondary shrink-0 text-sm font-semibold">
                      {formatMoney(Number(item.amount))}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </PanelShell>
      </section>
    );
  }

  return null;
}
