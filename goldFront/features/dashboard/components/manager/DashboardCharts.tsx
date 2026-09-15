"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { money, type DashboardSummary } from "./dashboard-utils";
import { EmptyState } from "./DashboardPrimitives";
import styles from "./manager-dashboard.module.css";

const tooltipStyle = {
  background: "#FFFFFF",
  border: "1px solid #E5E8EF",
  borderRadius: 8,
  boxShadow: "0 4px 12px rgba(16,29,54,.08)",
  color: "#101D36",
  fontSize: 12,
};
const axisStyle = { fill: "#667085", fontSize: 11 };

export function SalesTrendChart({ data }: { data: DashboardSummary["trend"] }) {
  if (!data.length)
    return <EmptyState>No dated sales with amounts in this period.</EmptyState>;
  return (
    <>
      <div className={styles.plot} aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart
            data={data}
            margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
          >
            <CartesianGrid stroke="#EEF1F5" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={axisStyle}
              minTickGap={32}
              tickMargin={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={axisStyle}
              width={56}
              tickFormatter={(value: number) =>
                new Intl.NumberFormat("en", { notation: "compact" }).format(
                  value,
                )
              }
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: "#667085" }}
              formatter={(value: number) => [money(value), "Sales"]}
              labelFormatter={(_, payload) => payload[0]?.payload?.key ?? ""}
            />
            <Line
              dataKey="amount"
              type="linear"
              stroke="#C9A44C"
              strokeWidth={2.5}
              dot={data.length === 1 ? { r: 4 } : false}
              activeDot={{
                r: 4,
                fill: "#101D36",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>
          Sales trend in Saudi riyals, excluding missing dates and amounts
        </caption>
        <thead>
          <tr>
            <th>Period</th>
            <th>Sales</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
            <tr key={entry.key}>
              <th>{entry.key}</th>
              <td>{money(entry.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function VisitStatusChart({
  statuses,
}: {
  statuses: DashboardSummary["statuses"];
}) {
  const total = statuses.reduce((sum, item) => sum + item.count, 0);
  if (!total) return <EmptyState>No visits in this period.</EmptyState>;
  return (
    <div className="grid flex-1 items-center gap-4 min-[480px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="relative h-52 min-w-0" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={statuses.filter((item) => item.count > 0)}
              dataKey="count"
              nameKey="label"
              innerRadius="68%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="#FFFFFF"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {statuses
                .filter((item) => item.count > 0)
                .map((item) => (
                  <Cell key={item.value} fill={item.color} />
                ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] text-[#667085]">TOTAL</span>
          <span className="text-[28px] font-semibold tabular-nums">
            {total.toLocaleString()}
          </span>
          <span className="text-xs text-[#667085]">visits</span>
        </div>
      </div>
      <ul aria-label={`${total} visits by status`} className="space-y-4">
        {statuses.map((item) => (
          <li
            key={item.value}
            className="flex items-center justify-between gap-2 text-xs"
          >
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full"
                style={{ background: item.color }}
              />
              {item.label}
            </span>
            <span className="shrink-0 tabular-nums">
              <strong className="font-semibold">
                {item.count.toLocaleString()}
              </strong>
              <span className="ml-2 text-[#667085]">
                {((item.count / total) * 100).toFixed(0)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RepPerformanceChart({
  ranking,
}: {
  ranking: DashboardSummary["ranking"];
}) {
  if (!ranking.length)
    return (
      <EmptyState>
        No completed visits assigned to known representatives in this period.
      </EmptyState>
    );
  return (
    <ol
      className="flex min-h-56 flex-col justify-center gap-4"
      aria-label="Representatives ranked by completed visits"
    >
      {ranking.map((rep, index) => (
        <li
          key={rep.id}
          className="grid grid-cols-[20px_minmax(0,1fr)_32px] items-center gap-3"
        >
          <span className="text-xs text-[#8A94A6]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <span className="mb-1.5 block text-sm font-medium break-words">
              {rep.name}
            </span>
            <div
              aria-hidden="true"
              className="h-1.5 overflow-hidden rounded-sm bg-[#EEF1F5]"
            >
              <div
                className="h-full rounded-sm bg-[#243A5B]"
                style={{ width: `${(rep.count / ranking[0].count) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-right text-sm font-semibold tabular-nums">
            {rep.count}
            <span className="sr-only"> completed visits</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function QualityDistributionChart({
  quality,
}: {
  quality: NonNullable<DashboardSummary["quality"]>;
}) {
  return (
    <>
      <div className={styles.plot} aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            data={quality.distribution}
            layout="vertical"
            margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
          >
            <CartesianGrid stroke="#EEF1F5" horizontal={false} />
            <XAxis
              type="number"
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={axisStyle}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={100}
              axisLine={false}
              tickLine={false}
              tick={axisStyle}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: "#F6F8FB" }}
              formatter={(value: number) => [value, "Reviews"]}
            />
            <Bar
              dataKey="count"
              fill="#243A5B"
              barSize={18}
              radius={[0, 3, 3, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="sr-only" aria-label="Quality review distribution">
        {quality.distribution.map((entry) => (
          <li key={entry.label}>
            {entry.label}: {entry.count} reviews
          </li>
        ))}
      </ul>
    </>
  );
}
