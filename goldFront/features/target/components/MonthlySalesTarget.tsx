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
    <Card className="w-full rounded-[14px] border border-[#E5E8EF] bg-white p-6 shadow-none">
      <CardHeader className="p-0 mb-4 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg font-bold text-[#182033]">
            Monthly Sales Target
          </CardTitle>
          <CardDescription className="text-xs text-[#667085] mt-0.5">
            {targetData.month} · {targetData.daysRemaining} days remaining in current period
          </CardDescription>
        </div>
        <CardAction>
          <span className="inline-flex items-center rounded-md border border-[#CBEFDD] bg-[#E9F8F1] px-2.5 py-1 text-xs font-semibold text-[#168557]">
            {targetData.status}
          </span>
        </CardAction>
      </CardHeader>

      <CardContent className="p-0 space-y-6">
        {/* 4-Metric Performance Strip */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 bg-[#FBFCFE] p-4 rounded-[10px] border border-[#EEF1F6]">
          <div>
            <p className="text-xs font-medium text-[#667085]">Target</p>
            <p className="text-xl font-bold text-[#182033] mt-1">
              {formatCurrency(targetData.target)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#667085]">Achieved</p>
            <p className="text-xl font-bold text-[#168557] mt-1">
              {formatCurrency(targetData.achieved)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#667085]">Remaining</p>
            <p className="text-xl font-bold text-[#D92D20] mt-1">
              {formatCurrency(targetData.remaining)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#667085]">Daily Required</p>
            <p className="text-xl font-bold text-[#F59E0B] mt-1">
              {formatCurrency(targetData.dailyRequired)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#667085]">Overall Target Achievement</span>
            <span className="text-[#168557] font-bold">{targetData.progress}%</span>
          </div>
          <Progress
            value={targetData.progress}
            className="h-2.5 bg-[#E5E8EF] *:bg-[#168557]"
          />
          <p className="text-xs text-[#667085]">
            You&apos;re performing excellently. Keep up the great work!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlySalesTarget;
