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
    <Card className="border-secondary-light w-full rounded-2xl border bg-white shadow-none">
      <CardHeader className="flex flex-row items-start gap-3">
        <div className="bg-system-primary flex size-12 items-center justify-center rounded-lg text-white">
          <Bell size={24} />
        </div>
        <div>
          <CardTitle className="text-xl/[30px] font-semibold text-black">
            Notifications
          </CardTitle>
          <p className="text-secondary-dark mt-1 text-sm/[21px] font-normal">
            Manage how you receive notifications
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Separator className="mb-5" />

        <div className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm/[14px] font-medium text-black">
                Email Notifications
              </div>
              <div className="text-secondary-dark mt-1 text-sm/[21px] font-normal">
                Receive notifications via email
              </div>
            </div>
            <Switch
              checked={email}
              onCheckedChange={setEmail}
              className="data-[state=checked]:bg-system-primary cursor-pointer"
            />
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div>
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
              className="data-[state=checked]:bg-system-primary cursor-pointer"
            />
          </div>

          {/* Weekly Reports */}
          <div className="flex items-center justify-between">
            <div>
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
              className="data-[state=checked]:bg-system-primary cursor-pointer"
            />
          </div>

          {/* Request Alerts */}
          <div className="flex items-center justify-between">
            <div>
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
              className="data-[state=checked]:bg-system-primary cursor-pointer"
            />
          </div>

          {/* Performance Alerts */}
          <div className="flex items-center justify-between">
            <div>
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
              className="data-[state=checked]:bg-system-primary cursor-pointer"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
