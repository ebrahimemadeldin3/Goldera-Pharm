"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { chartData } from "@/features/target/lib/data";

const chartConfig = {
  actual: {
    label: "Actual",
    color: "#93c5fd",
  },
  target: {
    label: "Target",
    color: "#d4b896",
  },
} satisfies ChartConfig;

const MonthlyProgressTracking = () => {
  return (
    <Card className="border-secondary-light w-full rounded-[14px] shadow-none">
      <CardHeader>
        <CardTitle className="text-lg/7 font-normal text-black">
          Monthly Progress Tracking
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-90 w-full">
          <AreaChart
            data={chartData}
            margin={{
              left: 15,
              right: 15,
              top: 15,
              bottom: 15,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="day"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              className="text-muted-foreground text-xs"
            />
            <YAxis
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              className="text-muted-foreground text-xs"
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-actual)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-actual)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillTarget" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-target)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-target)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="actual"
              type="natural"
              fill="url(#fillActual)"
              fillOpacity={0.6}
              stroke="#3b82f6"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="target"
              type="natural"
              fill="url(#fillTarget)"
              fillOpacity={0.6}
              stroke="#c9a86a"
              strokeWidth={2}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyProgressTracking;
