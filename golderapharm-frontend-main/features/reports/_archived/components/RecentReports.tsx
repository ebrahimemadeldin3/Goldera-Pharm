"use client";

import { Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RECENT_REPORTS } from "../lib/constants";

export default function RecentReports() {
  return (
    <Card className="border-secondary-light w-full max-w-[345px] gap-3 rounded-xl border bg-white shadow-none">
      <CardHeader className="">
        <CardTitle className="text-[20px]/6 font-semibold text-black">
          Recent Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {RECENT_REPORTS.map((r) => (
          <Card
            key={r.id}
            className="border-secondary-light rounded-xl border bg-white p-4 shadow-none"
          >
            <CardContent className="p-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-system-primary text-sm/5 font-normal">{r.title}</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-system-primary hover:bg-system-primary h-8 w-8 cursor-pointer hover:text-white"
                  onClick={() => console.log("Download", r.id)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-xs/4 font-normal text-[#717182]">
                {r.type}
              </p>
              <p className="mt-1 text-[11px] leading-[15px] text-[#717182]">
                {r.meta}
              </p>
              <p className="text-system-primary mt-2 text-xs/4 font-normal">
                {r.generatedAt}
              </p>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
