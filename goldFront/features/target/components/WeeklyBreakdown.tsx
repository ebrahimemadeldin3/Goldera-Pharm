import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Calendar } from "lucide-react";
import { weeks } from "@/features/target/lib/data";
import { Progress } from "@/components/ui/progress";

const WeeklyBreakdown = () => {
  return (
    <Card className="border-secondary-light rounded-[14px] shadow-none">
      <CardHeader>
        <CardTitle className="text-lg/7 font-normal text-black">
          Weekly Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {weeks.map((week) => (
          <div
            key={week.week}
            className="bg-secondary-very-light space-y-2 rounded-[10px] border-[0.8px] border-[#E2E8F0] p-3"
          >
            <p className="flex items-center justify-between">
              <span className="text-secondary-text text-xs/4 font-normal">
                Week {week.week}
              </span>
              {week.isAchieved && (
                <CheckCircle2 size={16} className="text-dashboard-green" />
              )}
              {week.isCurrent && (
                <Calendar size={16} className="text-dashboard-blue" />
              )}
            </p>
            <div className="flex items-baseline justify-between">
              <span className="text-sm/5 font-normal text-black">
                SAR {week.achieved}K
              </span>
              <span className="text-secondary-text text-xs/4 font-normal">
                / {week.target}K
              </span>
            </div>
            <Progress
              value={Math.min((week.achieved / week.target) * 100, 100)}
              className={`*:${week.isAchieved ? "bg-dashboard-green" : "bg-dashboard-blue"} h-2 bg-[#2563EB33]`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default WeeklyBreakdown;
