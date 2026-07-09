"use client";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  CircleCheckBig,
  Plus,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import {
  coachingReviewSchema,
  type CoachingReviewFormValues,
} from "../../lib/schemas";
import { createCoachingReportAction } from "../../api/create";
import {
  getSupervisorTeamAction,
  getManagerTeamAction,
} from "@/features/team/api";
import { getDoctorsAction } from "@/features/doctors/api";
import { toast } from "@/lib/utils/toast";
import type { User } from "@/features/team/lib/types";
import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";

const ReviewForm = () => {
  const router = useRouter();
  const { role } = useRoleUI();
  const [isPending, startTransition] = useTransition();
  const [reps, setReps] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<DoctorApiResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<CoachingReviewFormValues>({
    resolver: zodResolver(coachingReviewSchema),
    defaultValues: {
      repId: "",
      doctorId: "",
      visitDate: undefined,
      visitDuration: "",
      visitLocation: "",
      performanceRating: 0,
      visitPros: "",
      visitCons: "",
      recommendations: "",
      actionItems: "",
      notes: "",
    },
  });

  // Fetch reps and doctors on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch team members based on role
        let repsResult;
        if (role === "MANAGER") {
          // Manager fetches medical reps from their team
          repsResult = await getManagerTeamAction("MEDICAL_REP");
          if (repsResult.success && repsResult.medicalReps) {
            setReps(repsResult.medicalReps);
          }
        } else {
          // Supervisor fetches their team
          repsResult = await getSupervisorTeamAction();
          if (repsResult.success && repsResult.members) {
            setReps(repsResult.members);
          }
        }

        // Fetch doctors
        const doctorsResult = await getDoctorsAction();
        if (doctorsResult.success && doctorsResult.data) {
          setDoctors(doctorsResult.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error({ title: "Failed to load reps and doctors" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [role]);

  const onSubmit = (values: CoachingReviewFormValues) => {
    startTransition(async () => {
      try {
        const result = await createCoachingReportAction(values);

        if (result.success) {
          toast.success({ title: "Joint visit review submitted successfully" });
          form.reset();
          router.refresh();
        } else {
          toast.error({
            title: result.error?.message || "Failed to submit review",
          });
        }
      } catch (error) {
        console.error("Submit error:", error);
        toast.error({ title: "An unexpected error occurred" });
      }
    });
  };

  return (
    <Card className="border-secondary-light w-full rounded-xl border bg-white p-0 pb-6 shadow-none">
      <CardHeader className="bg-dashboard-blue rounded-t-xl p-6 text-base/4 font-normal text-white">
        Document: Joint Visit Review
      </CardHeader>

      <CardContent className="flex flex-col gap-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Visit Information */}
            <section aria-labelledby="visit-info">
              <h2
                id="visit-info"
                className="text-[17px]/6 font-semibold text-black"
              >
                Visit Information
              </h2>

              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Medical Rep */}
                <FormField
                  control={form.control}
                  name="repId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm/[14px] font-medium text-black">
                        Medical Representative *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-secondary-very-light data-placeholder:text-secondary-text w-full border-[0.8px] border-[#E2E8F0] px-3 py-1 text-sm leading-5 font-normal text-black shadow-none">
                            <SelectValue placeholder="Select rep" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {reps.map((rep) => (
                            <SelectItem key={rep.id} value={rep.id}>
                              {rep.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Doctor Name */}
                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm/[14px] font-medium text-black">
                        Doctor Name *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-secondary-very-light data-placeholder:text-secondary-text w-full border-[0.8px] border-[#E2E8F0] px-3 py-1 text-sm leading-5 font-normal text-black shadow-none">
                            <SelectValue placeholder="Select doctor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              {doctor.nameAR} - {doctor.nameEN} -{" "}
                              {doctor.subRegion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Visit Date */}
                <FormField
                  control={form.control}
                  name="visitDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm/[14px] font-medium text-black">
                        Visit Date *
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="bg-secondary-very-light placeholder:text-secondary-text w-full justify-start border-[0.8px] border-[#E2E8F0] px-3 py-1 text-left text-sm leading-5 font-normal text-black shadow-none"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span className="text-secondary-text">
                                  Select date
                                </span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Visit Duration */}
                <FormField
                  control={form.control}
                  name="visitDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm/[14px] font-medium text-black">
                        Visit Duration *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-secondary-very-light data-placeholder:text-secondary-text w-full border-[0.8px] border-[#E2E8F0] px-3 py-1 text-sm leading-5 font-normal text-black shadow-none">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="15 min">15 minutes</SelectItem>
                          <SelectItem value="30 min">30 minutes</SelectItem>
                          <SelectItem value="45 min">45 minutes</SelectItem>
                          <SelectItem value="60 min">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Location full width */}
                <div className="col-span-1 md:col-span-2">
                  <FormField
                    control={form.control}
                    name="visitLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm/[14px] font-medium text-black">
                          Visit Location *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-secondary-very-light placeholder:text-secondary-text border-[0.8px] border-[#E2E8F0] px-3 py-1 text-sm leading-5 font-normal text-black shadow-none placeholder:text-sm placeholder:leading-5 placeholder:font-normal"
                            placeholder="King Faisal Hospital - Cardiology Department"
                          />
                        </FormControl>
                        <FormMessage className="text-sm text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </section>

            {/* Performance Rating */}
            <section className="" aria-labelledby="performance">
              <h2
                id="performance"
                className="text-[17px]/6 font-semibold text-black"
              >
                Performance Rating
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="performanceRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm/[14px] font-medium text-black">
                        Overall Performance *
                      </FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseFloat(value))
                        }
                        value={field.value ? field.value.toString() : ""}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-secondary-very-light data-placeholder:text-secondary-text w-full border-[0.8px] border-[#E2E8F0] px-3 py-1 text-sm leading-5 font-normal text-black shadow-none">
                            <SelectValue placeholder="Rate the visit performance" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 - Poor</SelectItem>
                          <SelectItem value="2">2 - Fair</SelectItem>
                          <SelectItem value="3">3 - Good</SelectItem>
                          <SelectItem value="4">4 - Very Good</SelectItem>
                          <SelectItem value="5">5 - Excellent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* Visit Assessment */}
            <section className="" aria-labelledby="assessment">
              <h2
                id="assessment"
                className="text-[17px]/6 font-semibold text-black"
              >
                Visit Assessment
              </h2>

              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Pros */}
                <FormField
                  control={form.control}
                  name="visitPros"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-2 flex items-center gap-2">
                        <ThumbsUp className="text-dashboard-green h-4 w-4" />
                        <FormLabel className="text-sm/[14px] font-medium text-black">
                          What Went Well (Pros) *
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-secondary-very-light text-secondary-text placeholder:text-secondary-text max-h-37.5 min-h-30 border-[0.8px] border-[#E2E8F0] px-3 py-2 text-sm/5 font-normal shadow-none placeholder:text-sm placeholder:leading-5 placeholder:font-normal"
                          placeholder="List positive aspects of the visit"
                        />
                      </FormControl>
                      <p className="text-secondary-dark mt-2 text-base/6 font-normal">
                        Enter each point on a new line
                      </p>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Cons */}
                <FormField
                  control={form.control}
                  name="visitCons"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-2 flex items-center gap-2">
                        <ThumbsDown className="text-dashboard-red h-4 w-4" />
                        <FormLabel className="text-sm/[14px] font-medium text-black">
                          Areas for Improvement (Cons) *
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-secondary-very-light text-secondary-text placeholder:text-secondary-text max-h-37.5 min-h-30 border-[0.8px] border-[#E2E8F0] px-3 py-2 text-sm/5 font-normal shadow-none placeholder:text-sm placeholder:leading-5 placeholder:font-normal"
                          placeholder="List areas that need improvement"
                        />
                      </FormControl>
                      <p className="text-secondary-dark mt-2 text-base/6 font-normal">
                        Enter each point on a new line
                      </p>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* Recommendations */}
            <section className="" aria-labelledby="recommendations">
              <FormField
                control={form.control}
                name="recommendations"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-2 flex items-center gap-2">
                      <TrendingUp className="text-dashboard-blue h-4 w-4" />
                      <FormLabel
                        id="recommendations"
                        className="text-sm/[14px] font-medium text-black"
                      >
                        Recommendations & Coaching Points *
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="bg-secondary-very-light placeholder:text-secondary-text max-h-22.5 min-h-15 border-[0.8px] border-[#E2E8F0] px-3 py-1 text-sm leading-5 font-normal text-black shadow-none placeholder:text-sm placeholder:leading-5 placeholder:font-normal"
                        placeholder="Provide specific recommendations for improvement and coaching guidance…"
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />
            </section>

            {/* Action Items */}
            <section className="" aria-labelledby="actions">
              <FormField
                control={form.control}
                name="actionItems"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-2 flex items-center gap-2">
                      <CircleCheckBig className="text-dashboard-orange h-4 w-4" />
                      <FormLabel
                        id="actions"
                        className="text-sm/[14px] font-medium text-black"
                      >
                        Action Items & Next Steps
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="bg-secondary-very-light placeholder:text-secondary-text max-h-37.5 min-h-30 border-[0.8px] border-[#E2E8F0] px-3 py-1 text-sm leading-5 font-normal text-black shadow-none placeholder:text-sm placeholder:leading-5 placeholder:font-normal"
                        placeholder="List specific action items"
                      />
                    </FormControl>
                    <p className="text-secondary-dark mt-2 text-base/6 font-normal">
                      Enter each action on a new line
                    </p>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />
            </section>

            {/* Notes */}
            <section className="" aria-labelledby="notes">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      id="notes"
                      className="text-sm/[14px] font-medium text-black"
                    >
                      Overall Notes & Observations
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="bg-secondary-very-light placeholder:text-secondary-text mt-2 max-h-22.5 min-h-15 border-[0.8px] border-[#E2E8F0] px-3 py-1 text-sm leading-5 font-normal text-black shadow-none placeholder:text-sm placeholder:leading-5 placeholder:font-normal"
                        placeholder="Additional observations, context, or notes about the visit…"
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />
            </section>

            {/* Actions */}
            <section className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-dashboard-blue border-dashboard-blue hover:text-dashboard-blue cursor-pointer border text-white hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {isPending ? "Saving..." : "Save Review"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-secondary-light cursor-pointer"
                onClick={() => form.reset()}
                disabled={isPending}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </section>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
