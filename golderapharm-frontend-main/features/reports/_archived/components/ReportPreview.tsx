"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  FileText,
  User,
  Stethoscope,
  Calendar as CalendarIcon,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { formatRange } from "../lib/utils";

export type ReportPreviewData = {
  title?: string;
  generatedAt?: Date;
  employee?: string;
  doctor?: string;
  fromDate?: Date | null;
  toDate?: Date | null;
  region?: string;
};

export default function ReportPreview({ data }: { data?: ReportPreviewData }) {
  const {
    title = "Custom Report",
    generatedAt = new Date(),
    employee = "All employees",
    doctor = "All doctors",
    fromDate = null,
    toDate = null,
    region = "All regions",
  } = data || {};

  return (
    <Card className="border-secondary-light gap-2 rounded-xl border-[0.8px] bg-white p-6 shadow-none">
      <CardHeader className="m-0 p-0">
        <CardTitle className="m-0 p-0 text-[20px]/6 font-semibold">
          Report Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-system-primary-light border-system-primary-stroke rounded-xl border p-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-base/6 font-normal text-black">{title}</h4>
            <p className="text-secondary-dark text-sm/5">
              Generated on {format(generatedAt, "MM/dd/yyyy")}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="text-system-primary bg-system-primary-light hover:bg-system-primary-stroke border-system-primary-stroke hover:text-system-primary size-12 cursor-pointer"
          >
            <FileText size={24} />
          </Button>
        </div>

        <Separator className="bg-system-primary-stroke my-4" />

        <div className="space-y-3 text-xs font-normal">
          <div className="flex items-center gap-2">
            <User className="text-secondary-dark h-4 w-4" />
            <span className="text-secondary-dark">Employee:</span>
            <span className="font-normal text-black">{employee}</span>
          </div>
          <div className="flex items-center gap-2">
            <Stethoscope className="text-secondary-dark h-4 w-4" />
            <span className="text-secondary-dark">Doctor:</span>
            <span className="font-normal text-black">{doctor}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-secondary-dark h-4 w-4" />
            <span className="text-secondary-dark">Period:</span>
            <span className="font-normal text-black">
              {formatRange(fromDate, toDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="text-secondary-dark h-4 w-4" />
            <span className="text-secondary-dark">Region:</span>
            <span className="text-black">{region}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
