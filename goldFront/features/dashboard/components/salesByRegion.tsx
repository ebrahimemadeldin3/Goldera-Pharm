"use client";

import Image from "next/image";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import salesByRegionIcon from "@/features/dashboard/assets/icons/salesByRegion.svg";
import { SalesByRegion as SalesByRegionType } from "@/features/dashboard/lib/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export const description = "Monthly overview of visits and doctor coverage";

const COLORS = ["#2563EB", "#DC2626", "#14B8A6", "#F59E0B"];

const chartConfig = {
  value: {
    label: "Sales",
    color: COLORS[2],
  },
} satisfies Record<string, { label: string; color?: string }>;

interface SalesByRegionProps {
  salesByRegion?: SalesByRegionType;
}

export function SalesByRegion({ salesByRegion }: SalesByRegionProps) {
  // Convert salesByRegion object to chart data array
  const chartData = salesByRegion
    ? Object.entries(salesByRegion).map(([region, value]) => ({
        region,
        value,
      }))
    : [];

  // Calculate max value for Y-axis
  const maxValue =
    chartData.length > 0 ? Math.max(...chartData.map((d) => d.value)) : 200000;
  const yAxisMax = Math.ceil((maxValue * 1.2) / 10000) * 10000; // Add 20% padding and round up

  return (
    <Card className="border-secondary-light h-[467px] w-full min-w-0 rounded-[25px] border bg-white shadow-none">
      <CardHeader className="flex flex-col items-start gap-4">
        <div className="flex items-center gap-6">
          <div className="bg-system-primary flex size-11 items-center justify-center rounded-[15px]">
            <Image
              src={salesByRegionIcon}
              alt="supervisor icon"
              width={24}
              height={24}
            />
          </div>
          <CardTitle className="text-[20px] font-semibold">
            Sales By Region
          </CardTitle>
        </div>
        <CardDescription className="text-secondary-dark text-[17px]">
          Monthly overview of visits and doctor coverage
        </CardDescription>
      </CardHeader>

      <CardContent className="min-w-0 overflow-hidden pt-2">
        {chartData.length === 0 ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-gray-500">
            No sales data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  vertical={false}
                  stroke="#F1F5F9"
                  strokeDasharray="4 4"
                />
                <XAxis
                  dataKey="region"
                  tickLine={false}
                  axisLine={true}
                  tickMargin={12}
                  className="text-sm font-normal text-black"
                />
                <YAxis
                  tickLine={false}
                  axisLine={true}
                  domain={[0, yAxisMax]}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  className="text-sm font-normal text-black"
                />
                <Tooltip
                  content={<ChartTooltipContent hideLabel />}
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                />
                <Bar dataKey="value" radius={1}>
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default SalesByRegion;
