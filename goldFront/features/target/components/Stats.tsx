import { Target, CircleCheckBig, TrendingUp, CircleAlert } from "lucide-react";

const Stats = () => {
  return (
    <section className="flex gap-6">
      <div className="flex flex-1 items-center justify-between rounded-[14px] border-[0.8px] border-[#E2E8F0] bg-linear-to-b from-[#EFF6FF] to-white p-4">
        <p className="flex flex-col">
          <span className="text-sm/5 font-normal text-secondary-text">
            Total Targets
          </span>
          <span className="text-dashboard-blue text-2xl/8 font-normal">5</span>
        </p>
        <Target size={32} className="text-dashboard-blue" />
      </div>

      <div className="flex flex-1 items-center justify-between rounded-[14px] border-[0.8px] border-[#E2E8F0] bg-linear-to-b from-[#F0FDF4] to-white p-4">
        <p className="flex flex-col">
          <span className="text-sm/5 font-normal text-secondary-text">Achieved</span>
          <span className="text-dashboard-green text-2xl/8 font-normal">5</span>
        </p>
        <CircleCheckBig size={32} className="text-dashboard-green" />
      </div>

      <div className="flex flex-1 items-center justify-between rounded-[14px] border-[0.8px] border-[#E2E8F0] bg-linear-to-b from-[#FEF9E7] to-white p-4">
        <p className="flex flex-col">
          <span className="text-sm/5 font-normal text-secondary-text">On Track</span>
          <span className="text-dashboard-orange text-2xl/8 font-normal">
            5
          </span>
        </p>
        <TrendingUp size={32} className="text-dashboard-orange" />
      </div>

      <div className="flex flex-1 items-center justify-between rounded-[14px] border-[0.8px] border-[#E2E8F0] bg-linear-to-b from-[#FEF2F2] to-white p-4">
        <p className="flex flex-col">
          <span className="text-sm/5 font-normal text-secondary-text">
            Need Focus
          </span>
          <span className="text-dashboard-red text-2xl/8 font-normal">5</span>
        </p>
        <CircleAlert size={32} className="text-dashboard-red" />
      </div>
    </section>
  );
};

export default Stats;
