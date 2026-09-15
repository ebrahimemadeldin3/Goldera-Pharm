"use client";

import type { DashboardData } from "./dashboard-types";
import {
  dateKey,
  displayDate,
  finiteNumber,
  money,
  saleDate,
  type DashboardSummary,
} from "./dashboard-utils";
import {
  DataTableCard,
  EmptyState,
  LocalError,
  StatusBadge,
} from "./DashboardPrimitives";
import styles from "./manager-dashboard.module.css";

export function DashboardTables({
  data,
  summary,
  periodLabel,
  retry,
  pending,
}: {
  data: DashboardData;
  summary: DashboardSummary;
  periodLabel: string;
  retry: () => void;
  pending: boolean;
}) {
  const members = new Map(
    data.team.data.map((member) => [member.id, member.name]),
  );
  const sales = summary.recentSales.map((sale) => {
    const amount = finiteNumber(sale.untaxedTotal);
    const qty = finiteNumber(sale.qtyOrdered);
    return {
      id: sale.id,
      customer: sale.customer || "Customer unavailable",
      product: sale.product?.name || sale.productId || "Product unavailable",
      qty: qty === null ? "Not available" : qty.toLocaleString(),
      amount: amount === null ? "Not available" : money(amount),
      date: displayDate(saleDate(sale)),
    };
  });
  const visits = summary.upcoming.map((visit) => ({
    id: visit.id,
    doctor:
      visit.doctor?.nameEN ||
      visit.doctor?.nameAR ||
      visit.doctor?.name ||
      "Doctor unavailable",
    rep: members.get(visit.medicalRepId || visit.userId) || "Rep unavailable",
    date:
      dateKey(visit.date) === dateKey(data.asOf)
        ? "Today"
        : displayDate(visit.date),
    time: visit.time || "Time unavailable",
    status: visit.status,
  }));
  return (
    <section
      aria-label="Recent and upcoming activity"
      className="grid gap-6 xl:grid-cols-2"
    >
      <DataTableCard
        title="Recent Sales"
        subtitle={`${periodLabel} / Latest 6 records`}
        href="/manager/sales"
      >
        {data.sales.error ? (
          <div className="px-5">
            <LocalError name="sales" retry={retry} pending={pending} />
          </div>
        ) : !sales.length ? (
          <EmptyState>No sales in this period.</EmptyState>
        ) : (
          <>
            <div className="hidden md:block">
              <table className={styles.table}>
                <caption className="sr-only">
                  Recent sales, {periodLabel}, amounts in SAR excluding tax
                </caption>
                <colgroup>
                  <col style={{ width: "24%" }} />
                  <col style={{ width: "23%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "24%" }} />
                  <col style={{ width: "20%" }} />
                </colgroup>
                <thead>
                  <tr>
                    {["Customer", "Product", "Qty", "Amount", "Date"].map(
                      (label) => (
                        <th key={label} scope="col">
                          {label}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="font-medium">{sale.customer}</td>
                      <td>{sale.product}</td>
                      <td className="tabular-nums">{sale.qty}</td>
                      <td className="font-medium tabular-nums">
                        {sale.amount}
                      </td>
                      <td className="text-[#667085]">{sale.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-[#EEF1F5] md:hidden">
              {sales.map((sale) => (
                <li key={sale.id} className="space-y-2 px-5 py-4 text-sm">
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="min-w-0 font-semibold break-words">
                      {sale.customer}
                    </p>
                    <p className="font-semibold tabular-nums">{sale.amount}</p>
                  </div>
                  <p className="break-words text-[#667085]">{sale.product}</p>
                  <div className="flex flex-wrap justify-between gap-2 text-xs text-[#667085]">
                    <span>Qty: {sale.qty}</span>
                    <span>{sale.date}</span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </DataTableCard>
      <DataTableCard
        title="Upcoming Visits"
        subtitle="Current / Today onward / Saudi time"
        href="/manager/visits"
      >
        {data.visits.error ? (
          <div className="px-5">
            <LocalError name="visits" retry={retry} pending={pending} />
          </div>
        ) : !visits.length ? (
          <EmptyState>No upcoming visits scheduled.</EmptyState>
        ) : (
          <>
            <div className="hidden md:block">
              <table className={styles.table}>
                <caption className="sr-only">
                  Current upcoming visits independent of the reporting period
                </caption>
                <colgroup>
                  <col style={{ width: "26%" }} />
                  <col style={{ width: "23%" }} />
                  <col style={{ width: "27%" }} />
                  <col style={{ width: "24%" }} />
                </colgroup>
                <thead>
                  <tr>
                    {["Doctor", "Representative", "Date / time", "Status"].map(
                      (label) => (
                        <th key={label} scope="col">
                          {label}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {visits.map((visit) => (
                    <tr key={visit.id}>
                      <td className="font-medium">{visit.doctor}</td>
                      <td>{visit.rep}</td>
                      <td>
                        <span className="block">{visit.date}</span>
                        <span className="text-xs text-[#667085]">
                          {visit.time}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={visit.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-[#EEF1F5] md:hidden">
              {visits.map((visit) => (
                <li key={visit.id} className="space-y-2 px-5 py-4 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 font-semibold break-words">
                      {visit.doctor}
                    </p>
                    <StatusBadge status={visit.status} />
                  </div>
                  <p className="break-words text-[#667085]">{visit.rep}</p>
                  <p className="text-xs text-[#667085]">
                    {visit.date} / {visit.time}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </DataTableCard>
    </section>
  );
}
