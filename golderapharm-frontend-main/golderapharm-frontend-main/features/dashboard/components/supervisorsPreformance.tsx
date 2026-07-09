"use client";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import Image from "next/image";

import supervisorPerformanceIcon from "@/features/dashboard/assets/icons/supervisorPerformance.svg";

const chartData = [
  { name: "Ahmed.A", visits: 50, target: 35 },
  { name: "Maha", visits: 60, target: 50 },
  { name: "Mahmoud", visits: 70, target: 60 },
  { name: "Hassan", visits: 90, target: 80 },
  { name: "Haitham", visits: 50, target: 45 },
  { name: "Ahmed.H", visits: 88, target: 82 },
];

const chartConfig = {
  visits: { label: "Visits", color: "#10B981" },
  target: { label: "Target", color: "#2563EB" },
} satisfies ChartConfig;

export function SupervisorsPerformance() {
  return (
    <Card className="border-secondary-light h-[480px] rounded-[25px] border bg-white shadow-none min-[1440px]:w-[714px]">
      <CardHeader className="flex flex-col items-start gap-4">
        <div className="flex items-center gap-6">
          <div className="bg-system-primary flex size-11 items-center justify-center rounded-[15px]">
            <Image
              src={supervisorPerformanceIcon}
              alt="supervisor icon"
              width={24}
              height={24}
            />
          </div>
          <CardTitle className="text-[20px] font-semibold">
            Supervisors Preformance
          </CardTitle>
        </div>
        <CardDescription className="text-secondary-dark text-[17px]">
          Monthly overview of visits and doctor coverage
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <LineChart
            data={chartData}
            margin={{ left: 12, right: 12, top: 8, bottom: 18 }}
          >
            <CartesianGrid vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v: string) => v}
              style={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              domain={[0, 120]}
              ticks={[0, 30, 60, 90, 120]}
              style={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="visits"
              name="Visits"
              type="monotone"
              stroke="#2563EB"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 0, fill: "#2563EB" }}
              activeDot={{ r: 6 }}
            />
            <Line
              dataKey="target"
              name="Target"
              type="monotone"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 0, fill: "#10B981" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-4 pt-4">
        <div className="flex items-center gap-8 pl-7">
          <div className="flex items-center gap-2">
            <span className="bg-dashboard-green inline-flex h-3 w-3 items-center justify-center rounded-full" />
            <span className="text-dashboard-green text-[17px] font-semibold">
              Target
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-dashboard-blue inline-flex h-3 w-3 items-center justify-center rounded-full" />
            <span className="text-dashboard-blue text-[17px] font-semibold">
              Visits
            </span>
          </div>
        </div>

        <div className="text-muted-foreground text-sm">Monthly overview</div>
      </CardFooter>
    </Card>
  );
}

export default SupervisorsPerformance;
