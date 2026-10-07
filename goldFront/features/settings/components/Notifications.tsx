"use client";

import { Bell } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function Notifications() {
  return (
    <Card className="w-full space-y-4 rounded-[14px] border border-[#E5E8EF] bg-white p-5 shadow-none">
      <CardHeader className="flex flex-row items-start gap-3 p-0">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-[#CBEFDD] bg-[#E9F8F1] text-[#168557]">
          <Bell size={20} />
        </div>
        <div>
          <CardTitle className="text-base font-bold text-[#182033]">
            Notifications
          </CardTitle>
          <p className="mt-0.5 text-xs text-[#667085]">
            Updates appear in the notification bell. Additional delivery
            channels are not available yet.
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-0 pt-2">
        <Separator className="bg-[#EEF1F6]" />

        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#182033]">
                Email Notifications
              </div>
              <div className="mt-0.5 text-xs text-[#667085]">
                Not available yet
              </div>
            </div>
            <Switch
              checked={false}
              disabled
              aria-label="Email notifications — not available"
              className="shrink-0 cursor-pointer data-[state=checked]:bg-[#168557]"
            />
          </div>

          {/* Push Notifications */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm/[14px] font-medium text-black">
                Push Notifications
              </div>
              <div className="text-secondary-dark mt-1 text-sm/[21px] font-normal">
                Not available yet
              </div>
            </div>
            <Switch
              checked={false}
              disabled
              aria-label="Browser push — not available"
              className="data-[state=checked]:bg-system-primary shrink-0 cursor-pointer"
            />
          </div>

          {/* Weekly Reports */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm/[14px] font-medium text-black">
                Weekly Reports
              </div>
              <div className="text-secondary-dark mt-1 text-sm/[21px] font-normal">
                Not available yet
              </div>
            </div>
            <Switch
              checked={false}
              disabled
              aria-label="Weekly email reports — not available"
              className="data-[state=checked]:bg-system-primary shrink-0 cursor-pointer"
            />
          </div>

          {/* Request Alerts */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm/[14px] font-medium text-black">
                Request Alerts
              </div>
              <div className="text-secondary-dark mt-1 text-sm/[21px] font-normal">
                Review request updates using the notification bell
              </div>
            </div>
            <Switch
              checked={false}
              disabled
              aria-label="Request alert preferences — not available"
              className="data-[state=checked]:bg-system-primary shrink-0 cursor-pointer"
            />
          </div>

          {/* Performance Alerts */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm/[14px] font-medium text-black">
                Performance Alerts
              </div>
              <div className="text-secondary-dark mt-1 text-sm/[21px] font-normal">
                Not available yet
              </div>
            </div>
            <Switch
              checked={false}
              disabled
              aria-label="Performance alert preferences — not available"
              className="data-[state=checked]:bg-system-primary shrink-0 cursor-pointer"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
