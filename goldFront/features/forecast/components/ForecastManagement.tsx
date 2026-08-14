"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calculator, FileText, Package, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Forecast } from "../lib/types";
import ForecastHistory from "@/features/forecast/components/ForecastHistory";

export default function ForecastManagement({
  forecasts,
  page = 1,
  limit = 10,
  totalCount = 0,
}: {
  forecasts: Forecast[];
  page?: number;
  limit?: number;
  totalCount?: number;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"create" | "history">("create");

  const tabs: Array<{
    id: "create" | "history";
    label: string;
    icon?: React.ReactNode;
  }> = [
    { id: "create", label: "Create Forecast", icon: <Calculator size={16} /> },
    { id: "history", label: "Forecast History", icon: <FileText size={16} /> },
  ];

  const handleCreateForecast = () => {
    router.push("/rep/forecast/new");
  };

  return (
    <div className="border-secondary-light mt-6 rounded-[14px] border-[0.8px] bg-white p-6">
      <h2 className="mb-6 text-base/4 font-normal text-black">
        Forecast Management
      </h2>
      <div className="flex w-fit flex-wrap items-center gap-2 rounded-[14px] bg-[#F1F5F9] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex cursor-pointer items-center gap-2 rounded-[14px] border-[0.8px] border-transparent px-2 py-1 text-sm/5 font-medium text-[#0F172A] transition-colors ${
              activeTab === tab.id ? "border-secondary-light bg-white" : ""
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {activeTab === "create" ? (
          <>
            <div className="flex items-start gap-2 rounded-[10px] border-[0.8px] border-[#BFDBFE] bg-[#EFF6FF] p-4">
              <TrendingUp className="text-dashboard-blue shrink-0" size={14} />
              <p className="min-w-0 flex-1 text-sm/5 font-normal text-[#1E40AF]">
                <span className="font-bold">Product Forecasting:</span>
                Plan how you will distribute your allocated products across your
                doctors. Ensure all products are distributed optimally based on
                doctor specialty and patient needs.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center py-12">
              <Package size={64} className="text-[#CBD5E1]" />
              <h3 className="text-secondary-dark mb-2 text-lg/7 font-normal">
                No Active Forecast
              </h3>
              <p className="text-secondary-dark mb-6 text-sm/5 font-normal">
                Click &quot;New Forecast&quot; to start planning your product
                distribution
              </p>
              <Button
                onClick={handleCreateForecast}
                className="button-system-gradient-primary"
              >
                <span className="text-lg">+</span>
                Create New Forecast
              </Button>
            </div>
          </>
        ) : (
          <ForecastHistory
            forecasts={forecasts}
            page={page}
            limit={limit}
            totalCount={totalCount}
          />
        )}
      </div>
    </div>
  );
}

