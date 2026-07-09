"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, FileText, Save } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { REPORT_TYPES, EMPLOYEES } from "../lib/constants";
import { ReportFormValues } from "../lib/types";
import { getDoctorsAction } from "@/features/doctors/api";
import { getRegionsAction } from "@/lib/requests/regions";
import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import type { Region } from "@/lib/types/regions";
import { formatSaudiDateDisplay } from "@/lib/utils";

export default function ReportConfiguration() {
  const [doctors, setDoctors] = useState<DoctorApiResponse[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isLoadingRegions, setIsLoadingRegions] = useState(true);

  const form = useForm<ReportFormValues>({
    defaultValues: {
      reportType: "",
      fromDate: null,
      toDate: null,
      employee: "All",
      doctor: "All",
      region: "All",
      include: {
        visits: true,
        sales: true,
        expenses: false,
        performance: true,
      },
    },
  });

  // Fetch doctors on mount
  useEffect(() => {
    async function loadDoctors() {
      setIsLoadingDoctors(true);
      const result = await getDoctorsAction();
      if (result.success && result.data) {
        setDoctors(result.data);
      }
      setIsLoadingDoctors(false);
    }
    loadDoctors();
  }, []);

  // Fetch regions on mount
  useEffect(() => {
    async function loadRegions() {
      setIsLoadingRegions(true);
      const result = await getRegionsAction();
      if (result.success && result.regions) {
        setRegions(result.regions);
      }
      setIsLoadingRegions(false);
    }
    loadRegions();
  }, []);

  function onSubmit(values: ReportFormValues) {
    console.log("Generate Report", values);
  }

  function saveTemplate() {
    console.log("Save Template", form.getValues());
  }

  const fromDate = form.watch("fromDate");
  // const toDate = form.watch("toDate");

  return (
    <Card className="border-secondary-light w-full max-w-[714px] rounded-xl border-[0.8px] bg-white p-6 shadow-none">
      <h2 className="text-[20px]/6 font-semibold">Report Configuration</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-[666px] space-y-6"
        >
          {/* Report Type */}
          <FormField
            control={form.control}
            name="reportType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Report Type</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="input w-full">
                      <SelectValue placeholder="Select report type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_TYPES.map((rt) => (
                        <SelectItem key={rt} value={rt}>
                          {rt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          {/* Dates */}
          <p className="text-secondary-dark -mt-2 text-xs">
            Date fields use Saudi Arabia timezone (Asia/Riyadh).
          </p>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fromDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="input w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? formatSaudiDateDisplay(field.value)
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={(d) => field.onChange(d || null)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="toDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="input w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? formatSaudiDateDisplay(field.value)
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={(d) => field.onChange(d || null)}
                        initialFocus
                        disabled={(date) =>
                          fromDate ? date < fromDate : false
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
          </div>

          {/* Optional Filters */}
          <FormField
            control={form.control}
            name="employee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Filter by Employee (Optional)</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="input w-full">
                      <SelectValue placeholder="All employees..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEES.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="doctor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Filter by Doctor (Optional)</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoadingDoctors}
                  >
                    <SelectTrigger className="input w-full">
                      <SelectValue
                        placeholder={
                          isLoadingDoctors
                            ? "Loading doctors..."
                            : "All doctors..."
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Filter by Region (Optional)</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoadingRegions}
                  >
                    <SelectTrigger className="input w-full">
                      <SelectValue
                        placeholder={
                          isLoadingRegions
                            ? "Loading regions..."
                            : "All regions..."
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      {regions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          {/* Include Section */}
          <div>
            <h3 className="mb-3 text-sm/[14px] font-medium">
              Include in Report
            </h3>
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="include.visits"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-system-primary data-[state=checked]:border-system-primary cursor-pointer data-[state=checked]:text-white"
                      />
                    </FormControl>
                    <FormLabel className="m-0 cursor-pointer text-sm/5 font-normal">
                      Visit Details & Notes
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="include.sales"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-system-primary data-[state=checked]:border-system-primary cursor-pointer data-[state=checked]:text-white"
                      />
                    </FormControl>
                    <FormLabel className="m-0 cursor-pointer text-sm/5 font-normal">
                      Sales & Revenue Data
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="include.expenses"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-system-primary data-[state=checked]:border-system-primary cursor-pointer data-[state=checked]:text-white"
                      />
                    </FormControl>
                    <FormLabel className="m-0 cursor-pointer text-sm/5 font-normal">
                      Expense Records
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="include.performance"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-system-primary data-[state=checked]:border-system-primary cursor-pointer data-[state=checked]:text-white"
                      />
                    </FormControl>
                    <FormLabel className="m-0 cursor-pointer text-sm/5 font-normal">
                      Performance Metrics & KPIs
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <Button
              type="submit"
              className="button-system-primary flex-1 cursor-pointer justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Generate Report
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={saveTemplate}
              className="cursor-pointer gap-2"
            >
              <Save className="h-4 w-4" />
              Save Template
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
