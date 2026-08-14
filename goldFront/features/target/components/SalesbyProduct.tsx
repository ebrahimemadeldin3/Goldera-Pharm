"use client";

import { Pie, PieChart, Cell, Tooltip as RechartsTooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { salesChartData } from "@/features/target/lib/data";

const chartConfig = {
  value: {
    label: "Sales",
  },
} satisfies ChartConfig;

const SalesbyProduct = () => {
  return (
    <Card className="border-secondary-light rounded-[14px] shadow-none">
      <CardHeader>
        <CardTitle className="text-lg/7 font-normal text-black">
          Sales by Product
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-60.75 w-60.75 max-w-full"
        >
          <PieChart>
            <RechartsTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={salesChartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              startAngle={90}
              endAngle={-270}
            >
              {salesChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="flex flex-col">
          {salesChartData.map((product) => (
            <div
              key={product.name}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: product.fill }}
                />
                <span className="text-secondary-text text-xs/4 font-normal">
                  {product.name}
                </span>
              </div>
              <span className="text-xs/4 font-normal text-black">
                {product.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesbyProduct;
