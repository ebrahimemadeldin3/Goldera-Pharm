import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  formatValue,
  getProgressBarColor,
  getStatusBadgeStyle,
} from "@/features/target/lib/utils";
import { targets } from "@/features/target/lib/data";

const AllActiveTargets = () => {
  return (
    <Card className="border-secondary-light w-full rounded-[14px] shadow-none">
      <CardHeader>
        <CardTitle className="text-lg/7 font-normal text-black">
          All Active Targets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {targets.map((target) => (
          <div key={target.id} className="border-[0.8px] border-[#E2E8F0] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm/5 font-normal text-black">
                  {target.name}
                </span>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs/4 font-medium ${getStatusBadgeStyle(target.status)}`}
                >
                  {target.status === "achieved" && (
                    <CheckIcon className="h-3 w-3" />
                  )}
                  {target.status === "behind" && "!"}
                  {target.status === "behind" ? " Behind" : target.status}
                </span>
              </div>
              <p className="text-sm/5 font-normal text-black">
                {formatValue(target.current, target.unit)} /{" "}
                {formatValue(target.target, target.unit)}
              </p>
            </div>
            <div className="text-secondary-text flex items-center justify-between text-xs/4">
              <div className=" ">Deadline: {target.deadline}</div>
              <div className="">{target.progress}%</div>
            </div>

            <Progress
              value={target.progress}
              className={`*:${getProgressBarColor(target.status)} mt-3 h-2 bg-[#2563EB33]`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AllActiveTargets;
