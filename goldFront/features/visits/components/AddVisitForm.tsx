"use client";

import { useMemo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  CalendarCheck2,
  Calendar as CalendarIcon,
  Clock3,
  Loader2,
  PackageSearch,
  Stethoscope,
  UserCheck,
  Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/lib/utils/toast";
import { getProductsAction } from "@/features/forecast/api";
import type { Product } from "@/features/forecast/lib/types";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  managerVisitSchema,
  supervisorVisitSchema,
  medicalRepVisitSchema,
  VisitFormValues,
} from "@/features/visits/lib/schemas";
import { HOURS } from "@/features/visits/lib/constants";
import { useCreateVisit } from "@/features/visits/hooks/useCreateVisit";
import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import type { User } from "@/features/team/lib/types";
import {
  cn,
  formatDateOnly,
  formatSaudiDateDisplay,
  parseDateValue,
} from "@/lib/utils";

type RoleBasedAddVisitFormProps = (
  | {
      role: "MANAGER";
      doctors: DoctorApiResponse[];
      supervisors: User[];
      medicalReps: User[];
    }
  | {
      role: "SUPERVISOR";
      doctors: DoctorApiResponse[];
      medicalReps: User[];
    }
  | {
      role: "MEDICAL_REP";
      doctors: DoctorApiResponse[];
    }
) & {
  isModal?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialDoctorId?: string;
  initialDate?: Date;
};

const labelClassName = "text-xs font-semibold text-[#344054]";
const fieldClassName =
  "h-11 w-full rounded-[11px] border border-[#E5E8EF] bg-white px-3.5 text-sm font-medium text-[#182033] shadow-none transition-[border-color,background-color,box-shadow] duration-[160ms] placeholder:text-[#98A2B3] focus-visible:border-[#C9A44C] focus-visible:bg-[#FFFDF7] focus-visible:ring-[3px] focus-visible:ring-[#C9A44C]/10 aria-invalid:border-[#D92D20] aria-invalid:ring-[#D92D20]/10";
const fieldButtonClassName = cn(
  fieldClassName,
  "w-full justify-start text-left hover:bg-[#FFFDF7] hover:text-[#182033]",
);
const selectContentClassName =
  "visits-add-select-content rounded-[12px] border border-[#E5E8EF] bg-white text-[#182033] shadow-[0_16px_40px_rgba(16,27,51,0.14)]";
const selectItemClassName =
  "rounded-[9px] text-sm font-medium text-[#344054] focus:bg-[#FFF8E5] focus:text-[#8A6515] data-[state=checked]:text-[#182033] [&_svg]:text-[#B18732]";
const comboboxTriggerClassName =
  "visits-add-combobox-trigger h-11 rounded-[11px] border-[#E5E8EF] bg-white px-3.5 text-sm font-medium text-[#182033] shadow-none hover:border-[#D8DEE8] focus-visible:border-[#C9A44C] focus-visible:ring-[3px] focus-visible:ring-[#C9A44C]/10 aria-invalid:border-[#D92D20] aria-invalid:ring-[#D92D20]/10";
const comboboxDropdownClassName =
  "visits-add-combobox-dropdown rounded-[12px] border-[#E5E8EF] shadow-[0_16px_40px_rgba(16,27,51,0.14)]";
const comboboxSelectedClassName = "bg-[#FFF8E5] text-[#182033]";
const comboboxBadgeClassName = "border-[#E9DDB8] bg-[#FFF8E5] text-[#8A6515]";

function RequiredMark() {
  return <span className="text-[#D92D20]">*</span>;
}

