import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { targetData } from "@/features/target/lib/data";
import { formatCurrency } from "@/features/target/lib/utils";

const MonthlySalesTarget = () => {
  return (
    <Card className="w-full rounded-[14px] bg-linear-to-b from-[#EFF6FF] via-[#FFFFFF] to-[#FEF9E7] shadow-lg">
      <CardHeader className="">
        <CardTitle className="text-lg/7 font-normal text-black">
          Monthly Sales Target
        </CardTitle>
        <CardDescription className="text-secondary-text text-sm/5 font-normal">
          {targetData.month} - {targetData.daysRemaining} days remaining
        </CardDescription>
        <CardAction>
          <span className="bg-dashboard-green rounded-md px-2 py-0.5 text-xs text-xs/4 font-medium text-white">
            {targetData.status}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="mt-5 space-y-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-secondary-text text-xs/4 font-normal">Target</p>
            <p className="text-2xl/8 font-normal text-black">
              {formatCurrency(targetData.target)}
            </p>
          </div>
          <div>
            <p className="text-secondary-text text-xs/4 font-normal">
              Achieved
            </p>
            <p className="text-dashboard-green text-2xl/8 font-normal">
              {formatCurrency(targetData.achieved)}
            </p>
          </div>
          <div>
            <p className="text-secondary-text text-xs/4 font-normal">
              Remaining
            </p>
            <p className="text-dashboard-red text-2xl/8 font-normal">
              {formatCurrency(targetData.remaining)}
            </p>
          </div>
          <div>
            <p className="text-secondary-text text-xs/4 font-normal">
              Daily Required
            </p>
            <p className="text-dashboard-orange text-2xl/8 font-normal">
              {formatCurrency(targetData.dailyRequired)}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <p className="flex items-center justify-between">
            <span className="text-secondary-text text-sm/5">
              Overall Progress
            </span>
            <span className="text-dashboard-blue text-sm/5 font-normal">
              {targetData.progress}%
            </span>
          </p>
          <Progress
            value={targetData.progress}
            className="*:bg-dashboard-blue h-3 bg-[#2563EB33]"
          />
          <p className="text-secondary-text text-xs/4 font-normal">
            You&apos;re performing excellently. Keep up the great work!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlySalesTarget;
