"use client";

import { Progress } from "@/components/ui/progress";
import { UserProfile } from "../lib/types";

export default function PerformanceStats({
  profile,
}: {
  profile?: UserProfile;
}) {
  // Use performance data from profile if available, otherwise use defaults
  const teamPerformance = profile?.performance?.teamPerformance ?? 0;
  const targetAchievement = profile?.performance?.targetAchievement ?? 0;

  return (
    <div className="bg-system-primary w-[345px] rounded-[25px] p-6 text-white">
      <h4 className="text-base/5 font-semibold">Performance Stats</h4>
      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <p className="flex items-center justify-between text-base/[21px]">
            <span className="">Team Performance</span>
            <span className="">{teamPerformance}%</span>
          </p>
          <Progress
            value={teamPerformance}
            className="bg-secondary-light h-2 *:bg-white"
          />
        </div>
        <div className="space-y-2">
          <p className="flex items-center justify-between text-base/[21px]">
            <span className="">Target Achievement</span>
            <span className="">{targetAchievement}%</span>
          </p>
          <Progress
            value={targetAchievement}
            className="bg-secondary-light h-2 *:bg-white"
          />
        </div>
      </div>
    </div>
  );
}
