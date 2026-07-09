"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  createSupervisorPlanSchema,
  type CreateSupervisorPlanFormValues,
} from "../../lib/schemas";
import { createSupervisorPlanAction } from "@/features/plan/api/create";
import { getDoctorsAction } from "@/features/doctors/api";
import { getSupervisorTeamAction } from "@/features/team/api";
import type { User } from "@/features/team/lib/types";
import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import { toast } from "@/lib/utils/toast";
import {
  Plus,
  Check,
  Building2,
  Calendar as CalendarIcon,
  Send,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatSaudiDateDisplay } from "@/lib/utils";
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

export default function CreatePlanDialogSupervisor({
  userRole,
  userSubRegionName,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [reps, setReps] = useState<User[]>([]);
  const [isLoadingReps, setIsLoadingReps] = useState(false);
  const [selectedHospitalName, setSelectedHospitalName] =
    useState<string>("all");
  const [hospitalsWithDoctors, setHospitalsWithDoctors] = useState<
    HospitalWithDoctors[]
  >([]);
  const [openDatePickerForDoctorId, setOpenDatePickerForDoctorId] = useState<
    string | null
  >(null);

  // Fetch reps and doctors when dialog opens
  useEffect(() => {
    if (!open) return;

    // Fetch reps
    if (reps.length === 0) {
      setIsLoadingReps(true);
      getSupervisorTeamAction()
        .then((result) => {
          if (result.success && result.members) setReps(result.members);
        })
        .finally(() => setIsLoadingReps(false));
    }

    // Fetch and group doctors
    getDoctorsAction(undefined, undefined, undefined, false).then((result) => {
      if (result.success && result.data) {
        let allDoctors = result.data;

        // Filter by subRegion for non-manager users
        if (userRole !== "MANAGER" && userSubRegionName) {
          allDoctors = allDoctors.filter(
            (d) => d.subRegion === userSubRegionName,
          );
        }

        // Group by hospital (accountName)
        const grouped = allDoctors.reduce((acc, doctor) => {
          const hospitalName = doctor.accountName || "Unassigned";
          const existing = acc.find((h) => h.name === hospitalName);
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
  }, [open, userRole, userSubRegionName, reps.length]);

  const form = useForm<CreateSupervisorPlanFormValues>({
    resolver: zodResolver(createSupervisorPlanSchema),
    defaultValues: {
      planType: "WEEKLY",
      title: "",
      description: "",
      objectives: "",
      startDate: undefined,
      endDate: undefined,
      doctorsWithDates: [],
      targetVisits: 1,
      repId: "",
    },
  });

  const handleNext = async () => {
    const isValid = await form.trigger([
      "title",
      "startDate",
      "endDate",
      "repId",
      "description",
      "targetVisits",
    ]);
    if (isValid) setStep(2);
  };

  const handlePrevious = () => setStep(1);

  const handleSubmit = (values: CreateSupervisorPlanFormValues) => {
    startTransition(async () => {
      try {
        const result = await createSupervisorPlanAction(values);
        if (result.success) {
          form.reset();
          setStep(1);
          setOpen(false);
          router.refresh();
          toast.success({
            title: "Plan created successfully",
            description: values.title,
          });
        } else {
          toast.error({
            title: "Failed to create plan",
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

  const doctorsWithDates = form.watch("doctorsWithDates");
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");

  const addDoctor = (doctorId: string, visitDate: Date) => {
    const current = form.getValues("doctorsWithDates");
    form.setValue("doctorsWithDates", [...current, { doctorId, visitDate }], {
      shouldValidate: true,
    });
  };

  const removeDoctor = (doctorId: string) => {
    const current = form.getValues("doctorsWithDates");
    form.setValue(
      "doctorsWithDates",
      current.filter((d) => d.doctorId !== doctorId),
      { shouldValidate: true },
    );
  };

  const filteredHospitals =
    selectedHospitalName === "all"
      ? hospitalsWithDoctors
      : hospitalsWithDoctors.filter((h) => h.name === selectedHospitalName);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="button-system-gradient-primary">
          <Plus size={16} />
          Create New Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Plan</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Configure plan details and assign to a medical rep"
              : "Select doctors and assign visit dates"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-secondary-dark text-xs">
                Date selection uses Saudi Arabia timezone (Asia/Riyadh).
              </p>
              {/* Plan Type */}
              <FormField
                control={form.control}
                name="planType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Plan Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary-very-light w-full cursor-pointer border-[0.8px]">
                          <SelectValue placeholder="Select plan type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WEEKLY">Weekly Plan</SelectItem>
                        <SelectItem value="MONTHLY">Monthly Plan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />

              {/* Plan Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Plan Title <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-secondary-very-light"
                        placeholder="Enter plan title"
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the plan goals and focus areas..."
                        rows={3}
                        className="bg-secondary-very-light resize-none"
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />

              {/* Medical Rep */}
              <FormField
                control={form.control}
                name="repId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Medical Rep <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingReps}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-secondary-very-light w-full cursor-pointer border-[0.8px]">
                          <SelectValue
                            placeholder={
                              isLoadingReps
                                ? "Loading reps..."
                                : "Select medical rep"
                            }
                          />
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

              {/* Objectives */}
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
                        rows={3}
                        className="bg-secondary-very-light resize-none"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Start Date <span className="text-red-500">*</span>
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
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        End Date <span className="text-red-500">*</span>
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
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Target Visits */}
              <FormField
                control={form.control}
                name="targetVisits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Target Visits <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        className="bg-secondary-very-light"
                        placeholder="Number of visits"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
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
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  className="button-system-gradient-primary"
                  disabled={isPending}
                >
                  Next: Select Doctors
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* Hospital Filter */}
              <Select
                value={selectedHospitalName}
                onValueChange={setSelectedHospitalName}
              >
                <SelectTrigger className="bg-secondary-very-light w-full">
                  <SelectValue placeholder="All Hospitals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hospitals</SelectItem>
                  {hospitalsWithDoctors.map((h) => (
                    <SelectItem key={h.name} value={h.name}>
                      {h.name} ({h.doctors.length} doctors)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {doctorsWithDates.length > 0 && (
                <p className="text-dashboard-green text-xs">
                  {doctorsWithDates.length} doctor
                  {doctorsWithDates.length !== 1 ? "s" : ""} selected
                </p>
              )}

              {form.formState.errors.doctorsWithDates && (
                <p className="text-sm text-red-500">
                  At least one doctor must be selected
                </p>
              )}

              {/* Hospitals and Doctors List */}
              <div className="max-h-[400px] space-y-5 overflow-y-auto pr-1">
                {filteredHospitals.length === 0 ? (
                  <div className="text-secondary-dark py-8 text-center text-sm">
                    No hospitals available
                  </div>
                ) : (
                  filteredHospitals.map((hospital) => (
                    <div key={hospital.name} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="text-dashboard-blue size-5" />
                        <span className="text-sm/6 font-normal">
                          {hospital.name}
                        </span>
                        <span className="bg-secondary-text rounded-full px-2 py-0.5 text-xs/4 font-medium text-white">
                          {hospital.doctors.length}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {hospital.doctors.map((doctor) => {
                          const selected = doctorsWithDates.find(
                            (d) => d.doctorId === doctor.id,
                          );
                          return (
                            <Popover
                              key={doctor.id}
                              open={openDatePickerForDoctorId === doctor.id}
                              onOpenChange={(o) =>
                                !o && setOpenDatePickerForDoctorId(null)
                              }
                            >
                              <PopoverTrigger asChild>
                                <Card
                                  onClick={() => {
                                    if (selected) {
                                      removeDoctor(doctor.id);
                                    } else {
                                      setOpenDatePickerForDoctorId(doctor.id);
                                    }
                                  }}
                                  className={cn(
                                    "cursor-pointer p-3 transition-all hover:shadow-md",
                                    selected
                                      ? "border-dashboard-green bg-green-stroke"
                                      : "border-gray-200",
                                  )}
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-start justify-between gap-1">
                                      <h4 className="text-sm/5 leading-tight font-normal">
                                        {doctor.nameEN}
                                      </h4>
                                      <div className="flex shrink-0 items-center gap-1">
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button
                                              type="button"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                              className="text-gray-400 hover:text-gray-600"
                                            >
                                              <Info className="h-3.5 w-3.5" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent
                                            side="top"
                                            className="max-w-56 space-y-0.5 p-3 text-left text-xs"
                                          >
                                            <p className="font-semibold">
                                              {doctor.nameEN}
                                            </p>
                                            {doctor.nameAR && (
                                              <p className="opacity-70">
                                                {doctor.nameAR}
                                              </p>
                                            )}
                                            {doctor.specialty && (
                                              <p>
                                                Specialty: {doctor.specialty}
                                              </p>
                                            )}
                                            {doctor.grade && (
                                              <p>Grade: {doctor.grade}</p>
                                            )}
                                            {doctor.phone && (
                                              <p>Phone: {doctor.phone}</p>
                                            )}
                                            {doctor.email && (
                                              <p>Email: {doctor.email}</p>
                                            )}
                                            {doctor.subRegion && (
                                              <p>
                                                Sub-region: {doctor.subRegion}
                                              </p>
                                            )}
                                            {doctor.area && (
                                              <p>Area: {doctor.area}</p>
                                            )}
                                            {doctor.avgPatientsPerDay !=
                                              null && (
                                              <p>
                                                Avg patients/day:{" "}
                                                {doctor.avgPatientsPerDay}
                                              </p>
                                            )}
                                          </TooltipContent>
                                        </Tooltip>
                                        {selected && (
                                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                                            <Check className="h-3 w-3 text-white" />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-secondary-dark text-xs">
                                      {doctor.specialty}
                                    </p>
                                    {selected && (
                                      <p className="text-dashboard-green text-xs font-medium">
                                        {formatSaudiDateDisplay(
                                          selected.visitDate,
                                        )}
                                      </p>
                                    )}
                                  </div>
                                </Card>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <p className="border-b px-3 py-2 text-center text-xs font-medium text-gray-600">
                                  Visit date for {doctor.nameEN}
                                </p>
                                <Calendar
                                  mode="single"
                                  fromDate={startDate}
                                  toDate={endDate}
                                  disabled={(date) =>
                                    (startDate ? date < startDate : false) ||
                                    (endDate ? date > endDate : false)
                                  }
                                  onSelect={(date) => {
                                    if (date) {
                                      addDoctor(doctor.id, date);
                                      setOpenDatePickerForDoctorId(null);
                                    }
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2 *:flex-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isPending}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={form.handleSubmit(handleSubmit)}
                  disabled={isPending || doctorsWithDates.length === 0}
                  className="button-system-gradient-primary disabled:opacity-50"
                >
                  {isPending ? (
                    "Creating..."
                  ) : (
                    <>
                      <Send size={16} />
                      Create Plan
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
}
