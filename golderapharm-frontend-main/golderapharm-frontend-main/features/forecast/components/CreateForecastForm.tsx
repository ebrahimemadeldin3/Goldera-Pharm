"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createForecastSchema,
  type CreateForecastFormValues,
} from "../lib/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/lib/utils/toast";
import { Product, Doctor } from "../lib/types";
import {
  getProductsAction,
  getMyDoctorsAction,
  submitForecastAction,
} from "../api";
import {
  FORECAST_PERIOD_TYPES,
  FORECAST_MONTHS,
  FORECAST_QUARTERS,
} from "../lib/constants";
import { calculateProductStats, calculateAllocationTotals } from "../lib/utils";
import { Send, ChevronLeft, ChevronRight } from "lucide-react";
import { getSaudiYear } from "@/lib/utils";

export default function CreateForecastForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<
    Record<string, Record<string, number>>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 10;

  const currentYear = getSaudiYear(new Date());
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  const form = useForm<CreateForecastFormValues>({
    resolver: zodResolver(createForecastSchema),
    defaultValues: {
      periodType: "MONTHLY",
      month: "december",
      year: currentYear,
      distributions: [],
      notes: "",
    },
  });

  const periodType = form.watch("periodType");

  // Fetch products and doctors on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [productsResult, doctorsResult] = await Promise.all([
        getProductsAction(),
        getMyDoctorsAction(),
      ]);

      if (productsResult.success && productsResult.data) {
        setProducts(productsResult.data);
      }
      if (doctorsResult.success && doctorsResult.data) {
        setDoctors(doctorsResult.data);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // Calculate product allocation status
  const productStats = useMemo(
    () => calculateProductStats(products, allocations),
    [products, allocations],
  );

  // Calculate totals
  const totals = useMemo(
    () => calculateAllocationTotals(allocations),
    [allocations],
  );

  // Pagination calculations
  const totalPages = Math.ceil(doctors.length / doctorsPerPage);
  const startIndex = (currentPage - 1) * doctorsPerPage;
  const endIndex = startIndex + doctorsPerPage;
  const paginatedDoctors = doctors.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  // Calculate which page numbers to show (5 before and 5 after current page)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPagesToShow = 11; // 5 before + current + 5 after

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show 5 pages before and after current page
      let startPage = Math.max(1, currentPage - 5);
      let endPage = Math.min(totalPages, currentPage + 5);

      // Adjust if we're near the start or end
      if (currentPage <= 6) {
        endPage = maxPagesToShow;
      } else if (currentPage >= totalPages - 5) {
        startPage = totalPages - maxPagesToShow + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const handleAllocationChange = (
    doctorId: string,
    productId: string,
    value: string,
  ) => {
    const numValue = parseInt(value) || 0;
    setAllocations((prev) => ({
      ...prev,
      [doctorId]: {
        ...prev[doctorId],
        [productId]: numValue,
      },
    }));
  };

  const onSubmit = async () => {
    console.log("onSubmit called");
    setError("");

    // Convert allocations to distributions format for validation
    const distributions = Object.entries(allocations)
      .map(([doctorId, doctorAlloc]) => {
        const allocationsArray = Object.entries(doctorAlloc)
          .filter(([, units]) => units > 0)
          .map(([productId, units]) => ({ productId, units }));

        if (allocationsArray.length === 0) return null;

        return {
          doctorId,
          allocations: allocationsArray,
        };
      })
      .filter(Boolean) as CreateForecastFormValues["distributions"];

    console.log("Distributions:", distributions);
    console.log("Allocations:", allocations);

    // Validate that at least one doctor has allocations
    if (distributions.length === 0) {
      console.log("Validation failed: No distributions");
      setError("Please allocate products to at least one doctor");
      toast.error({
        title: "Validation Error",
        description: "Please allocate products to at least one doctor",
      });
      return;
    }

    // Update form with distributions for validation
    form.setValue("distributions", distributions);

    // Validate form
    const isValid = await form.trigger();
    console.log("Form validation result:", isValid);
    if (!isValid) {
      const errors = form.formState.errors;
      console.error("Form validation errors:", errors);

      // Show first error to user
      const firstError = Object.values(errors)[0];
      if (firstError?.message) {
        setError(firstError.message as string);
        toast.error({
          title: "Validation Error",
          description: firstError.message as string,
        });
      }
      return;
    }

    console.log("Starting submission with data:", {
      formValues: form.getValues(),
      allocations,
    });

    startTransition(async () => {
      try {
        const result = await submitForecastAction({
          ...form.getValues(),
          allocations,
        });

        if (result.success) {
          toast.success({
            title: "Forecast submitted for approval",
            description: "Your supervisor will review it",
          });
          router.push("/rep/forecast");
        } else {
          setError(result.error?.message || "Failed to submit forecast");
          toast.error({
            title: "Submission Failed",
            description: result.error?.message || "Failed to submit forecast",
          });
        }
      } catch (err) {
        console.error("Submission error:", err);
        setError("An unexpected error occurred");
        toast.error({
          title: "Error",
          description: "An unexpected error occurred",
        });
      }
    });
  };

  const onCancel = () => {
    router.push("/rep/forecast");
  };

  if (loading) {
    return (
      <div className="border-system-primary rounded-md border bg-white">
        <h2 className="bg-system-primary rounded-t-md p-6 text-base/4 font-normal text-white">
          Create New Forecast
        </h2>
        <div className="flex items-center justify-center p-12">
          <p className="text-secondary-dark text-base/6 font-normal">
            Loading products and doctors...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="border-system-primary rounded-[14px] border bg-white">
      <h2 className="bg-system-primary rounded-t-[14px] p-6 text-base/4 font-normal text-white">
        Create New Forecast
      </h2>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-8 p-6"
        >
          <div className="grid grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="periodType"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel>Forecast Period</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger className={"input w-full"}>
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
                  <FormMessage className="absolute -bottom-6 left-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={periodType === "MONTHLY" ? "month" : "quarter"}
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel>
                    {periodType === "MONTHLY" ? "Month" : "Quarter"}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger className={"input w-full"}>
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
                  <FormMessage className="absolute -bottom-6 left-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel>Year</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger className={"input w-full"}>
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
                  <FormMessage className="absolute -bottom-6 left-1" />
                </FormItem>
              )}
            />
          </div>
          <div>
            <h3 className="mb-4 text-sm/4 font-medium text-black">
              Product Allocation Status
            </h3>
            <div className="space-y-3">
              {productStats.map((product) => (
                <div
                  className="rounded-[10px] bg-[#F8FAFC] p-4"
                  key={product.id}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm/5 font-normal text-[#0F172A]">
                        {product.name}
                      </p>
                      <p className="text-secondary-text text-xs/4 font-normal">
                        {product.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm/5 font-normal text-[#0F172A]">
                        {product.allocated} / {product.totalUnits} units
                      </p>
                      <p className="text-dashboard-orange text-xs/4 font-normal">
                        {product.remaining} remaining
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress
                      value={product.percentage}
                      className="h-2 bg-[#2563EB33]"
                      indicatorClassName={
                        product.percentage > 90
                          ? "bg-dashboard-green"
                          : product.percentage > 50
                            ? "bg-dashboard-blue"
                            : "bg-dashboard-orange"
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <>
            <h3 className="mb-4 text-sm/4 font-medium text-black">
              Distribution Planning
            </h3>
            <div className="border-secondary-light overflow-x-auto rounded-lg border">
              <table className="w-full">
                <thead className="bg-secondary-very-light">
                  <tr className="text-secondary-text text-sm/5 font-bold">
                    <th className="border-secondary-light border-b-[0.8px] px-4 py-3 text-left">
                      Doctor
                    </th>
                    <th className="border-secondary-light border-b-[0.8px] px-4 py-3 text-left">
                      Specialty
                    </th>
                    {products.map((product) => (
                      <th
                        key={product.id}
                        className="border-secondary-light border-b-[0.8px] px-4 py-3 text-center"
                      >
                        <div>{product.name.split(" ")[0]}</div>
                        <div>{product.name.split(" ").slice(1).join(" ")}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedDoctors.map((doctor) => (
                    <tr
                      key={doctor.id}
                      className="hover:bg-secondary-very-light *:border-secondary-light *:border-b *:px-4 *:py-4"
                    >
                      <td>
                        <div>
                          <p className="text-sm/5 font-normal text-[#0F172A]">
                            {doctor.name}
                          </p>
                          <p className="text-secondary-text text-xs/4 font-normal">
                            {doctor.hospital}
                          </p>
                        </div>
                      </td>
                      <td>
                        <p className="w-fit rounded-full border-[0.8px] border-[#E2E8F0] px-2 py-0.5 text-xs/4 font-medium text-[#0F172A]">
                          {doctor.specialty}
                        </p>
                      </td>
                      {products.map((product) => (
                        <td key={product.id}>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={allocations[doctor.id]?.[product.id] || ""}
                            onChange={(e) =>
                              handleAllocationChange(
                                doctor.id,
                                product.id,
                                e.target.value,
                              )
                            }
                            disabled={isPending}
                            className="bg-secondary-very-light h-9 w-20 text-center"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-secondary-text text-sm">
                  Showing {startIndex + 1}-{Math.min(endIndex, doctors.length)}{" "}
                  of {doctors.length} doctors
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || isPending}
                    variant="outline"
                    size="sm"
                    className="border-secondary-light"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page) => (
                      <Button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        disabled={isPending}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className={
                          currentPage === page
                            ? "bg-system-primary text-white"
                            : "border-secondary-light"
                        }
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    type="button"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || isPending}
                    variant="outline"
                    size="sm"
                    className="border-secondary-light"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    disabled={isPending}
                    className={"input"}
                    placeholder="Add any notes about your forecast strategy..."
                    rows={4}
                  />
                </FormControl>
                <FormMessage className="absolute -bottom-6 left-1" />
              </FormItem>
            )}
          />
          <footer className="flex items-center justify-start gap-32 rounded-[10px] border-[0.8px] border-[#BFDBFE] bg-[#EFF6FF] p-4">
            <p className="text-secondary-text text-sm/5 font-normal">
              Total Units Planned
              <span className="block text-2xl/7 font-normal text-black">
                {totals.totalUnitsPlanned}
              </span>
            </p>
            <p className="text-secondary-text text-sm/5 font-normal">
              Doctors Covered
              <span className="block text-2xl/7 font-normal text-black">
                {totals.doctorsCovered}
              </span>
            </p>
            <p className="text-secondary-text text-sm/5 font-normal">
              Products Used
              <span className="block text-2xl/7 font-normal text-black">
                {totals.productsUsed} / {products.length}
              </span>
            </p>
          </footer>
          {error && (
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm/5 font-medium text-red-800">{error}</p>
            </div>
          )}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              variant="outline"
              className="border-secondary-light hover:bg-secondary-very-light cursor-pointer rounded-lg border px-6 py-2.5 text-sm/5 font-medium text-black"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="button-system-gradient-primary"
            >
              <Send size={16} />
              Submit for Approval
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}
