"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createForecastSchema,
  type CreateForecastFormValues,
} from "../lib/schemas";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/utils/toast";
import { Product, Doctor } from "../lib/types";
import {
  getProductsAction,
  getMyDoctorsAction,
  submitForecastAction,
} from "../api";
import { Send, ChevronLeft, ChevronRight } from "lucide-react";
import { getSaudiYear } from "@/lib/utils";
import { ForecastStepper, ForecastStepId } from "./ForecastStepper";
import { ForecastSetupStep } from "./ForecastSetupStep";
import { ForecastProductStep } from "./ForecastProductStep";
import { ForecastAllocationStep } from "./ForecastAllocationStep";
import { ForecastReviewStep } from "./ForecastReviewStep";

export default function CreateForecastForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<ForecastStepId>(1);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [allocations, setAllocations] = useState<
    Record<string, Record<string, number>>
  >({});

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
        // Pre-select first 3 products as default suggestions if available
        if (productsResult.data.length > 0) {
          setSelectedProductIds(productsResult.data.slice(0, 3).map((p) => p.id));
        }
      }
      if (doctorsResult.success && doctorsResult.data) {
        setDoctors(doctorsResult.data);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const selectedProducts = useMemo(
    () => products.filter((p) => selectedProductIds.includes(p.id)),
    [products, selectedProductIds]
  );

  const handleToggleProduct = (productId: string) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const handleClearAllProducts = () => {
    setSelectedProductIds([]);
  };

  const handleAllocationChange = (
    doctorId: string,
    productId: string,
    units: number
  ) => {
    setAllocations((prev) => ({
      ...prev,
      [doctorId]: {
        ...prev[doctorId],
        [productId]: units,
      },
    }));
  };

  // Step Navigation Validation
  const validateStep = (step: ForecastStepId): boolean => {
    setError("");

    if (step === 1) {
      const values = form.getValues();
      if (!values.periodType) {
        setError("Please select a period type");
        return false;
      }
      if (values.periodType === "MONTHLY" && !values.month) {
        setError("Please select a month");
        return false;
      }
      if (values.periodType === "QUARTERLY" && !values.quarter) {
        setError("Please select a quarter");
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (selectedProductIds.length === 0) {
        setError("Please select at least one product to include in the forecast");
        toast.error({
          title: "Selection Required",
          description: "Please select at least one product to proceed",
        });
        return false;
      }
      return true;
    }

    if (step === 3) {
      let hasAllocations = false;
      Object.values(allocations).forEach((docAlloc) => {
        Object.values(docAlloc).forEach((units) => {
          if (units > 0) hasAllocations = true;
        });
      });

      if (!hasAllocations) {
        setError("Please allocate units to at least one doctor");
        toast.error({
          title: "Allocations Required",
          description: "Please allocate units to at least one doctor to proceed",
        });
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1) as ForecastStepId);
    }
  };

  const handleBack = () => {
    setError("");
    setCurrentStep((prev) => Math.max(1, prev - 1) as ForecastStepId);
  };

  const handleGoToStep = (step: ForecastStepId) => {
    setError("");
    setCurrentStep(step);
  };

  const onSubmit = async () => {
    setError("");

    // Convert allocations to distributions format
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

    if (distributions.length === 0) {
      setError("Please allocate products to at least one doctor");
      toast.error({
        title: "Validation Error",
        description: "Please allocate products to at least one doctor",
      });
      return;
    }

    form.setValue("distributions", distributions);

    const isValid = await form.trigger();
    if (!isValid) {
      const errors = form.formState.errors;
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

    startTransition(async () => {
      try {
        const result = await submitForecastAction({
          ...form.getValues(),
          allocations,
        });

        if (result.success) {
          toast.success({
            title: "Forecast submitted for approval",
            description: "Your supervisor will review your forecast submission",
          });
          router.push("/rep/forecast");
        } else {
          setError(result.error?.message || "Failed to submit forecast");
          toast.error({
            title: "Submission Failed",
            description: result.error?.message || "Failed to submit forecast",
          });
        }
      } catch {
        setError("An unexpected error occurred");
        toast.error({
          title: "Error",
          description: "An unexpected error occurred",
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="rounded-[14px] border border-[#E5E8EF] bg-white overflow-hidden p-8 space-y-6">
        <div className="h-16 w-full animate-pulse rounded-[12px] bg-[#F4F6FA]" />
        <div className="h-64 w-full animate-pulse rounded-[12px] bg-[#F4F6FA]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stepper Header Navigation */}
      <ForecastStepper
        currentStep={currentStep}
        onStepClick={handleGoToStep}
        maxAccessibleStep={4}
      />

      {/* Main Form Container */}
      <div className="rounded-[14px] border border-[#E5E8EF] bg-white shadow-none overflow-hidden">
        <Form {...form}>
          <div className="p-6 md:p-8">
            {currentStep === 1 && (
              <ForecastSetupStep
                form={form}
                years={years}
                isPending={isPending}
              />
            )}

            {currentStep === 2 && (
              <ForecastProductStep
                products={products}
                selectedProductIds={selectedProductIds}
                onToggleProduct={handleToggleProduct}
                onClearAll={handleClearAllProducts}
              />
            )}

            {currentStep === 3 && (
              <ForecastAllocationStep
                doctors={doctors}
                selectedProducts={selectedProducts}
                allocations={allocations}
                onAllocationChange={handleAllocationChange}
                isPending={isPending}
              />
            )}

            {currentStep === 4 && (
              <ForecastReviewStep
                form={form}
                selectedProducts={selectedProducts}
                doctors={doctors}
                allocations={allocations}
                onGoToStep={handleGoToStep}
                isPending={isPending}
                validationError={error}
              />
            )}

            {/* Sticky Action Footer */}
            <div className="mt-8 flex items-center justify-between border-t border-[#EEF1F6] pt-5">
              <div>
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    onClick={handleBack}
                    disabled={isPending}
                    variant="outline"
                    className="h-10 rounded-[10px] border border-[#E5E8EF] px-5 text-sm font-semibold text-[#344054] hover:bg-[#F9FAFB]"
                  >
                    <ChevronLeft className="mr-1.5 size-4" />
                    Back
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => router.push("/rep/forecast")}
                    disabled={isPending}
                    variant="outline"
                    className="h-10 rounded-[10px] border border-[#E5E8EF] px-5 text-sm font-semibold text-[#344054] hover:bg-[#F9FAFB]"
                  >
                    Cancel
                  </Button>
                )}
              </div>

              <div>
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isPending}
                    className="h-10 rounded-[10px] bg-gp-rep-primary px-6 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(22,133,87,0.22)] transition-all duration-[170ms] hover:bg-gp-rep-primary-hover focus-visible:ring-2 focus-visible:ring-[#168557]/30"
                  >
                    Continue
                    <ChevronRight className="ml-1.5 size-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={isPending}
                    className="h-10 rounded-[10px] bg-gp-rep-primary px-6 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(22,133,87,0.22)] transition-all duration-[170ms] hover:bg-gp-rep-primary-hover focus-visible:ring-2 focus-visible:ring-[#168557]/30"
                  >
                    {isPending ? (
                      <>
                        <span className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={16} className="mr-1.5" />
                        Submit Forecast
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
