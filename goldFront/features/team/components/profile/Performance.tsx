"use client";

import {
  Star,
  TrendingUp,
  Award,
  CircleCheckBig,
  SquarePen,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { User } from "@/features/team/lib/types"

export default function Performance({
  performanceData,
}: {
  performanceData: User;
}) {
  return (
    <Card className="border-secondary-light flex w-full flex-col gap-2 rounded-[14px] border-[0.8px] bg-white shadow-none">
      <CardHeader className="flex items-center justify-start gap-1">
        <Star size={20} className="text-gold" />
        <h3 className="text-base font-normal text-black">
          Performance Appraisal
        </h3>
        <div className="ml-auto rounded-xl bg-[#C9A961] px-2 py-0.5 text-xs font-medium text-white">
          {performanceData.quarter || "Q4 2024"}
        </div>
      </CardHeader>
      <CardContent className="mt-2 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex w-full items-center justify-between">
            <div>
              <p className="text-secondary-dark text-base font-normal">
                Overall Performance Score
              </p>
              <div className="flex items-center gap-3 text-base font-normal">
                <span className="text-[#0F172A]">
                  {performanceData.overall || 0}%
                </span>
                <span className="text-dashboard-blue flex items-center gap-1">
                  <TrendingUp size={16} />
                  {performanceData.deltaLabel || "No data"}
                </span>
              </div>
            </div>
            <div className="gradient-brown flex size-16 items-center justify-center rounded-[10px] text-white">
              <Award size={32} />
            </div>
          </div>
          <Progress
            value={performanceData.overall || 0}
            className="*:bg-dashboard-blue h-3 rounded-full bg-[#2563EB33]"
          />
        </div>
        <div>
          <h4 className="text-secondary-dark text-base font-normal">
            Performance Categories
          </h4>
          {performanceData.categories &&
          performanceData.categories.length > 0 ? (
            <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
              {performanceData.categories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-[10px] border border-[##D9D9D9] px-3 pt-3 pb-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-secondary-dark text-sm font-normal">
                      {category.title}
                    </div>
                    <div className="text-base font-normal text-black">
                      {category.value}%
                    </div>
                  </div>
                  <Progress
                    value={category.value}
                    className="bg-secondary-light *:bg-dashboard-blue mt-2 h-2 rounded-full"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-[10px] border border-[#D9D9D9] p-6 text-center">
              <p className="text-secondary-dark text-sm">
                No performance categories available
              </p>
            </div>
          )}
        </div>
        <div className="border-secondary-light bg-secondary-very-light flex flex-col justify-start gap-1 rounded-[10px] border p-3">
          <div className="flex items-center gap-2 text-base font-normal text-black">
            <CircleCheckBig size={16} />
            <span className="text-base font-medium">Manager Comments</span>
          </div>
          <span className="text-secondary-dark ml-6 text-sm font-normal">
            {performanceData.managerComments || "No comments available yet"}
          </span>
        </div>
      </CardContent>
      <CardFooter className="mt-2 flex w-full flex-col gap-6">
        <div className="borrder-[#D9D9D9] flex w-full flex-wrap items-center justify-between gap-4 border-t py-4 pr-6 *:flex *:flex-col *:justify-start sm:pr-30">
          <div>
            <span className="text-secondary-dark text-base">Reviewed By</span>
            <span className="mt-1 text-base font-medium text-[#0F172A]">
              {performanceData.reviewedBy || "Not reviewed"}
            </span>
          </div>
          <div>
            <span className="text-secondary-dark text-base">Last Review</span>
            <span className="mt-1 text-base font-medium text-[#0F172A]">
              {performanceData.lastReview || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-secondary-dark text-base">Next Review</span>
            <span className="mt-1 text-base font-medium text-[#0F172A]">
              {performanceData.nextReview || "N/A"}
            </span>
          </div>
        </div>
        <Button className="bg-gold hover:text-gold hover:border-gold ml-auto cursor-pointer rounded-[7px] border border-transparent text-sm font-medium text-white hover:bg-white">
          <SquarePen className="h-4 w-4" />
          Update Appraisal
        </Button>
      </CardFooter>
    </Card>
  );
}
