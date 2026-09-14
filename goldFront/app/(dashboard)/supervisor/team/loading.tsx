import { TeamSkeleton } from "@/components/ui/skeletons/TeamSkeleton";

export default function SupervisorTeamLoading() {
  return (
    <TeamSkeleton showOverview={false} showAction={false} showTabs={false} />
  );
}
