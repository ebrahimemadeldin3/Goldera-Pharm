"use client";
import Image from "next/image";
import { TrendingUp, TrendingDown, MapPin, Target } from "lucide-react";
import supervisorsPerformanceIcon from "@/features/dashboard/assets/icons/supervisorsPerformance.svg";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";

type Supervisor = {
  id: string;
  name: string;
  city: string;
  target: number; // percent
  coverage: number; // percent
  salesLabel: string;
  salesValue: string;
  delta: string;
  up: boolean;
};

const supervisors: Supervisor[] = [
  {
    id: "s1",
    name: "Omar Al-Harbi",
    city: "Riyadh",
    target: 92,
    coverage: 88,
    salesLabel: "Sales",
    salesValue: "SAR 185K",
    delta: "+12.5%",
    up: true,
  },
  {
    id: "s2",
    name: "Layla Al-Zahrani",
    city: "Jeddah",
    target: 78,
    coverage: 85,
    salesLabel: "Sales",
    salesValue: "SAR 142K",
    delta: "-3.2%",
    up: false,
  },
  {
    id: "s3",
    name: "Faisal Al-Dosari",
    city: "Dammam",
    target: 85,
    coverage: 91,
    salesLabel: "Sales",
    salesValue: "SAR 128K",
    delta: "+8.7%",
    up: true,
  },
  {
    id: "s4",
    name: "Maha Al-Qarni",
    city: "Mecca",
    target: 64,
    coverage: 72,
    salesLabel: "Sales",
    salesValue: "SAR 96K",
    delta: "-1.5%",
    up: false,
  },
];

export default function SupervisorsPerformance() {
  return (
    <Card className="border-secondary-light rounded-[25px] border bg-white shadow-none min-[1440px]:w-270.75!">
      <CardHeader className="flex items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-3">
          <div className="bg-system-primary flex size-11 items-center justify-center rounded-[15px]">
            <Image
              src={supervisorsPerformanceIcon}
              alt="supervisors"
              width={20}
              height={20}
            />
          </div>
          <div>
            <CardTitle className="text-[20px] font-semibold">
              Supervisors Performance
            </CardTitle>
            <CardDescription className="text-secondary-dark text-[17px]">
              Regional team leaders overview
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-system-primary rounded-full px-3 py-1 text-[12px] text-white">
            4 Active
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6">
        <div className="flex flex-col">
          {supervisors.map((s, idx) => (
            <div key={s.id} className={`py-5 ${idx > 0 ? "border-t-2" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[16px] font-semibold">{s.name}</h4>
                    <span
                      className={`ml-1 flex items-center text-[16px] ${s.up ? "text-dashboard-green" : "text-dashboard-red"}`}
                    >
                      {s.up ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                    </span>
                  </div>

                  <div className="text-secondary-dark flex flex-col items-start text-[14px]">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} className="" />
                      <span>{s.city}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 items-end">
                    <div className="w-[276px]">
                      <div className="text-secondary-dark flex items-center justify-between gap-1 text-xs">
                        <Target size={12} className="" />
                        <span>Target</span>
                        <span className="text-system-primary ml-auto text-[12px] font-semibold">
                          {s.target}%
                        </span>
                      </div>
                      <div>
                        <Progress
                          value={s.target}
                          className="bg-secondary-light *:bg-system-primary mt-2 h-2 rounded-full"
                        />
                      </div>
                    </div>

                    <div className="w-[276px]">
                      <div className="text-secondary-dark flex items-center justify-between text-xs">
                        <span>Coverage</span>
                        <span className="text-system-primary ml-auto text-[12px] font-semibold">
                          {s.coverage}%
                        </span>
                      </div>
                      <div>
                        <Progress
                          value={s.coverage}
                          className="bg-secondary-light *:bg-system-primary mt-2 h-2 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex w-[150px] flex-col items-end justify-between">
                  <div className="text-secondary-dark text-xs">Sales</div>
                  <div className="text-right">
                    <div className="text-[20px] font-semibold text-black">
                      {s.salesValue}
                    </div>
                    <div
                      className={`mt-1 text-xs font-medium ${s.up ? "text-dashboard-green" : "text-dashboard-red"}`}
                    >
                      {s.delta}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
