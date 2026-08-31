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
  Search,
  AlertCircle,
  X,
  Building2,
  Users,
  CheckCircle2,
  Filter,
} from "lucide-react";
import {
  cn,
  formatDateOnly,
  formatSaudiDateDisplay,
} from "@/lib/utils";
import { addDays, addMonths, eachDayOfInterval, format, isBefore } from "date-fns";
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

type StatusFilterType = "all" | "assigned" | "unassigned";

/* Sub-component: Staged Multi-Select Monthly Date Popover */
function DoctorDateSelectorPopover({
  doctor,
  startDate,
  endDate,
  daysInRange,
  assignedDateKeys,
  onSave,
}: {
  doctor: DoctorApiResponse;
  startDate: Date;
  endDate: Date;
  daysInRange: Date[];
  assignedDateKeys: string[];
  onSave: (keys: string[]) => void;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [tempKeys, setTempKeys] = useState<string[]>(assignedDateKeys);

  const todayStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const handleOpenChange = (openState: boolean) => {
    if (openState) {
      setTempKeys(assignedDateKeys);
    }
    setPopoverOpen(openState);
  };

  // Group daysInRange by Month (e.g. "August 2026", "September 2026")
  const monthGroups = useMemo(() => {
    const groups: { monthLabel: string; days: Date[] }[] = [];
    daysInRange.forEach((day) => {
      const label = format(day, "MMMM yyyy");
      const existing = groups.find((g) => g.monthLabel === label);
      if (existing) {
        existing.days.push(day);
      } else {
        groups.push({ monthLabel: label, days: [day] });
      }
    });
    return groups;
  }, [daysInRange]);

  const toggleKey = (dKey: string) => {
    setTempKeys((prev) =>
      prev.includes(dKey) ? prev.filter((k) => k !== dKey) : [...prev, dKey]
    );
  };

  const handleApply = () => {
    onSave(tempKeys);
    setPopoverOpen(false);
  };

  const handleClear = () => {
    setTempKeys([]);
  };

  const isAssigned = assignedDateKeys.length > 0;

  return (
    <Popover open={popoverOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-9 rounded-[8px] text-xs font-bold border px-3 transition-colors",
            isAssigned
              ? "bg-[#E9F8F1] text-[#168557] border-[#CBEFDD] hover:bg-[#E9F8F1]"
              : "bg-white text-[#344054] border-[#DDE3EE] hover:bg-[#F9FAFB]"
          )}
        >
          <CalendarIcon className="mr-1.5 size-3.5" />
          {isAssigned
            ? `${assignedDateKeys.length} Dates Selected`
            : "Select Dates"}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[94vw] max-w-[420px] p-0 overflow-hidden rounded-[16px] border border-[#E5E8EF] shadow-[0_12px_28px_rgba(16,29,54,0.14)]"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 border-b border-[#EEF1F6] bg-white p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#182033] truncate pr-2">
              {doctor.nameEN || doctor.nameAR}
            </h4>
            <span className="inline-flex items-center rounded-full bg-[#E9F8F1] border border-[#CBEFDD] px-2.5 py-0.5 text-[11px] font-bold text-[#168557] shrink-0">
              {tempKeys.length} Selected
            </span>
          </div>
          <p className="text-[11px] font-medium text-[#667085] mt-0.5">
            {doctor.accountName || "Hospital"} • Period:{" "}
            {formatSaudiDateDisplay(startDate)} — {formatSaudiDateDisplay(endDate)}
          </p>
        </div>

        {/* Scrollable Content Area */}
        <div className="max-h-[52vh] sm:max-h-[55vh] overflow-y-auto p-4 space-y-4 bg-[#FBFCFE]">
          {monthGroups.map((group) => (
            <div key={group.monthLabel} className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#667085] bg-[#F4F6FA] px-2.5 py-1 rounded-[6px] w-fit">
                {group.monthLabel}
              </h5>

              {/* 7-Column Date Chip Grid */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {group.days.map((day) => {
                  const dKey = formatDateOnly(day);
                  const isSelected = tempKeys.includes(dKey);
                  const isPast = isBefore(day, todayStart);
                  const dayName = format(day, "EEE");
                  const dayNum = format(day, "d");

                  return (
                    <button
                      key={dKey}
                      type="button"
                      disabled={isPast}
                      onClick={() => toggleKey(dKey)}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-[8px] p-1.5 text-xs font-bold border transition-all h-11 w-full",
                        isPast
                          ? "opacity-35 cursor-not-allowed pointer-events-none bg-[#F4F6FA] text-[#98A2B3] border-transparent"
                          : isSelected
                          ? "bg-[#168557] text-white border-[#168557] shadow-xs"
                          : "bg-white text-[#182033] border-[#DDE3EE] hover:bg-[#E9F8F1] hover:text-[#168557]"
                      )}
                    >
                      <span className="text-[10px] opacity-80 font-medium">
                        {dayName}
                      </span>
                      <span className="text-xs font-extrabold leading-none mt-0.5">
                        {dayNum}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sticky Footer Actions */}
        <div className="sticky bottom-0 z-10 border-t border-[#EEF1F6] bg-white p-3 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            className="h-9 px-3 text-xs font-bold text-[#D92D20] hover:bg-[#FEF3F2]"
          >
            Clear All
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPopoverOpen(false)}
              className="h-9 px-3 text-xs font-semibold text-[#344054] rounded-[8px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              className="h-9 px-4 text-xs font-bold text-white bg-[#168557] hover:bg-[#126b46] rounded-[8px] shadow-xs"
            >
              Apply Dates ({tempKeys.length})
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

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
  const [allDoctorsList, setAllDoctorsList] = useState<DoctorApiResponse[]>([]);

  // Doctor-centric Assignment State: doctorId -> array of dateKey strings ("YYYY-MM-DD")
  const [doctorAssignments, setDoctorAssignments] = useState<
    Record<string, string[]>
  >({});

  // Doctor search, hospital filter, status filter
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all");

  const todayStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  useEffect(() => {
    if (!open) return;

    const subRegionFilter =
      userRole !== "MANAGER" && userSubRegionName
        ? userSubRegionName
        : undefined;

    getDoctorsAction(subRegionFilter, undefined, undefined, false).then(
      (result) => {
        if (result.success && result.data) {
          let allDoctors = result.data;

          if (subRegionFilter) {
            allDoctors = allDoctors.filter(
              (doctor) => doctor.subRegion === subRegionFilter
            );
          }

          setAllDoctorsList(allDoctors);

          const grouped = allDoctors.reduce((acc, doctor) => {
            const hospitalName = doctor.accountName || "Unassigned";
            const existing = acc.find(
              (hospital) => hospital.name === hospitalName
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
      }
    );
  }, [open, userRole, userSubRegionName]);

  const form = useForm<CreateVisitPlanFormValues>({
    resolver: zodResolver(createVisitPlanSchema),
    defaultValues: {
      planType: "WEEKLY",
      title: "",
      startDate: todayStart,
      endDate: addDays(todayStart, 6),
      description: "",
      objectives: "",
      doctorsWithDates: [],
      targetVisits: 10,
    },
  });

  const planType = useWatch({ control: form.control, name: "planType" });
  const startDate = useWatch({ control: form.control, name: "startDate" });
  const endDate = useWatch({ control: form.control, name: "endDate" });
  const targetVisits = useWatch({ control: form.control, name: "targetVisits" });

  const handlePlanTypeChange = (newType: "WEEKLY" | "MONTHLY") => {
    form.setValue("planType", newType);
    setDoctorAssignments({});

    const sDate = startDate || todayStart;
    if (newType === "WEEKLY") {
      const eDate = addDays(sDate, 6);
      form.setValue("startDate", sDate);
      form.setValue("endDate", eDate);
    } else {
      const eDate = addDays(addMonths(sDate, 1), -1);
      form.setValue("startDate", sDate);
      form.setValue("endDate", eDate);
    }
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) {
      form.setValue("startDate", undefined as unknown as Date);
      form.setValue("endDate", undefined as unknown as Date);
      setDoctorAssignments({});
      return;
    }

    const normalizedStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (planType === "WEEKLY") {
      const normalizedEnd = addDays(normalizedStart, 6);
      form.setValue("startDate", normalizedStart);
      form.setValue("endDate", normalizedEnd);
    } else {
      const normalizedEnd = addDays(addMonths(normalizedStart, 1), -1);
      form.setValue("startDate", normalizedStart);
      form.setValue("endDate", normalizedEnd);
    }
    setDoctorAssignments({});
  };

  const daysInRange = useMemo(() => {
    if (!startDate || !endDate) return [];
    if (startDate > endDate) return [];
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  const daysKeyMap = useMemo(() => {
    const map = new Map<string, Date>();
    daysInRange.forEach((d) => {
      map.set(formatDateOnly(d), d);
    });
    return map;
  }, [daysInRange]);

  const mappedDoctorsWithDates = useMemo(() => {
    const result: { doctorId: string; visitDate: Date }[] = [];
    Object.entries(doctorAssignments).forEach(([doctorId, dateKeys]) => {
      dateKeys.forEach((dateKey) => {
        const dateObj = daysKeyMap.get(dateKey);
        if (dateObj) {
          result.push({ doctorId, visitDate: dateObj });
        } else {
          const parts = dateKey.split("-");
          if (parts.length === 3) {
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            const d = parseInt(parts[2], 10);
            result.push({ doctorId, visitDate: new Date(y, m, d) });
          }
        }
      });
    });
    return result;
  }, [doctorAssignments, daysKeyMap]);

  useEffect(() => {
    form.setValue("doctorsWithDates", mappedDoctorsWithDates, {
      shouldValidate: true,
    });
  }, [form, mappedDoctorsWithDates]);

  const totalAssignedDoctorsCount = useMemo(() => {
    return Object.keys(doctorAssignments).filter(
      (id) => (doctorAssignments[id] ?? []).length > 0
    ).length;
  }, [doctorAssignments]);

  const totalPlannedVisits = useMemo(() => {
    return Object.values(doctorAssignments).reduce(
      (sum, dateKeys) => sum + dateKeys.length,
      0
    );
  }, [doctorAssignments]);

  const filteredDoctors = useMemo(() => {
    const query = doctorSearchQuery.trim().toLowerCase();
    return allDoctorsList.filter((doc) => {
      const matchesSearch =
        !query ||
        doc.nameEN?.toLowerCase().includes(query) ||
        doc.nameAR?.toLowerCase().includes(query) ||
        doc.specialty?.toLowerCase().includes(query) ||
        doc.accountName?.toLowerCase().includes(query);

      const matchesHospital =
        hospitalFilter === "all" || doc.accountName === hospitalFilter;

      const isAssigned = (doctorAssignments[doc.id] ?? []).length > 0;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "assigned" && isAssigned) ||
        (statusFilter === "unassigned" && !isAssigned);

      return matchesSearch && matchesHospital && matchesStatus;
    });
  }, [allDoctorsList, doctorSearchQuery, hospitalFilter, statusFilter, doctorAssignments]);

  const isFormSubmittable = useMemo(() => {
    const values = form.getValues();
    const hasTitle = Boolean(values.title && values.title.trim().length > 0);
    const hasDates = Boolean(startDate && endDate);
    const hasTarget = Boolean(values.targetVisits && values.targetVisits >= 1);
    const hasAssignments = totalPlannedVisits >= 1;

    return (
      hasTitle &&
      hasDates &&
      hasTarget &&
      hasAssignments &&
      !isPending
    );
  }, [form, startDate, endDate, totalPlannedVisits, isPending]);

  const toggleDoctorDateKey = (doctorId: string, dateKey: string) => {
    setDoctorAssignments((prev) => {
      const current = prev[doctorId] ?? [];
      const exists = current.includes(dateKey);

      if (!exists) {
        return { ...prev, [doctorId]: [...current, dateKey] };
      }

      const updated = current.filter((k) => k !== dateKey);
      if (updated.length === 0) {
        const next = { ...prev };
        delete next[doctorId];
        return next;
      }

      return { ...prev, [doctorId]: updated };
    });
  };

  const setDoctorDateKeys = (doctorId: string, dateKeys: string[]) => {
    setDoctorAssignments((prev) => {
      if (dateKeys.length === 0) {
        const next = { ...prev };
        delete next[doctorId];
        return next;
      }
      return { ...prev, [doctorId]: dateKeys };
    });
  };

  const handleSubmit = (values: CreateVisitPlanFormValues) => {
    if (totalPlannedVisits === 0) {
      toast.error({
        title: "Visit Assignments Required",
        description: "Please assign at least one visit date to a doctor.",
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
          setDoctorAssignments({});
          setDoctorSearchQuery("");
          setHospitalFilter("all");
          setStatusFilter("all");
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gp-rep-primary hover:bg-gp-rep-primary-hover text-white h-10 px-4 text-xs font-semibold gap-1.5 rounded-[10px] shadow-[0_4px_14px_rgba(22,133,87,0.22)] cursor-pointer">
          <Plus size={16} />
          Create New Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] !w-[98vw] !max-w-[1400px] overflow-hidden p-0 sm:!max-w-[95vw] lg:!max-w-[1320px]">
        <DialogHeader className="border-b px-6 pt-5 pb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#E9F8F1] border border-[#CBEFDD] px-2.5 py-0.5 text-[11px] font-semibold text-[#168557] uppercase tracking-wider">
              Doctor-Centric Planning
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-[#182033] mt-1">
            Create New Visit Plan
          </DialogTitle>
          <DialogDescription className="text-xs text-[#667085]">
            Set your plan details and select visit dates per doctor in your territory.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <div className="overflow-y-auto px-6 py-5 max-h-[calc(92vh-100px)]">
            <div className="grid gap-6 lg:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]">
              {/* Left Column: Plan Setup */}
              <div className="space-y-4 rounded-[14px] border border-[#E5E8EF] bg-white p-5 h-fit">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#182033]">Plan Setup</h3>
                  <span className="text-[11px] font-medium text-[#667085]">
                    Saudi Timezone
                  </span>
                </div>

                <div className="flex gap-2 p-1 bg-[#F4F6FA] rounded-[10px] border border-[#E5E8EF]">
                  <button
                    type="button"
                    onClick={() => handlePlanTypeChange("WEEKLY")}
                    className={cn(
                      "flex h-9 flex-1 items-center justify-center gap-2 rounded-[8px] text-xs font-bold transition-all",
                      planType === "WEEKLY"
                        ? "bg-[#168557] text-white shadow-xs"
                        : "bg-transparent text-[#667085] hover:text-[#182033]"
                    )}
                  >
                    <CalendarIcon size={14} />
                    Weekly Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlanTypeChange("MONTHLY")}
                    className={cn(
                      "flex h-9 flex-1 items-center justify-center gap-2 rounded-[8px] text-xs font-bold transition-all",
                      planType === "MONTHLY"
                        ? "bg-[#168557] text-white shadow-xs"
                        : "bg-transparent text-[#667085] hover:text-[#182033]"
                    )}
                  >
                    <FileText size={14} />
                    Monthly Plan
                  </button>
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-[#344054]">
                        Plan Title <span className="text-[#D92D20]">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={
                            planType === "WEEKLY"
                              ? "e.g., Week 36 - Territory Coverage"
                              : "e.g., September Monthly Coverage Plan"
                          }
                          className="h-10 rounded-[10px] border-[#DDE3EE] bg-[#F9FAFB] text-sm text-[#182033] focus:border-[#168557]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-[#344054]">
                          Start Date <span className="text-[#D92D20]">*</span>
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                className="h-10 w-full justify-start text-left rounded-[10px] border-[#DDE3EE] bg-[#F9FAFB] text-sm font-medium text-[#182033]"
                              >
                                <CalendarIcon className="mr-2 size-4 text-[#98A2B3]" />
                                {field.value
                                  ? formatSaudiDateDisplay(field.value)
                                  : "Select start date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={handleStartDateChange}
                              disabled={(date) => isBefore(date, todayStart)}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {startDate && endDate && (
                    <div className="rounded-[10px] border border-[#CBEFDD] bg-[#E9F8F1]/60 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#168557]">
                        {planType === "WEEKLY"
                          ? "7-Day Plan Period"
                          : "Rolling Month Plan Period"}
                      </p>
                      <p className="text-xs font-bold text-[#182033] mt-0.5">
                        {formatSaudiDateDisplay(startDate)} —{" "}
                        {formatSaudiDateDisplay(endDate)}
                      </p>
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="targetVisits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-[#344054]">
                        Target Visits <span className="text-[#D92D20]">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          onChange={(event) =>
                            field.onChange(
                              parseInt(event.target.value, 10) || 1
                            )
                          }
                          placeholder="e.g., 25"
                          className="h-10 rounded-[10px] border-[#DDE3EE] bg-[#F9FAFB] text-sm text-[#182033]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-[#344054]">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe the focus of this plan..."
                          rows={2}
                          className="rounded-[10px] border-[#DDE3EE] bg-[#F9FAFB] text-sm text-[#182033] resize-none"
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
                      <FormLabel className="text-xs font-semibold text-[#344054]">
                        Objectives (one per line)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="List main objectives, one per line..."
                          rows={3}
                          className="rounded-[10px] border-[#DDE3EE] bg-[#F9FAFB] text-sm text-[#182033] resize-none"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      form.reset();
                      setDoctorAssignments({});
                    }}
                    disabled={isPending}
                    className="h-10 flex-1 rounded-[10px] border-[#E5E8EF] text-xs font-semibold text-[#344054]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={form.handleSubmit(handleSubmit)}
                    disabled={!isFormSubmittable}
                    className={cn(
                      "h-10 flex-1 rounded-[10px] text-xs font-semibold gap-1.5 transition-all cursor-pointer",
                      !isFormSubmittable
                        ? "bg-[#F4F6FA] text-[#98A2B3] border border-[#E5E8EF] cursor-not-allowed opacity-70 shadow-none"
                        : "bg-gp-rep-primary hover:bg-gp-rep-primary-hover text-white shadow-[0_4px_14px_rgba(22,133,87,0.22)]"
                    )}
                  >
                    {isPending ? (
                      <>Submitting...</>
                    ) : (
                      <>
                        <Send size={14} />
                        Submit for Approval
                      </>
                    )}
                  </Button>
                </div>

                {!isFormSubmittable && (
                  <p className="text-[11px] font-semibold text-[#8A6515] bg-[#FFF8E5] border border-[#E9DDB8] p-2.5 rounded-[8px] flex items-center gap-1.5">
                    <AlertCircle className="size-3.5 shrink-0 text-[#B18732]" />
                    <span>
                      {totalPlannedVisits === 0
                        ? "Assign visit dates to at least one doctor."
                        : "Fill in all required fields to submit."}
                    </span>
                  </p>
                )}
              </div>

              {/* Right Column: Doctor-Centric Coverage Workspace */}
              <div className="rounded-[14px] border border-[#E5E8EF] bg-[#FBFCFE] p-5 space-y-4 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-4">
                    <div className="rounded-[10px] border border-[#E5E8EF] bg-white p-3 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-[#667085]">
                          Doctors Assigned
                        </p>
                        <p className="text-base font-bold text-[#182033] mt-0.5">
                          {totalAssignedDoctorsCount} / {allDoctorsList.length}
                        </p>
                      </div>
                      <Users className="size-5 text-[#168557]" />
                    </div>

                    <div className="rounded-[10px] border border-[#E5E8EF] bg-white p-3 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-[#667085]">
                          Visits Planned
                        </p>
                        <p className="text-base font-bold text-[#168557] mt-0.5">
                          {totalPlannedVisits} Visits
                        </p>
                      </div>
                      <CheckCircle2 className="size-5 text-[#168557]" />
                    </div>

                    <div
                      className={cn(
                        "rounded-[10px] border p-3 flex items-center justify-between",
                        totalPlannedVisits >= (targetVisits || 1)
                          ? "border-[#CBEFDD] bg-[#E9F8F1]/40"
                          : "border-[#E9DDB8] bg-[#FFF8E5]"
                      )}
                    >
                      <div>
                        <p className="text-[11px] font-semibold text-[#667085]">
                          Target Progress
                        </p>
                        <p
                          className={cn(
                            "text-base font-bold mt-0.5",
                            totalPlannedVisits >= (targetVisits || 1)
                              ? "text-[#168557]"
                              : "text-[#8A6515]"
                          )}
                        >
                          {totalPlannedVisits} / {targetVisits || 1}
                        </p>
                      </div>
                      <span className="text-xs font-bold">
                        {totalPlannedVisits >= (targetVisits || 1)
                          ? "Goal Met"
                          : `${Math.max(0, (targetVisits || 1) - totalPlannedVisits)} Left`}
                      </span>
                    </div>
                  </div>

                  <div className="sticky top-0 z-10 bg-[#FBFCFE] pt-1 pb-3 space-y-2 border-b border-[#EEF1F6] mb-4">
                    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="relative flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98A2B3]" />
                        <input
                          type="text"
                          value={doctorSearchQuery}
                          onChange={(e) => setDoctorSearchQuery(e.target.value)}
                          placeholder="Search doctor name, specialty, or hospital..."
                          className="h-9 w-full rounded-[8px] border border-[#DDE3EE] bg-white pr-8 pl-9 text-xs font-medium text-[#182033] placeholder:text-[#98A2B3] outline-none focus:border-[#168557]"
                        />
                        {doctorSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setDoctorSearchQuery("")}
                            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#98A2B3] hover:text-[#182033]"
                          >
                            <X className="size-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="w-full sm:w-48">
                        <Select
                          value={hospitalFilter}
                          onValueChange={setHospitalFilter}
                        >
                          <SelectTrigger className="h-9 rounded-[8px] border-[#DDE3EE] bg-white text-xs text-[#182033]">
                            <SelectValue placeholder="All Hospitals" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Hospitals</SelectItem>
                            {hospitalsWithDoctors.map((h) => (
                              <SelectItem key={h.name} value={h.name}>
                                {h.name} ({h.doctors.length})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setStatusFilter("all")}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold border transition-colors",
                          statusFilter === "all"
                            ? "bg-[#E9F8F1] text-[#168557] border-[#CBEFDD]"
                            : "bg-white text-[#667085] border-[#E5E8EF] hover:bg-[#F9FAFB]"
                        )}
                      >
                        All Doctors ({allDoctorsList.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter("assigned")}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold border transition-colors",
                          statusFilter === "assigned"
                            ? "bg-[#E9F8F1] text-[#168557] border-[#CBEFDD]"
                            : "bg-white text-[#667085] border-[#E5E8EF] hover:bg-[#F9FAFB]"
                        )}
                      >
                        Assigned ({totalAssignedDoctorsCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter("unassigned")}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold border transition-colors",
                          statusFilter === "unassigned"
                            ? "bg-[#FFF8E5] text-[#8A6515] border-[#E9DDB8]"
                            : "bg-white text-[#667085] border-[#E5E8EF] hover:bg-[#F9FAFB]"
                        )}
                      >
                        Unassigned ({allDoctorsList.length - totalAssignedDoctorsCount})
                      </button>
                    </div>
                  </div>

                  {filteredDoctors.length === 0 ? (
                    <div className="rounded-[12px] border border-dashed border-[#DDE3EE] bg-white py-12 px-6 text-center">
                      <Filter className="mx-auto size-8 text-[#98A2B3] mb-2" />
                      <p className="text-sm font-bold text-[#182033]">
                        No doctors match your filter
                      </p>
                      <p className="text-xs text-[#667085] mt-1">
                        Try adjusting doctor search query or filters.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
                      {filteredDoctors.map((doctor) => {
                        const assignedDateKeys =
                          doctorAssignments[doctor.id] ?? [];
                        const isAssigned = assignedDateKeys.length > 0;

                        return (
                          <Card
                            key={doctor.id}
                            className={cn(
                              "border p-4 transition-all bg-white rounded-[12px]",
                              isAssigned
                                ? "border-[#CBEFDD] shadow-xs"
                                : "border-[#E5E8EF]"
                            )}
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-[#182033] truncate">
                                    {doctor.nameEN || doctor.nameAR}
                                  </h4>
                                  <span
                                    className={cn(
                                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border",
                                      isAssigned
                                        ? "bg-[#E9F8F1] text-[#168557] border-[#CBEFDD]"
                                        : "bg-[#F4F6FA] text-[#667085] border-[#E5E8EF]"
                                    )}
                                  >
                                    {isAssigned
                                      ? `✓ ${assignedDateKeys.length} Visits Scheduled`
                                      : "Not Scheduled"}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#667085]">
                                  <span className="font-medium text-[#344054]">
                                    {doctor.specialty}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 truncate">
                                    <Building2 className="size-3 text-[#98A2B3]" />
                                    {doctor.accountName || "Unassigned"}
                                  </span>
                                </div>
                              </div>

                              <div className="shrink-0">
                                {planType === "WEEKLY" ? (
                                  <div className="flex flex-wrap items-center gap-1">
                                    {daysInRange.map((date) => {
                                      const dateKey = formatDateOnly(date);
                                      const isSelected =
                                        assignedDateKeys.includes(dateKey);
                                      const shortDay = format(date, "EEE");
                                      const dayNum = format(date, "d");

                                      return (
                                        <button
                                          key={dateKey}
                                          type="button"
                                          onClick={() =>
                                            toggleDoctorDateKey(
                                              doctor.id,
                                              dateKey
                                            )
                                          }
                                          className={cn(
                                            "flex flex-col items-center justify-center rounded-[6px] px-2 py-1 text-[11px] font-bold border transition-colors min-w-[38px]",
                                            isSelected
                                              ? "bg-[#168557] text-white border-[#168557] shadow-xs"
                                              : "bg-[#F9FAFB] text-[#344054] border-[#E5E8EF] hover:bg-[#E9F8F1] hover:text-[#168557]"
                                          )}
                                        >
                                          <span>{shortDay}</span>
                                          <span className="text-[10px] opacity-85">
                                            {dayNum}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  /* Redesigned Monthly Popover Component */
                                  <DoctorDateSelectorPopover
                                    doctor={doctor}
                                    startDate={startDate}
                                    endDate={endDate}
                                    daysInRange={daysInRange}
                                    assignedDateKeys={assignedDateKeys}
                                    onSave={(newKeys) =>
                                      setDoctorDateKeys(doctor.id, newKeys)
                                    }
                                  />
                                )}
                              </div>
                            </div>

                            {planType === "MONTHLY" && assignedDateKeys.length > 0 && (
                              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#EEF1F6]">
                                <span className="text-[11px] font-semibold text-[#667085]">
                                  Selected Dates:
                                </span>
                                {assignedDateKeys.map((dKey) => {
                                  const dateObj = daysKeyMap.get(dKey);
                                  return (
                                    <span
                                      key={dKey}
                                      className="inline-flex items-center gap-1 rounded-full bg-[#E9F8F1] border border-[#CBEFDD] px-2.5 py-0.5 text-[11px] font-bold text-[#168557]"
                                    >
                                      <span>
                                        {dateObj
                                          ? format(dateObj, "MMM d")
                                          : dKey}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          toggleDoctorDateKey(doctor.id, dKey)
                                        }
                                        className="text-[#98A2B3] hover:text-[#D92D20]"
                                      >
                                        <X className="size-3" />
                                      </button>
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#EEF1F6] flex items-center justify-between text-xs font-semibold text-[#344054]">
                  <span>Total Planned Visits:</span>
                  <span className="font-bold text-[#168557] bg-[#E9F8F1] border border-[#CBEFDD] px-3 py-1 rounded-full">
                    {totalPlannedVisits} Total Occurrences
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
