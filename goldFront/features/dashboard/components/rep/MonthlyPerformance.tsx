import { Progress } from "@/components/ui/progress";

interface MonthlyPerformanceProps {
  coverage?: string;
  targetAchievement?: string;
}

export default function MonthlyPerformance({
  coverage = "0%",
  targetAchievement = "0%",
}: MonthlyPerformanceProps) {
  // Parse percentage strings to numbers
  const coverageValue = parseFloat(coverage.replace("%", "")) || 0;
  const targetValue = parseFloat(targetAchievement.replace("%", "")) || 0;
  return (
    <div className="border-secondary-light flex flex-col gap-8 rounded-[25px] border-[0.8px] bg-white p-6">
      <h2 className="text-lg/[28px] font-normal text-black">
        Monthly Performance
      </h2>
      <div className="space-y-4">
        <div>
          <p className="mb-2 flex items-center justify-between">
            <span className="text-secondary-text text-sm/5 font-normal">
              Target Achievement
            </span>
            <span className="text-dashboard-blue text-sm/5 font-normal">
              {targetAchievement}
            </span>
          </p>
          <Progress
            value={targetValue}
            className="*:bg-dashboard-blue h-2 *:rounded-full"
          />
        </div>
        <div>
          <p className="mb-2 flex items-center justify-between">
            <span className="text-secondary-text text-sm/5 font-normal">
              Visit Coverage
            </span>
            <span className="text-dashboard-green text-sm/5 font-normal">
              {coverage}
            </span>
          </p>
          <Progress
            value={coverageValue}
            className="*:bg-dashboard-green h-2 *:rounded-full"
          />
        </div>
      </div>
    </div>
  );
}