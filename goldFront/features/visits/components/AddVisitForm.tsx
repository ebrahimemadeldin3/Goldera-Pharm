"use client";

import { useMemo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
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
  formatDateOnly,
  formatSaudiDateDisplay,
  parseDateValue,
} from "@/lib/utils";

type RoleBasedAddVisitFormProps =
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
    };

// Shared constants

export default function AddVisitForm(props: RoleBasedAddVisitFormProps) {
  const { role, doctors } = props;    

 
  const supervisors = "supervisors" in props ? props.supervisors : [];
  const medicalReps = "medicalReps" in props ? props.medicalReps : [];

  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDoctorId = searchParams.get("doctorId");
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

  // Select schema and config based on role
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

  useEffect(() => {
    if (!preselectedDoctorId) {
      return;
    }

    const preselectedDoctor = doctors.find(
      (doctor) => doctor.id === preselectedDoctorId,
    );
    if (!preselectedDoctor) {
      return;
    }

    setSelectedHospital(preselectedDoctor.accountName || "Unassigned");
  }, [doctors, preselectedDoctorId]);

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
      router.push(redirectPath);
      router.refresh();
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="border-secondary-light rounded-[14px] border-[0.8px] bg-white p-6"
      >
        <h3 className="mb-4 text-lg font-medium">Visit Information</h3>
        <p className="text-secondary-dark mb-4 text-xs">
          Date selection uses Saudi Arabia timezone (Asia/Riyadh).
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <FormLabel>Hospital Filter</FormLabel>
            <Select
              value={selectedHospital}
              onValueChange={setSelectedHospital}
            >
              <SelectTrigger className="input mt-2 w-full">
                <SelectValue placeholder="All hospitals" />
              </SelectTrigger>
              <SelectContent className="max-h-75">
                <SelectItem value="all">All Hospitals</SelectItem>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital} value={hospital}>
                    {hospital}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div />

          {/* Doctor Field */}
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doctor *</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={`input w-full`}>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent className="max-h-75">
                      {filteredDoctors.length === 0 ? (
                        <div className="text-secondary-dark px-3 py-2 text-sm">
                          No doctors available for selected hospital
                        </div>
                      ) : (
                        filteredDoctors.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.nameEN} - {d.nameAR} (
                            {d.accountName || "Unassigned"})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Products Field */}
          <FormField
            control={form.control}
            name="products"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Products/Samples</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="input w-full">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent className="max-h-75">
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.name}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Visit Date Field */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visit Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="input w-full justify-start text-left"
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
                      disabled={(date) => {
                        const todaySaudi = parseDateValue(
                          formatDateOnly(new Date()),
                        );
                        const pickedSaudi = parseDateValue(
                          formatDateOnly(date),
                        );
                        return pickedSaudi < todaySaudi;
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Visit Type Field - Only for MANAGER and SUPERVISOR */}
          {hasVisitType && (
            <FormField
              control={form.control}
              name="visitType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visit Type *</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="input w-full">
                        <SelectValue placeholder="Select visit type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CHECK">Check visit</SelectItem>
                        <SelectItem value="COACHING">Coaching visit</SelectItem>
                        {role === "MANAGER" && (
                          <SelectItem value="MANAGER">Manager visit</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Visit Time Field */}
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visit Time *</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="input w-full">
                      <SelectValue placeholder="Select hour" />
                    </SelectTrigger>
                    <SelectContent className="max-h-75">
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Supervisor Field - Only for MANAGER when visitType is MANAGER */}
          {showSupervisorField && (
            <FormField
              control={form.control}
              name="supervisorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supervisor *</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="input w-full">
                        <SelectValue placeholder="Select supervisor" />
                      </SelectTrigger>
                      <SelectContent className="max-h-75">
                        {supervisors.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Medical Rep Field - For MANAGER/SUPERVISOR when visitType is COACHING */}
          {showMedicalRepField && (
            <FormField
              control={form.control}
              name="medicalRepId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medical Rep *</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="input w-full">
                        <SelectValue placeholder="Select medical rep" />
                      </SelectTrigger>
                      <SelectContent className="max-h-75">
                        {medicalReps.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Visit Notes Field */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Visit Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter any additional notes or objectives for this visit..."
                    {...field}
                    className="input min-h-18"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-system-primary border-system-primary hover:text-system-primary inline-flex cursor-pointer items-center gap-2 border hover:bg-white"
          >
            <Plus className="h-4 w-4" />
            {isPending ? "Scheduling..." : "Schedule Visit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
