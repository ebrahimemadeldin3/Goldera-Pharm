"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FORECAST_PERIOD_TYPES,
  FORECAST_MONTHS,
  FORECAST_QUARTERS,
} from "../lib/constants";
import { CreateForecastFormValues } from "../lib/schemas";
import { Calendar, Building2, Stethoscope } from "lucide-react";

interface ForecastSetupStepProps {
  form: UseFormReturn<CreateForecastFormValues>;
  years: number[];
  isPending?: boolean;
}

export function ForecastSetupStep({
  form,
  years,
  isPending = false,
}: ForecastSetupStepProps) {
  const periodType = form.watch("periodType");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#182033]">Forecast Setup</h2>
        <p className="text-xs text-[#667085] mt-1">
          Choose Doctor or Pharmacy Forecast, then select the period and year.
        </p>
      </div>

      <FormField
        control={form.control}
        name="targetType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold text-[#344054]">
              Forecast Type *
            </FormLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => field.onChange("DOCTOR")}
                className={`flex items-center gap-3 rounded-[12px] border p-3.5 text-left transition-colors ${
                  (field.value || "DOCTOR") === "DOCTOR"
                    ? "border-[#168557] bg-[#E9F8F1]/60 text-[#182033]"
                    : "border-[#DDE3EE] bg-white text-[#667085] hover:bg-[#F9FAFB]"
                }`}
              >
                <Stethoscope className="size-5 shrink-0 text-[#168557]" />
                <div>
                  <div className="text-sm font-bold text-[#182033]">
                    Doctor Forecast
                  </div>
                  <div className="text-xs text-[#667085]">
                    Allocate product units across assigned doctors
                  </div>
                </div>
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => field.onChange("PHARMACY")}
                className={`flex items-center gap-3 rounded-[12px] border p-3.5 text-left transition-colors ${
                  field.value === "PHARMACY"
                    ? "border-[#168557] bg-[#E9F8F1]/60 text-[#182033]"
                    : "border-[#DDE3EE] bg-white text-[#667085] hover:bg-[#F9FAFB]"
                }`}
              >
                <Building2 className="size-5 shrink-0 text-[#168557]" />
                <div>
                  <div className="text-sm font-bold text-[#182033]">
                    Pharmacy Forecast
                  </div>
                  <div className="text-xs text-[#667085]">
                    Allocate product units across territory pharmacies
                  </div>
                </div>
              </button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="periodType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-[#344054]">
                Period Type *
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger className="h-11 w-full rounded-[10px] border border-[#DDE3EE] bg-[#F9FAFB] px-3 text-sm font-medium text-[#182033] shadow-none focus:border-[#168557] focus:ring-2 focus:ring-[#168557]/20">
                    <SelectValue placeholder="Select period type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FORECAST_PERIOD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={periodType === "MONTHLY" ? "month" : "quarter"}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-[#344054]">
                {periodType === "MONTHLY" ? "Month *" : "Quarter *"}
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger className="h-11 w-full rounded-[10px] border border-[#DDE3EE] bg-[#F9FAFB] px-3 text-sm font-medium text-[#182033] shadow-none focus:border-[#168557] focus:ring-2 focus:ring-[#168557]/20">
                    <SelectValue
                      placeholder={
                        periodType === "MONTHLY"
                          ? "Select month"
                          : "Select quarter"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(periodType === "MONTHLY"
                    ? FORECAST_MONTHS
                    : FORECAST_QUARTERS
                  ).map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-[#344054]">
                Year *
              </FormLabel>
              <Select
                onValueChange={(val) => field.onChange(parseInt(val, 10))}
                value={field.value?.toString()}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger className="h-11 w-full rounded-[10px] border border-[#DDE3EE] bg-[#F9FAFB] px-3 text-sm font-medium text-[#182033] shadow-none focus:border-[#168557] focus:ring-2 focus:ring-[#168557]/20">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="rounded-[12px] border border-[#CBEFDD] bg-[#E9F8F1]/40 p-4 flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E9F8F1] text-[#168557]">
          <Calendar className="size-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#168557]">
            Planning Context Guidelines
          </p>
          <p className="text-xs text-[#344054] mt-0.5 leading-relaxed">
            Forecasting is performed on a monthly or quarterly basis. Once set,
            you will select the products to include in this submission and allocate
            planned quantities per doctor in your territory.
          </p>
        </div>
      </div>
    </div>
  );
}
