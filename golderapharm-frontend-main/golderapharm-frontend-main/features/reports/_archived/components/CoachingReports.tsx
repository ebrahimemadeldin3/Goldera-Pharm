"use client";

import { GraduationCap, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function CoachingReports() {
  return (
    <Card className="border-secondary-light max-w-[345px] gap-8 rounded-xl border bg-white pb-15 shadow-none">
      <CardHeader className="flex items-start gap-3 pb-0">
        <div className="from-system-gradient-from to-system-gradient-to flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-b text-white">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <CardTitle className="text-base/4 font-normal text-black">
            Coaching Reports
          </CardTitle>
          <p className="text-secondary-dark mt-1 text-xs/4 font-normal">
            View team coaching feedback
          </p>
        </div>
      </CardHeader>

      <CardContent className="">
        <div className="grid grid-cols-2 gap-2">
          <div className="border-gold-stroke rounded-lg border bg-white p-3">
            <p className="text-secondary-dark flex items-center gap-2 text-xs/4">
              <Users className="text-system-primary" size={16} />
              Total Reports
            </p>
            <p className="mt-2 text-[20px]/7 font-normal text-black">12</p>
          </div>

          <div className="border-gold-stroke rounded-lg border bg-white p-3">
            <p className="text-secondary-dark flex items-center gap-2 text-xs/4">
              <TrendingUp className="text-system-primary" size={16} />
              Avg Rating
            </p>
            <p className="mt-2 text-[20px]/7 font-normal text-black">4.2</p>
          </div>
        </div>

        <p className="text-secondary-dark mt-5 text-sm/5">
          Access detailed coaching reports from supervisors about medical reps,
          including feedback, action plans, and rep responses.
        </p>

        <ul className="text-secondary-dark mt-4 space-y-2 text-xs/4">
          <li className="flex items-start gap-2">
            <span className="bg-system-primary mt-1 h-1.5 w-1.5 rounded-full" />
            Joint visit evaluations
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-system-primary mt-1 h-1.5 w-1.5 rounded-full" />
            Performance reviews
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-system-primary mt-1 h-1.5 w-1.5 rounded-full" />
            Skill development tracking
          </li>
        </ul>

        <Link
          href="/manager/coaching" // this component is used for the manager ui only so no need to make the link dynamic
          className="button-system-gradient-primary mt-6 flex w-full items-center justify-center gap-2 rounded-md py-[8px]"
        >
          View Coaching Reports
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
