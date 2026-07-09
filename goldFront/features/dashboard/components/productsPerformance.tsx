"use client";

import Image from "next/image";
import productsPerformanceIcon from "@/features/dashboard/assets/icons/productsPerformance.svg";
import { ProductPerformance as ProductPerformanceType } from "@/features/dashboard/lib/types";

import { Pie, PieChart, Cell, Tooltip as RechartsTooltip } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A donut chart";

const COLORS = [
  "#DC2626",
  "#14B8A6",
  "#8B5CF6",
  "#2563EB",
  "#F59E0B",
  "#EC4899",
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  a: { label: "A", color: COLORS[0] },
  b: { label: "B", color: COLORS[1] },
} satisfies ChartConfig;

interface ProductsPerformanceProps {
  productPerformance?: ProductPerformanceType;
}

export function ProductsPerformance({
  productPerformance,
}: ProductsPerformanceProps) {
  // Convert productPerformance object to chart data array
  const chartData = productPerformance
    ? Object.entries(productPerformance).map(([name, value], index) => ({
        name,
        value,
        fill: COLORS[index % COLORS.length],
      }))
    : [];
  return (
    <Card className="border-secondary-light rounded-[25px] border bg-white py-6 shadow-none">
      <CardHeader className="flex items-center gap-4">
        <div className="bg-system-primary flex size-11 items-center justify-center rounded-[15px]">
          <Image
            src={productsPerformanceIcon}
            alt="products"
            width={24}
            height={24}
          />
        </div>
        <CardTitle className="text-[20px] font-semibold">
          Products Performance
        </CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>

      <CardContent className="">
        {chartData.length === 0 ? (
          <div className="mx-auto flex size-[210px] items-center justify-center text-sm text-gray-500">
            No product data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="mx-auto size-[210px]">
            <PieChart className="">
              <RechartsTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                className=""
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={94}
                paddingAngle={4}
                startAngle={90}
                endAngle={-270}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>

      <CardFooter className="mt-auto flex flex-col gap-2.5">
        {chartData.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex flex-wrap gap-4">
              {chartData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: d.fill }}
                  />
                  <span className="text-sm text-slate-700">
                    {d.name.length > 60
                      ? d.name.substring(0, 60) + "..."
                      : d.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default ProductsPerformance;
