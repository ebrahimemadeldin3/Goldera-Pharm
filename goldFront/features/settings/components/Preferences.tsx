"use client";

import { Globe } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function Preferences() {
  return (
    <Card className="border-secondary-light w-full rounded-2xl border bg-white shadow-none">
      <CardHeader className="flex flex-row items-start gap-3">
        <div className="bg-system-primary flex size-12 items-center justify-center rounded-lg text-white">
          <Globe size={24} />
        </div>
        <div>
          <CardTitle className="text-xl/[30px] font-semibold text-black">
            Preferences
          </CardTitle>
          <p className="text-secondary-dark mt-1 text-sm/[21px] font-normal">
            The current language and operational timezone are shown below.
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Separator className="mb-5" />

        <div className="space-y-6">
          {/* Language */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm/[14px] font-medium text-black">
                Language
              </div>
              <div className="text-secondary-dark mt-1 text-sm/[21px] font-normal">
                English is currently supported.
              </div>
            </div>
            <Select value="en" disabled>
              <SelectTrigger className="border-secondary-light w-full justify-between border bg-white text-left text-sm font-normal text-black shadow-none sm:w-55">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Timezone */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm/[14px] font-medium text-black">
                Timezone
              </div>
              <div className="text-secondary-dark mt-1 text-sm/[21px] font-normal">
                Operations currently use Saudi Arabia time.
              </div>
            </div>
            <Select value="Asia/Riyadh" disabled>
              <SelectTrigger className="border-secondary-light w-full justify-between border bg-white text-left text-sm font-normal text-black shadow-none sm:w-55">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Riyadh">Asia/Riyadh (GMT+3)</SelectItem>
                <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                <SelectItem value="Europe/London">
                  Europe/London (GMT+0/+1)
                </SelectItem>
                <SelectItem value="America/New_York">
                  America/New_York (GMT-5/-4)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