export default function AddVisitForm(props: RoleBasedAddVisitFormProps) {
  const {
    role,
    doctors,
    isModal = false,
    onSuccess,
    onCancel,
    initialDoctorId,
    initialDate,
  } = props;

  const supervisors = "supervisors" in props ? props.supervisors : [];
  const medicalReps = "medicalReps" in props ? props.medicalReps : [];

  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDoctorId =
    initialDoctorId || searchParams.get("doctorId") || "";
  const { createVisit, isPending } = useCreateVisit();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>("all");

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      const result = await getProductsAction();
      if (result.success && result.data) {
        setProducts(result.data);
      }
    };
    fetchProducts();
  }, []);

  const { schema, defaultValues, redirectPath, hasVisitType } = useMemo(() => {
    const doctorId =
      preselectedDoctorId && doctors.some((d) => d.id === preselectedDoctorId)
        ? preselectedDoctorId
        : "";

    const configs = {
      MANAGER: {
        schema: managerVisitSchema,
        defaultValues: {
          doctorId,
          products: "",
          time: "",
          visitType: "CHECK" as const,
          supervisorId: "",
          medicalRepId: "",
          notes: "",
        },
        redirectPath: "/manager/visits",
        hasVisitType: true,
      },
      SUPERVISOR: {
        schema: supervisorVisitSchema,
        defaultValues: {
          doctorId,
          products: "",
          time: "",
          visitType: "CHECK" as const,
          medicalRepId: "",
          notes: "",
        },
        redirectPath: "/supervisor/visits",
        hasVisitType: true,
      },
      MEDICAL_REP: {
        schema: medicalRepVisitSchema,
        defaultValues: {
          doctorId,
          products: "",
          time: "",
          notes: "",
        },
        redirectPath: "/rep/visits",
        hasVisitType: false,
      },
    };

    return configs[role];
  }, [role, preselectedDoctorId, doctors]);

  const form = useForm<VisitFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const hospitals = useMemo(() => {
    return Array.from(
      new Set(doctors.map((doctor) => doctor.accountName || "Unassigned")),
    ).sort((a, b) => a.localeCompare(b));
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (selectedHospital === "all") {
      return doctors;
    }

    return doctors.filter(
      (doctor) => (doctor.accountName || "Unassigned") === selectedHospital,
    );
  }, [doctors, selectedHospital]);

  const hospitalOptions: ComboboxOption[] = useMemo(() => {
    return [
      { value: "all", label: "All Hospitals" },
      ...hospitals.map((h) => ({
        value: h,
        label: h,
      })),
    ];
  }, [hospitals]);

  const doctorOptions: ComboboxOption[] = useMemo(() => {
    return filteredDoctors.map((d) => ({
      value: d.id,
      label: d.nameEN || d.nameAR || "Unnamed Doctor",
      subText: d.nameAR && d.nameEN ? d.nameAR : undefined,
      metadata: [d.specialty, d.subRegion, d.accountName]
        .filter(Boolean)
        .join(" - "),
      badge: d.specialty || undefined,
    }));
  }, [filteredDoctors]);

  const productOptions: ComboboxOption[] = useMemo(() => {
    return products.map((p) => ({
      value: p.name,
      label: p.name,
      metadata: p.category || p.internalRef || undefined,
      badge: p.category || undefined,
    }));
  }, [products]);

  // Preselect date if initialDate prop is passed
  useEffect(() => {
    if (initialDate) {
      form.setValue("date", initialDate);
    }
  }, [initialDate, form]);

  useEffect(() => {
    if (preselectedDoctorId) {
      const selected = doctors.find((d) => d.id === preselectedDoctorId);
      if (selected && selected.accountName) {
        setSelectedHospital(selected.accountName);
      }
    }
  }, [preselectedDoctorId, doctors]);

  useEffect(() => {
    const selectedDoctorId = form.getValues("doctorId");

    if (!selectedDoctorId) {
      return;
    }

    const isDoctorAvailable = filteredDoctors.some(
      (doctor) => doctor.id === selectedDoctorId,
    );

    if (!isDoctorAvailable) {
      form.setValue("doctorId", "", { shouldValidate: true });
    }
  }, [filteredDoctors, form]);

  const visitType = hasVisitType ? form.watch("visitType") : undefined;

  async function onSubmit(values: VisitFormValues) {
    const result = await createVisit(values);

    if (result.success) {
      toast.success({ title: "Visit scheduled successfully" });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectPath);
        router.refresh();
      }
    } else {
      toast.error({
        title: "Failed to schedule visit",
        description: result.error?.message,
      });
    }
  }

  const showSupervisorField = role === "MANAGER" && visitType === "MANAGER";
  const showMedicalRepField =
    (role === "MANAGER" || role === "SUPERVISOR") && visitType === "COACHING";

  const renderComboboxProps = {
    triggerClassName: comboboxTriggerClassName,
    dropdownClassName: comboboxDropdownClassName,
    searchShellClassName: "bg-[#FBFCFE] border-[#EEF1F6]",
    searchInputClassName: "text-sm placeholder:text-[#98A2B3]",
    optionClassName:
      "rounded-[9px] px-3 py-2.5 text-sm hover:bg-[#FFFDF7] hover:text-[#8A6515]",
    selectedOptionClassName: comboboxSelectedClassName,
    badgeClassName: comboboxBadgeClassName,
    clearButtonClassName: "hover:bg-[#FFF8E5] hover:text-[#8A6515]",
    chevronClassName: "text-[#8A94A6]",
    checkClassName: "text-[#B18732]",
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          isModal
            ? "flex min-h-0 flex-1 flex-col overflow-hidden"
            : "rounded-[16px] border border-[#E5E8EF] bg-white p-6 shadow-none",
        )}
      >
        <div
          className={cn(
            isModal
              ? "visits-add-form-body min-h-0 flex-1 overflow-y-auto bg-[#FBFCFE] px-5 py-5 sm:px-6"
              : "",
          )}
        >
          <section>
            <div className="mb-5">
              <h3 className="text-base font-semibold text-[#182033]">
                Visit Information
              </h3>
              <p className="mt-1 text-xs leading-5 font-medium text-[#667085]">
                All times are in Saudi Arabia timezone (Asia/Riyadh).
              </p>
            </div>

            <div
              className={cn(
                "grid grid-cols-1 gap-4",
                !isModal && "md:grid-cols-2",
              )}
            >
              <div className={cn(!isModal && "md:col-span-2")}>
                <label className={cn("block", labelClassName)}>
                  Hospital Filter
                </label>
                <div className="mt-2">
                  <Combobox
                    {...renderComboboxProps}
                    options={hospitalOptions}
                    value={selectedHospital}
                    onChange={setSelectedHospital}
                    placeholder="All Hospitals"
                    searchPlaceholder="Type hospital name..."
                    emptyText="No hospitals found"
                    labelFormatter={(option) => (
                      <span className="flex min-w-0 items-center gap-2">
                        <Building2
                          className="size-4 shrink-0 text-[#B18732]"
                          aria-hidden="true"
                        />
                        <span className="truncate">{option.label}</span>
                      </span>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClassName}>
                      Doctor <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        {...renderComboboxProps}
                        options={doctorOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Search doctor..."
                        searchPlaceholder="Type doctor name or specialty..."
                        emptyText="No doctors matching search"
                        startTypingText="Start typing to search doctors..."
                        labelFormatter={(option) => (
                          <span className="flex min-w-0 items-center gap-2">
                            <Stethoscope
                              className="size-4 shrink-0 text-[#B18732]"
                              aria-hidden="true"
                            />
                            <span className="truncate">{option.label}</span>
                          </span>
                        )}
                      />
                    </FormControl>
                    <FormMessage className="visits-add-error text-xs font-medium text-[#B42318]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="products"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClassName}>
                      Products / Samples
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        {...renderComboboxProps}
                        options={productOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Search product..."
                        searchPlaceholder="Type product name or category..."
                        emptyText="No products found"
                        startTypingText="Start typing to search products..."
                        labelFormatter={(option) => (
                          <span className="flex min-w-0 items-center gap-2">
                            <PackageSearch
                              className="size-4 shrink-0 text-[#B18732]"
                              aria-hidden="true"
                            />
                            <span className="truncate">{option.label}</span>
                          </span>
                        )}
                      />
                    </FormControl>
                    <FormMessage className="visits-add-error text-xs font-medium text-[#B42318]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClassName}>
                      Visit Date <RequiredMark />
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            className={fieldButtonClassName}
                          >
                            <CalendarIcon
                              className="mr-2 size-4 text-[#8A94A6]"
                              aria-hidden="true"
                            />
                            <span className="truncate">
                              {field.value
                                ? formatSaudiDateDisplay(field.value)
                                : "Select date"}
                            </span>
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        sideOffset={8}
                        className="visits-add-date-popover w-auto rounded-[16px] border border-[#E5E8EF] bg-white p-3 shadow-[0_18px_46px_rgba(16,27,51,0.14)]"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const todaySaudi = parseDateValue(
                              formatDateOnly(new Date()),
                            );
                            const pickedSaudi = parseDateValue(
                              formatDateOnly(date),
                            );
                            return pickedSaudi < todaySaudi;
                          }}
                          className="visits-add-calendar rounded-none bg-transparent p-0"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="visits-add-error text-xs font-medium text-[#B42318]" />
                  </FormItem>
                )}
              />

              {hasVisitType && (
                <FormField
                  control={form.control}
                  name="visitType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClassName}>
                        Visit Type <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className={fieldClassName}>
                            <UserCheck
                              className="size-4 text-[#8A94A6]"
                              aria-hidden="true"
                            />
                            <SelectValue placeholder="Select visit type" />
                          </SelectTrigger>
                          <SelectContent className={selectContentClassName}>
                            <SelectItem
                              value="CHECK"
                              className={selectItemClassName}
                            >
                              Check visit
                            </SelectItem>
                            <SelectItem
                              value="COACHING"
                              className={selectItemClassName}
                            >
                              Coaching visit
                            </SelectItem>
                            {role === "MANAGER" && (
                              <SelectItem
                                value="MANAGER"
                                className={selectItemClassName}
                              >
                                Manager visit
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="visits-add-error text-xs font-medium text-[#B42318]" />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClassName}>
                      Visit Time <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className={fieldClassName}>
                          <Clock3
                            className="size-4 text-[#8A94A6]"
                            aria-hidden="true"
                          />
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent
                          className={cn(selectContentClassName, "max-h-72")}
                        >
                          {HOURS.map((h) => (
                            <SelectItem
                              key={h}
                              value={h}
                              className={selectItemClassName}
                            >
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="visits-add-error text-xs font-medium text-[#B42318]" />
                  </FormItem>
                )}
              />

              {showSupervisorField && (
                <FormField
                  control={form.control}
                  name="supervisorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClassName}>
                        Supervisor <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className={fieldClassName}>
                            <Users
                              className="size-4 text-[#8A94A6]"
                              aria-hidden="true"
                            />
                            <SelectValue placeholder="Select supervisor" />
                          </SelectTrigger>
                          <SelectContent
                            className={cn(selectContentClassName, "max-h-72")}
                          >
                            {supervisors.map((s) => (
                              <SelectItem
                                key={s.id}
                                value={s.id}
                                className={selectItemClassName}
                              >
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="visits-add-error text-xs font-medium text-[#B42318]" />
                    </FormItem>
                  )}
                />
              )}

              {showMedicalRepField && (
                <FormField
                  control={form.control}
                  name="medicalRepId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClassName}>
                        Medical Rep <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className={fieldClassName}>
                            <Users
                              className="size-4 text-[#8A94A6]"
                              aria-hidden="true"
                            />
                            <SelectValue placeholder="Select medical rep" />
                          </SelectTrigger>
                          <SelectContent
                            className={cn(selectContentClassName, "max-h-72")}
                          >
                            {medicalReps.map((r) => (
                              <SelectItem
                                key={r.id}
                                value={r.id}
                                className={selectItemClassName}
                              >
                                {r.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="visits-add-error text-xs font-medium text-[#B42318]" />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className={cn(!isModal && "md:col-span-2")}>
                    <FormLabel className={labelClassName}>
                      Visit Notes
                    </FormLabel>
                    <div className="relative">
                      <CalendarCheck2
                        className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-[#8A94A6]"
                        aria-hidden="true"
                      />
                      <FormControl>
                        <Textarea
                          placeholder="Enter any additional notes or objectives for this visit..."
                          {...field}
                          className="min-h-[104px] resize-none rounded-[12px] border border-[#E5E8EF] bg-white px-3.5 py-3 pl-10 text-sm font-medium text-[#182033] shadow-none transition-[border-color,background-color,box-shadow] duration-[160ms] placeholder:text-[#98A2B3] focus-visible:border-[#C9A44C] focus-visible:bg-[#FFFDF7] focus-visible:ring-[3px] focus-visible:ring-[#C9A44C]/10 aria-invalid:border-[#D92D20] aria-invalid:ring-[#D92D20]/10"
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="visits-add-error text-xs font-medium text-[#B42318]" />
                  </FormItem>
                )}
              />
            </div>
          </section>
        </div>

        <div
          className={cn(
            isModal
              ? "visits-add-form-footer sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-[#EEF1F6] bg-white/95 px-5 py-4 backdrop-blur sm:flex-row sm:justify-end sm:px-6"
              : "mt-5 flex items-center justify-end gap-3 border-t border-[#EEF1F6] pt-4",
          )}
        >
          {isModal && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
              className="h-11 rounded-[10px] border-[#E5E8EF] px-5 text-sm font-semibold text-[#475467] shadow-none transition-[background-color,border-color,color,transform] duration-[160ms] hover:-translate-y-px hover:border-[#D8DEE8] hover:bg-[#F9FAFB] hover:text-[#182033] focus-visible:ring-3 focus-visible:ring-[#C9A44C]/15 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isPending}
            className="group h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[#C9A44C] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(201,164,76,0.18)] transition-[background-color,color,transform,box-shadow] duration-[170ms] hover:-translate-y-px hover:bg-[#B18732] hover:text-white hover:shadow-[0_10px_24px_rgba(201,164,76,0.22)] focus-visible:ring-3 focus-visible:ring-[#C9A44C]/25 focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <CalendarCheck2
                className="size-4 transition-transform duration-[170ms] group-hover:-translate-y-0.5 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
                aria-hidden="true"
              />
            )}
            {isPending ? "Scheduling..." : "Schedule Visit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
