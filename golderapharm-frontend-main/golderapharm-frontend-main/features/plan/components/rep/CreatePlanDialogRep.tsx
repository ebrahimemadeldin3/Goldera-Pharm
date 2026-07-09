"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import {
  createVisitPlanSchema,
  type CreateVisitPlanFormValues,
} from "../../lib/schemas";
import { toast } from "@/lib/utils/toast";
import { getDoctorsAction } from "@/features/doctors/api";
import {
  Plus,
  Calendar as CalendarIcon,
  FileText,
  Send,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  cn,
  formatDateOnly,
  formatSaudiDateDisplay,
  formatSaudiWeekday,
} from "@/lib/utils";
import { eachDayOfInterval } from "date-fns";
import { createVisitPlanAction } from "@/features/plan/api/create";
import type { UserRole } from "@/lib/types";
import { useRouter } from "next/navigation";

type HospitalWithDoctors = {
  name: string;
  doctors: DoctorApiResponse[];
};

type Props = {
  userRole: UserRole;
  userSubRegionName: string | null;
};

export default function CreatePlanDialogRep({
  userRole,
  userSubRegionName,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hospitalsWithDoctors, setHospitalsWithDoctors] = useState<
    HospitalWithDoctors[]
  >([]);
  const [dayHospitalSelections, setDayHospitalSelections] = useState<
    Record<string, string>
  >({});
  const [dayDoctorAssignments, setDayDoctorAssignments] = useState<
    Record<string, string[]>
  >({});
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    if (!open) return;

    const subRegionFilter =
      userRole !== "MANAGER" && userSubRegionName
        ? userSubRegionName
        : undefined;

    getDoctorsAction(subRegionFilter, undefined, undefined, false).then((result) => {
      if (result.success && result.data) {
        let allDoctors = result.data;

        if (subRegionFilter) {
          allDoctors = allDoctors.filter(
            (doctor) => doctor.subRegion === subRegionFilter,
          );
        }

        const grouped = allDoctors.reduce((acc, doctor) => {
          const hospitalName = doctor.accountName || "Unassigned";
          const existing = acc.find(
            (hospital) => hospital.name === hospitalName,
          );
          if (existing) {
            existing.doctors.push(doctor);
          } else {
            acc.push({ name: hospitalName, doctors: [doctor] });
          }
          return acc;
        }, [] as HospitalWithDoctors[]);

        setHospitalsWithDoctors(grouped);
      }
    });
  }, [open, userRole, userSubRegionName]);

  const form = useForm<CreateVisitPlanFormValues>({
    resolver: zodResolver(createVisitPlanSchema),
    defaultValues: {
      planType: "WEEKLY",
      title: "",
      startDate: undefined,
      endDate: undefined,
      description: "",
      objectives: "",
      doctorsWithDates: [],
      targetVisits: 1,
    },
  });

  const planType = useWatch({ control: form.control, name: "planType" });
  const startDate = useWatch({ control: form.control, name: "startDate" });
  const endDate = useWatch({ control: form.control, name: "endDate" });

  const doctorsByHospital = useMemo(() => {
    const map = new Map<string, DoctorApiResponse[]>();
    hospitalsWithDoctors.forEach((hospital) => {
      map.set(hospital.name, hospital.doctors);
    });
    return map;
  }, [hospitalsWithDoctors]);

  const doctorsById = useMemo(() => {
    const map = new Map<string, DoctorApiResponse>();
    hospitalsWithDoctors.forEach((hospital) => {
      hospital.doctors.forEach((doctor) => {
        map.set(doctor.id, doctor);
      });
    });
    return map;
  }, [hospitalsWithDoctors]);

  const daysInRange = useMemo(() => {
    if (!startDate || !endDate) {
      return [];
    }

    if (startDate > endDate) {
      return [];
    }

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  const mappedDoctorsWithDates = useMemo(() => {
    return daysInRange.flatMap((date) => {
      const dayKey = formatDateOnly(date);
      const doctorIds = dayDoctorAssignments[dayKey] ?? [];

      if (doctorIds.length === 0) {
        return [];
      }

      return doctorIds.map((doctorId) => ({ doctorId, visitDate: date }));
    });
  }, [dayDoctorAssignments, daysInRange]);

  useEffect(() => {
    form.setValue("doctorsWithDates", mappedDoctorsWithDates, {
      shouldValidate: true,
    });
  }, [form, mappedDoctorsWithDates]);

  const handleSubmit = (values: CreateVisitPlanFormValues) => {
    const hasUnassignedDay = daysInRange.some((date) => {
      const dayKey = formatDateOnly(date);
      const dayDoctors = dayDoctorAssignments[dayKey] ?? [];
      return dayDoctors.length === 0;
    });

    if (hasUnassignedDay) {
      toast.error({
        title: "Doctor assignment required",
        description:
          "Please select at least one doctor for each day in the selected range.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await createVisitPlanAction({
          ...values,
          doctorsWithDates: mappedDoctorsWithDates,
        });
        if (result.success) {
          form.reset();
          setOpen(false);
          setDayHospitalSelections({});
          setDayDoctorAssignments({});
          setCollapsedDays({});
          router.refresh();
          toast.success({
            title: "Visit plan submitted successfully",
            description: values.title,
          });
        } else {
          toast.error({
            title: "Failed to submit visit plan",
            description: result.error?.message || "Please try again",
          });
        }
      } catch {
        toast.error({
          title: "An unexpected error occurred",
          description: "Please try again later",
        });
      }
    });
  };

  const assignedDaysCount = daysInRange.filter((date) => {
    const dayKey = formatDateOnly(date);
    return (dayDoctorAssignments[dayKey] ?? []).length > 0;
  }).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="button-system-gradient-primary">
          <Plus size={16} />
          Create New Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] !w-[98vw] !max-w-[1400px] overflow-hidden p-0 sm:!max-w-[95vw] lg:!max-w-[1320px]">
        <DialogHeader className="border-b px-6 pt-6 pb-4">
          <DialogTitle>Create New Visit Plan</DialogTitle>
          <DialogDescription>
            Select doctors from different hospitals to create your visit plan
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <div className="overflow-y-auto px-6 py-5">
            <div className="grid gap-6 lg:grid-cols-[minmax(360px,440px)_minmax(0,1fr)]">
              <div className="bg-secondary-very-light/30 space-y-4 rounded-xl border p-4">
                <p className="text-secondary-dark text-xs">
                  Date selection uses Saudi Arabia timezone (Asia/Riyadh).
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => form.setValue("planType", "WEEKLY")}
                    className={cn(
                      "flex h-9 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border-[0.8px] text-sm/5",
                      planType === "WEEKLY"
                        ? "gradient-green text-white"
                        : "border-[#E2E8F0] bg-white text-black hover:bg-gray-200",
                    )}
                  >
                    <CalendarIcon size={16} />
                    Weekly Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => form.setValue("planType", "MONTHLY")}
                    className={cn(
                      "flex h-9 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border-[0.8px] text-sm/5",
                      planType === "MONTHLY"
                        ? "gradient-green text-white"
                        : "border-[#E2E8F0] bg-white text-black hover:bg-gray-200",
                    )}
                  >
                    <FileText size={16} />
                    Monthly Plan
                  </button>
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Plan Title <span className="text-dashboard-red">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-secondary-very-light"
                          placeholder="e.g., Week 47 - Hospital Coverage"
                        />
                      </FormControl>
                      <FormMessage className="text-dashboard-red text-sm" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Start Date{" "}
                          <span className="text-dashboard-red">*</span>
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="bg-secondary-very-light w-full cursor-pointer justify-start text-left"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value
                                  ? formatSaudiDateDisplay(field.value)
                                  : "Select date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-dashboard-red text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          End Date <span className="text-dashboard-red">*</span>
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="bg-secondary-very-light w-full cursor-pointer justify-start text-left"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value
                                  ? formatSaudiDateDisplay(field.value)
                                  : "Select date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-dashboard-red text-sm" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="targetVisits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Target Visits{" "}
                        <span className="text-dashboard-red">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          onChange={(event) =>
                            field.onChange(
                              parseInt(event.target.value, 10) || 1,
                            )
                          }
                          className="bg-secondary-very-light"
                          placeholder="Enter target number of visits"
                        />
                      </FormControl>
                      <FormMessage className="text-dashboard-red text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Briefly describe the focus and goals of this plan..."
                          rows={3}
                          className="bg-secondary-very-light resize-none"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="objectives"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objectives (one per line)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="List your objectives, one per line..."
                          rows={4}
                          className="bg-secondary-very-light resize-none"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 *:flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      form.reset();
                      setDayHospitalSelections({});
                      setDayDoctorAssignments({});
                      setCollapsedDays({});
                    }}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={form.handleSubmit(handleSubmit)}
                    disabled={
                      isPending ||
                      daysInRange.length === 0 ||
                      assignedDaysCount !== daysInRange.length
                    }
                    className="button-system-gradient-primary disabled:opacity-50"
                  >
                    {isPending ? (
                      <>Submitting...</>
                    ) : (
                      <>
                        <Send size={16} />
                        Submit for Approval
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-secondary-very-light/30 min-w-0 rounded-xl border p-4">
                <h3 className="text-sm/6 font-normal text-[#0F172A]">
                  Assign Doctors By Day{" "}
                  <span className="text-dashboard-red">*</span>
                </h3>
                <p className="text-secondary-dark mb-2 text-sm/5 font-normal">
                  Select a hospital to browse doctors. Previously selected
                  doctors stay selected.
                </p>

                {assignedDaysCount > 0 && (
                  <p className="text-dashboard-green mb-2 text-xs">
                    {assignedDaysCount}/{daysInRange.length} days assigned
                  </p>
                )}

                {form.formState.errors.doctorsWithDates && (
                  <p className="text-dashboard-red mb-2 text-sm">
                    Please assign doctors for all days in the timeline
                  </p>
                )}

                <div className="max-h-[62vh] space-y-3 overflow-y-auto pr-1">
                  {daysInRange.length === 0 ? (
                    <div className="text-secondary-dark py-8 text-center text-sm">
                      Please set a valid start and end date
                    </div>
                  ) : hospitalsWithDoctors.length === 0 ? (
                    <div className="text-secondary-dark py-8 text-center text-sm">
                      No hospitals/doctors are available for your account
                    </div>
                  ) : (
                    daysInRange.map((date) => {
                      const dayKey = formatDateOnly(date);
                      const selectedHospitalRaw =
                        dayHospitalSelections[dayKey] || "";
                      const selectedHospital = doctorsByHospital.has(
                        selectedHospitalRaw,
                      )
                        ? selectedHospitalRaw
                        : "";
                      const availableDoctorsForDay = selectedHospital
                        ? (doctorsByHospital.get(selectedHospital) ?? [])
                        : [];
                      const selectedDoctorIds =
                        dayDoctorAssignments[dayKey] ?? [];
                      const selectedDoctors = selectedDoctorIds
                        .map((doctorId) => doctorsById.get(doctorId))
                        .filter((doctor): doctor is DoctorApiResponse =>
                          Boolean(doctor),
                        );
                      const selectedDoctorsByHospital = selectedDoctors.reduce(
                        (acc, doctor) => {
                          const hospitalName =
                            doctor.accountName || "Unassigned";
                          if (!acc[hospitalName]) {
                            acc[hospitalName] = [];
                          }
                          acc[hospitalName].push(doctor);
                          return acc;
                        },
                        {} as Record<string, DoctorApiResponse[]>,
                      );
                      const isCollapsed = collapsedDays[dayKey] ?? false;

                      return (
                        <Card
                          key={dayKey}
                          className="border-secondary-light p-4"
                        >
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-black">
                                {formatSaudiWeekday(date)}
                              </p>
                              <p className="text-secondary-dark text-xs">
                                {formatSaudiDateDisplay(date)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-dashboard-green shrink-0 text-xs font-medium">
                                {selectedDoctors.length} selected
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setCollapsedDays((prev) => ({
                                    ...prev,
                                    [dayKey]: !isCollapsed,
                                  }))
                                }
                                className="text-secondary-dark hover:bg-secondary-very-light rounded-md p-1"
                                aria-label={
                                  isCollapsed ? "Expand day" : "Collapse day"
                                }
                              >
                                {isCollapsed ? (
                                  <ChevronRight size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </button>
                            </div>
                          </div>

                          {!isCollapsed && (
                            <div className="space-y-3">
                              {selectedDoctors.length > 0 && (
                                <div className="rounded-md border bg-white p-2">
                                  <p className="text-secondary-dark mb-2 text-xs font-medium">
                                    Selected Doctors
                                  </p>
                                  <div className="space-y-2">
                                    {Object.entries(
                                      selectedDoctorsByHospital,
                                    ).map(([hospitalName, doctors]) => (
                                      <div key={`${dayKey}-${hospitalName}`}>
                                        <p className="text-secondary-dark mb-1 text-xs font-semibold">
                                          {hospitalName}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {doctors.map((doctor) => (
                                            <span
                                              key={`${dayKey}-${hospitalName}-${doctor.id}`}
                                              className="bg-secondary-very-light inline-flex items-center rounded-full px-2 py-1 text-xs text-black"
                                            >
                                              {doctor.nameEN} | {doctor.nameAR}{" "}
                                              | {doctor.specialty}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <Select
                                value={selectedHospital}
                                onValueChange={(value) => {
                                  setDayHospitalSelections((prev) => ({
                                    ...prev,
                                    [dayKey]: value,
                                  }));
                                }}
                              >
                                <SelectTrigger className="bg-secondary-very-light w-full">
                                  <SelectValue placeholder="Select hospital" />
                                </SelectTrigger>
                                <SelectContent>
                                  {hospitalsWithDoctors.map((hospital) => (
                                    <SelectItem
                                      key={hospital.name}
                                      value={hospital.name}
                                    >
                                      {hospital.name} ({hospital.doctors.length}{" "}
                                      doctors)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {selectedHospital ? (
                                availableDoctorsForDay.length === 0 ? (
                                  <p className="text-secondary-dark text-xs">
                                    No doctors found in this hospital.
                                  </p>
                                ) : (
                                  <div className="bg-secondary-very-light max-h-52 space-y-2 overflow-y-auto rounded-md border p-3">
                                    {availableDoctorsForDay.map((doctor) => {
                                      const isChecked =
                                        selectedDoctorIds.includes(doctor.id);

                                      return (
                                        <label
                                          key={doctor.id}
                                          className="flex cursor-pointer items-start gap-2 rounded-sm p-1 hover:bg-white"
                                        >
                                          <Checkbox
                                            checked={isChecked}
                                            onCheckedChange={(checked) => {
                                              setDayDoctorAssignments(
                                                (prev) => {
                                                  const current =
                                                    prev[dayKey] ?? [];
                                                  const exists =
                                                    current.includes(doctor.id);

                                                  if (checked && !exists) {
                                                    return {
                                                      ...prev,
                                                      [dayKey]: [
                                                        ...current,
                                                        doctor.id,
                                                      ],
                                                    };
                                                  }

                                                  if (!checked && exists) {
                                                    const updated =
                                                      current.filter(
                                                        (id) =>
                                                          id !== doctor.id,
                                                      );
                                                    if (updated.length === 0) {
                                                      const next = { ...prev };
                                                      delete next[dayKey];
                                                      return next;
                                                    }

                                                    return {
                                                      ...prev,
                                                      [dayKey]: updated,
                                                    };
                                                  }

                                                  return prev;
                                                },
                                              );
                                            }}
                                            className="mt-0.5"
                                          />
                                          <span className="text-sm text-black">
                                            {doctor.nameEN} | {doctor.nameAR} |{" "}
                                            {doctor.specialty}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                )
                              ) : (
                                <p className="text-secondary-dark text-xs">
                                  Select a hospital to view doctors.
                                </p>
                              )}
                            </div>
                          )}
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
