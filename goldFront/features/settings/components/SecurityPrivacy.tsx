"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function SecurityPrivacy() {
  const [twoFA, setTwoFA] = useState(false);
  const [timeout, setTimeoutVal] = useState("30");
  const [analytics, setAnalytics] = useState(false);

  return (
    <Card className="border-secondary-light w-full rounded-2xl border bg-white shadow-none">
      <CardHeader className="flex flex-row items-start gap-3">
        <div className="bg-system-primary flex size-12 items-center justify-center rounded-lg text-white">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <CardTitle className="text-xl/[30px] font-semibold text-black">
            Security & Privacy
          </CardTitle>
          <p className="text-secondary-dark mt-1 text-sm/[21px] font-normal">
            Manage your account security
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Separator className="mb-5" />

        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm/[14px] font-medium text-black">
                Two-Factor Authentication
              </div>
              <div className="text-secondary-dark mt-1 text-sm/[21px] font-normal">
                Add an extra layer of security
              </div>
            </div>
            <Switch
              checked={twoFA}
              onCheckedChange={setTwoFA}
              className="data-[state=checked]:bg-system-primary cursor-pointer shrink-0"
            />
          </div>

          {/* Session Timeout */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm/[14px] font-medium text-black">
                Session Timeout
              </div>
              <div className="text-secondary-dark mt-1 text-sm/[21px] font-normal">
                Auto-logout after inactivity
              </div>
            </div>
            <Select value={timeout} onValueChange={setTimeoutVal}>
              <SelectTrigger className="border-secondary-light w-full justify-between border bg-white text-left text-sm font-normal text-black shadow-none sm:w-[220px]">
                <SelectValue placeholder="Select timeout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Analytics & Data Sharing */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm/[14px] font-medium text-black">
                Analytics & Data Sharing
              </div>
              <div className="text-secondary-dark mt-1 text-sm/[21px] font-normal">
                Help improve the app by sharing usage data
              </div>
            </div>
            <Switch
              checked={analytics}
              onCheckedChange={setAnalytics}
              className="data-[state=checked]:bg-system-primary cursor-pointer shrink-0"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
