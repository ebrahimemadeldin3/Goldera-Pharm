"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import {
  visitReportSchema,
  VisitReportFormValues,
} from "../lib/schemas/report";
import { createVisitReportAction } from "../api/reports";
import { toast } from "@/lib/utils/toast";
import { useVisitCompletionLocation } from "../hooks/useVisitCompletionLocation";
import {
  isFreshVisitCompletionLocation,
  normalizeVisitCompletionLocation,
} from "../lib/utils/completion-location";
import VisitLocationVerification from "./VisitLocationVerification";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Stethoscope, Clock, MapPin, Save } from "lucide-react";
import { VisitReportData } from "../lib/types/report";
import { format } from "date-fns";
import { ProductApiResponse } from "@/features/products/lib/types";

type VisitReportFormProps = {
  visitData: VisitReportData;
  products: ProductApiResponse[];
};

const ratingOptions = [1, 2, 3, 4, 5];

export default function VisitReportForm({
  visitData,
  products,
}: VisitReportFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const {
    status: locationStatus,
    location: capturedLocation,
    error,
    errorCode,
    captureLocation,
    refreshLocation,
    markStale,
    isFresh: isLocationFresh,
  } = useVisitCompletionLocation();

  const form = useForm<VisitReportFormValues>({
    resolver: zodResolver(visitReportSchema),
    defaultValues: {
      visitId: visitData.id,
      duration: "15 min",
      rating: "",
      discussedTopicsText: "",
      doctorFeedback: "",
      visitPurpose: "",
      notes: "",
      samplesProvided: [],
      completionLocation: null,
    },
  });

  const selectedSamples =
    useWatch({ control: form.control, name: "samplesProvided" }) || [];

  useEffect(() => {
    if (locationStatus === "verified" && capturedLocation) {
      form.setValue("completionLocation", capturedLocation, {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.clearErrors("completionLocation");
    }
  }, [capturedLocation, form, locationStatus]);

  const toggleSample = (productName: string, checked: boolean) => {
    const nextValues = checked
      ? [...selectedSamples, productName]
      : selectedSamples.filter((item) => item !== productName);

    form.setValue("samplesProvided", nextValues, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = (data: VisitReportFormValues) => {
    if (isSubmitting) {
      return;
    }

    const completionLocation = normalizeVisitCompletionLocation(capturedLocation);

    if (!completionLocation || locationStatus !== "verified") {
      form.setError("completionLocation", {
        type: "manual",
        message: "Verify your current location to complete this visit.",
      });
      return;
    }

    if (!isFreshVisitCompletionLocation(completionLocation)) {
      markStale();
      form.setError("completionLocation", {
        type: "manual",
        message:
          "Your location was verified some time ago. Verify your current location again before completing this visit.",
      });
      return;
    }

    setIsSubmitting(true);

    startTransition(async () => {
      const result = await createVisitReportAction({
        ...data,
        completionLocation,
      });

      if (result.success) {
        toast.success({
          title: "Visit completed",
          description: `Your visit with ${visitData.doctor.name} was completed successfully.`,
        });
        router.push("/rep/visits");
      } else {
        toast.error({
          title: "Couldn't complete visit",
          description:
            result.error?.message ||
            "The visit report could not be submitted. Your information has been preserved.",
        });
        setIsSubmitting(false);
      }
    });
  };

  const submitDisabled =
    isPending ||
    isSubmitting ||
    locationStatus === "requesting" ||
    locationStatus !== "verified" ||
    !isLocationFresh;
  const locationFormError = form.formState.errors.completionLocation?.message;

  return (
    <div className="flex flex-col gap-6">
      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-4 rounded-[16px] border border-[#E5E8EF] bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-[10px] bg-[#EDF4FF] text-[#3972D5]">
            <Stethoscope className="size-5" />
          </div>
          <div>
            <span className="block text-xs font-medium text-[#667085]">
              Doctor
            </span>
            <span className="text-sm font-semibold text-[#182033]">
              {visitData.doctor.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-[10px] bg-[#E9F8F1] text-[#168557]">
            <Clock className="size-5" />
          </div>
          <div>
            <span className="block text-xs font-medium text-[#667085]">
              Visit Time
            </span>
            <span className="text-sm font-semibold text-[#182033]">
              {format(new Date(visitData.visitTime), "MMM d, yyyy h:mm a")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-[10px] bg-[#F6F8FB] text-[#344054]">
            <MapPin className="size-5" />
          </div>
          <div>
            <span className="block text-xs font-medium text-[#667085]">
              Location
            </span>
            <span className="text-sm font-semibold text-[#182033]">
              {visitData.location}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-[10px] bg-[#FFF8E5] text-[#8A6515]">
            <Save className="size-5" />
          </div>
          <div>
            <span className="block text-xs font-medium text-[#667085]">
              Visit Status
            </span>
            <span className="text-sm font-semibold text-[#182033]">
              {visitData.status || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-6 xl:grid-cols-2"
        >
          {/* Left Panel - Visit Details */}
          <div className="border-secondary-light rounded-[14px] border bg-white p-6">
            <h2 className="mb-6 text-xl/6 font-normal text-black">
              Visit Details
            </h2>
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Visit Duration
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="e.g., 15 min"
                        className="input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Overall Visit Rating
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        {ratingOptions.map((value) => {
                          const active = Number(field.value || 0) >= value;

                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => field.onChange(String(value))}
                              className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
                                active
                                  ? "border-yellow-500 bg-yellow-50"
                                  : "border-secondary-light bg-white"
                              }`}
                              aria-label={`Rate ${value} out of 5`}
                            >
                              <Star
                                size={18}
                                className={
                                  active
                                    ? "fill-yellow-500 text-yellow-500"
                                    : "text-secondary-dark"
                                }
                              />
                            </button>
                          );
                        })}
                        <span className="text-secondary-dark text-sm">
                          {field.value ? `${field.value}/5` : "Select"}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visitPurpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Visit Purpose <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What was the main purpose of this visit?"
                        className="input min-h-15 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discussedTopicsText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Discussed Topics <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add topics separated by comma or new line"
                        className="input min-h-20 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="doctorFeedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Doctor&apos;s Feedback
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What was the doctor's response or feedback?"
                        className="input min-h-15 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any other notes or observations about the visit?"
                        className="input min-h-20 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Right Panel - Samples Provided */}
          <div className="border-secondary-light rounded-[14px] border bg-white p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl/6 font-normal text-black">
                Samples Provided
              </h2>
              <span className="rounded-md border border-[#CBEFDD] bg-[#E9F8F1] px-2.5 py-0.5 text-xs font-semibold text-[#168557]">
                {selectedSamples.length} Selected
              </span>
            </div>

            <FormField
              control={form.control}
              name="samplesProvided"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Select Products
                  </FormLabel>
                  <FormControl>
                    <div className="border-secondary-light max-h-80 space-y-2 overflow-auto rounded-md border p-3">
                      {products.length === 0 ? (
                        <p className="text-secondary-dark text-sm">
                          No products available
                        </p>
                      ) : (
                        products.map((product) => {
                          const checked = field.value.includes(product.name);

                          return (
                            <label
                              key={product.id}
                              className="border-secondary-light flex cursor-pointer items-center gap-3 rounded-md border p-2"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) =>
                                  toggleSample(product.name, Boolean(value))
                                }
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-black">
                                  {product.name}
                                </span>
                                <span className="text-secondary-dark text-xs">
                                  {product.internalRef}
                                </span>
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="xl:col-span-2">
            <VisitLocationVerification
              status={locationStatus}
              location={capturedLocation}
              error={error || errorCode}
              isFresh={isLocationFresh}
              disabled={isPending || isSubmitting}
              onVerify={() => {
                form.clearErrors("completionLocation");
                void captureLocation();
              }}
              onRefresh={() => {
                form.clearErrors("completionLocation");
                void refreshLocation();
              }}
            />
            {locationFormError && (
              <p
                className="mt-2 text-sm font-medium text-[#B42318]"
                role="alert"
              >
                {locationFormError}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col items-stretch gap-2 sm:items-end xl:col-span-2">
            {submitDisabled && locationStatus !== "verified" && (
              <p className="text-sm font-medium text-[#667085]">
                Verify your current location to complete this visit.
              </p>
            )}
            <Button
              type="submit"
              disabled={submitDisabled}
              className="bg-gp-rep-primary hover:bg-gp-rep-primary-hover inline-flex h-11 cursor-pointer items-center gap-2 rounded-[10px] px-5 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(22,133,87,0.22)] transition-all"
            >
              <Save size={16} />
              {isPending || isSubmitting
                  ? "Submitting..."
                  : "Submit Report"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
