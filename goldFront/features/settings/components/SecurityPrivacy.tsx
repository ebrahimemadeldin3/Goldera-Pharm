"use client";

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
            Review available account security options.
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
                Not available yet
              </div>
            </div>
            <Switch
              checked={false}
              disabled
              aria-label="Two-factor authentication — not available yet"
              className="data-[state=checked]:bg-system-primary shrink-0 cursor-pointer"
            />
          </div>

          {/* Session Timeout */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm/[14px] font-medium text-black">
                Session Timeout
              </div>
              <div className="text-secondary-dark mt-1 text-sm/[21px] font-normal">
                Sessions expire one hour after sign-in.
              </div>
            </div>
            <Select value="60" disabled>
              <SelectTrigger className="border-secondary-light w-full justify-between border bg-white text-left text-sm font-normal text-black shadow-none sm:w-55">
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
                Usage-data sharing is not available.
              </div>
            </div>
            <Switch
              checked={false}
              disabled
              aria-label="Analytics sharing — not available yet"
              className="data-[state=checked]:bg-system-primary shrink-0 cursor-pointer"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
