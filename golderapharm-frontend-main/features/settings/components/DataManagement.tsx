"use client";

import { Database, Download, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function DataManagement() {
  function handleExport() {
    // trigger export logic
    console.log("Export data");
  }

  function handleDelete() {
    // trigger delete logic (show confirm dialog ideally)
    console.log("Delete account");
  }

  return (
    <Card className="border-secondary-light w-full rounded-2xl border bg-white shadow-none">
      <CardHeader className="flex flex-row items-start gap-3">
        <div className="bg-system-primary flex size-12 items-center justify-center rounded-lg text-white">
          <Database className="h-6 w-6" />
        </div>
        <div>
          <CardTitle className="text-xl/[30px] font-semibold text-black">
            Data Management
          </CardTitle>
          <p className="text-secondary-dark mt-1 text-sm/[21px] font-normal">
            Manage your account data and settings
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Separator className="mb-5" />

        <div className="space-y-4">
          {/* Export Data */}
          <div className="bg-system-primary rounded-[10px] p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base/5 font-semibold text-white">
                  Export Data
                </p>
                <p className="text-secondary-very-light mt-1 text-base/[21px] font-normal">
                  Download a copy of your account data
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleExport}
                className="text-system-primary h-8 cursor-pointer gap-2 rounded-md bg-white text-sm/5 font-medium hover:bg-white"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Delete Account */}
          <div className="bg-dashboard-red rounded-[10px] p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base/5 font-semibold text-white">
                  Delete Account
                </p>
                <p className="text-secondary-very-light mt-1 text-base/[21px] font-normal">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleDelete}
                className="text-dashboard-red h-8 cursor-pointer gap-2 rounded-md bg-white text-sm/5 font-medium hover:bg-white"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
