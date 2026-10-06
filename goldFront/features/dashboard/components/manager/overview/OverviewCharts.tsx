"use client";
import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SalesOverview, VisitOverview } from "./types";
import { displayDay, money, number } from "./format";
import { OverviewEmpty } from "./OverviewPrimitives";
import styles from "./overview.module.css";

const colors = {
  COMPLETED: "#398567",
  SCHEDULED: "#C9A44C",
  CANCELLED: "#C35A53",
};
const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #E5E8EF",
  borderRadius: 10,
  fontSize: 12,
  boxShadow: "0 6px 20px #101d3610",
};
export function OverviewSalesChart({
  data,
  bucket,
}: {
  data: SalesOverview;
  bucket: "day" | "month";
}) {
  const label = (value: string, short = false) =>
    bucket === "month"
      ? new Intl.DateTimeFormat("en-GB", {
          month: "short",
          year: "numeric",
          timeZone: "Asia/Riyadh",
        }).format(new Date(`${value}T12:00:00+03:00`))
      : displayDay(value, short);
  const chartId = useId();
  if (!data.records)
    return (
      <OverviewEmpty title="No sales in this period">
        Choose another date range or upload sales records.
      </OverviewEmpty>
    );
  return (
    <>
      <div
        className={styles.chart}
        role="img"
        aria-label={`Sales trend. Total ${money(data.total)} from ${data.records} ledger records.`}
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart
            data={data.trend}
            margin={{ top: 12, right: 10, left: -8, bottom: 0 }}
          >
            <defs>
              <linearGradient id={chartId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C9A44C" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#C9A44C" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#EDF0F5" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => label(value, true)}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#667085" }}
              minTickGap={30}
            />
            <YAxis
              tickFormatter={(value) =>
                new Intl.NumberFormat("en-SA", { notation: "compact" }).format(
                  value,
                )
              }
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#667085" }}
              width={52}
            />
            <Tooltip
              labelFormatter={(value) => label(String(value))}
              formatter={(value) => [money(Number(value)), "Sales"]}
              contentStyle={tooltipStyle}
            />
            <Area
              type="linear"
              dataKey="amount"
              stroke="#B18732"
              strokeWidth={2.5}
              fill={`url(#${chartId})`}
              isAnimationActive={false}
              dot={false}
              activeDot={{
                r: 4,
                fill: "#101D36",
                stroke: "white",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <details className={styles.chartData}>
        <summary>View chart data</summary>
        <div className={styles.tableScroll}>
          <table>
            <caption className="sr-only">
              Sales trend amounts in Saudi riyals excluding tax
            </caption>
            <thead>
              <tr>
                <th>Date</th>
                <th>Sales</th>
              </tr>
            </thead>
            <tbody>
              {data.trend.map((row) => (
                <tr key={row.date}>
                  <td>{label(row.date)}</td>
                  <td>{money(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
export function OverviewVisitsChart({ data }: { data: VisitOverview }) {
  if (!data.total)
    return (
      <OverviewEmpty title="No visits in this period">
        Scheduled and completed visits will appear here.
      </OverviewEmpty>
    );
  const slices = data.statuses.map((row) => ({
    ...row,
    color: colors[row.status as keyof typeof colors] || "#8A94A6",
  }));
  return (
    <div className={styles.visitChart}>
      <div
        className={styles.donut}
        role="img"
        aria-label={`${data.completed} completed, ${data.scheduled} scheduled, ${data.cancelled} cancelled visits.`}
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={slices}
              dataKey="count"
              nameKey="status"
              innerRadius="65%"
              outerRadius="90%"
              stroke="white"
              strokeWidth={3}
              paddingAngle={2}
              isAnimationActive={false}
            >
              {slices.map((row) => (
                <Cell key={row.status} fill={row.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [number(Number(value)), "Visits"]}
              contentStyle={tooltipStyle}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className={styles.donutCenter}>
          <strong>{number(data.total)}</strong>
          <span>total visits</span>
        </div>
      </div>
      <ul className={styles.legend}>
        {slices.map((row) => (
          <li key={row.status}>
            <span className={styles.legendLabel}>
              <i style={{ background: row.color }} aria-hidden="true" />
              {row.status.toLowerCase()}
            </span>
            <strong>{number(row.count)}</strong>
            <span>{((row.count / data.total) * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
