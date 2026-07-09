import { Award } from "lucide-react";

const Badge = () => {
  return (
    <div className="gradient-green flex flex-col gap-6 rounded-[14px] p-6 text-white">
      <Award size={32} />
      <p className="text-sm/5 font-normal">Great Progress!</p>
      <p className="text-xs/4 font-normal">
        You&apos;re ahead of schedule. Maintain this pace to exceed your monthly
        target.
      </p>
      <p className="text-dashboard-green w-fit rounded-md bg-white px-2 py-0.5 text-xs/4 font-medium">
        Top 3 in Region
      </p>
    </div>
  );
};

export default Badge;
