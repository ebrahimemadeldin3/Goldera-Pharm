"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function Notifications() {
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(false);
  const [weekly, setWeekly] = useState(true);
  const [requests, setRequests] = useState(true);
  const [performance, setPerformance] = useState(false);

  return (
    <Card className="w-full rounded-[14px] border border-[#E5E8EF] bg-white p-5 shadow-none space-y-4">
      <CardHeader className="flex flex-row items-start gap-3 p-0">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[#E9F8F1] border border-[#CBEFDD] text-[#168557]">
          <Bell size={20} />
        </div>
        <div>
          <CardTitle className="text-base font-bold text-[#182033]">
            Notifications
          </CardTitle>
          <p className="text-xs text-[#667085] mt-0.5">
            Manage how you receive system alerts and updates
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-4 pt-2">
        <Separator className="bg-[#EEF1F6]" />

        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#182033]">
                Email Notifications
              </div>
              <div className="text-xs text-[#667085] mt-0.5">
                Receive notifications via email
              </div>
            </div>
            <Switch
              checked={email}
              onCheckedChange={setEmail}
              className="data-[state=checked]:bg-[#168557] cursor-pointer shrink-0"
            />
          </div>

          {/* Push Notifications */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm/[14px] font-medium text-black">
                Push Notifications
              </div>
              <div className="text-secondary-dark mt-1 text-sm/[21px] font-normal">
                Receive push notifications in browser
              </div>
            </div>
            <Switch
              checked={push}
              onCheckedChange={setPush}
              className="data-[state=checked]:bg-system-primary cursor-pointer shrink-0"
            />
          </div>

          {/* Weekly Reports */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm/[14px] font-medium text-black">
                Weekly Reports
              </div>
              <div className="text-secondary-dark mt-1 text-sm/[21px] font-normal">
                Receive weekly performance reports
              </div>
            </div>
            <Switch
              checked={weekly}
              onCheckedChange={setWeekly}
              className="data-[state=checked]:bg-system-primary cursor-pointer shrink-0"
            />
          </div>

          {/* Request Alerts */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm/[14px] font-medium text-black">
                Request Alerts
              </div>
              <div className="text-secondary-dark mt-1 text-sm/[21px] font-normal">
                Get notified about pending requests
              </div>
            </div>
            <Switch
              checked={requests}
              onCheckedChange={setRequests}
              className="data-[state=checked]:bg-system-primary cursor-pointer shrink-0"
            />
          </div>

          {/* Performance Alerts */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm/[14px] font-medium text-black">
                Performance Alerts
              </div>
              <div className="text-secondary-dark mt-1 text-sm/[21px] font-normal">
                Alerts for team performance changes
              </div>
            </div>
            <Switch
              checked={performance}
              onCheckedChange={setPerformance}
              className="data-[state=checked]:bg-system-primary cursor-pointer shrink-0"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
