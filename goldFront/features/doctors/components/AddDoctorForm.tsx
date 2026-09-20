"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  BriefcaseMedical,
  Layers3,
  Loader2,
  MapPin,
  MapPinned,
  Phone,
  Plus,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { createDoctorAction } from "../api";
import { addDoctorSchema, type AddDoctorFormValues } from "../lib/schemas";
import type { CreateDoctorDto } from "../lib/types/api";
import { useRoleUI } from "@/core/ui/role-ui-context";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils";
import {
  KSA_TERRITORY_STRUCTURE,
  getTerritoryLookup,
} from "@/features/plan/lib/territory";
import { toast } from "@/lib/utils/toast";

type AddDoctorFormProps = {
  isModal?: boolean;
  onSuccess?: (doctorName: string) => void;
  onCancel?: () => void;
};

const fieldClassName =
  "border-gp-border-default bg-white text-gp-navy-900 placeholder:text-gp-text-placeholder focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/10 h-11 rounded-[12px] text-sm font-medium shadow-none transition-[border-color,box-shadow,background-color] duration-[150ms]";
const labelClassName = "text-gp-navy-900 text-xs font-semibold";
const selectContentClassName =
  "plans-select-content border-gp-border-control bg-white p-1 shadow-gp-popover";
const selectItemClassName =
  "min-h-10 cursor-pointer rounded-[8px] py-1.5 pr-8 pl-2 text-sm font-semibold text-gp-navy-900 focus:bg-gp-gold-50 focus:text-gp-navy-900 data-[state=checked]:bg-gp-gold-50 data-[state=checked]:text-gp-navy-900";

function RequiredMark() {
  return <span className="text-gp-danger">*</span>;
}

function buildCreateDoctorPayload(
  values: AddDoctorFormValues,
): CreateDoctorDto {
  const avgPatients = values.avgPatients?.trim();
  const license = values.license?.trim();
  const email = values.email?.trim();

  return {
    nameEN: values.nameEN.trim(),
    nameAR: values.nameAR.trim(),
    email: email || undefined,
    phone: values.phone.trim(),
    grade: values.grade.trim(),
    specialty: values.specialty.trim(),
    LicenseNumber: license || undefined,
    avgPatientsPerDay: avgPatients ? Number(avgPatients) : undefined,
    accountName: values.accountName.trim(),
    subRegion: values.subRegion.trim(),
  };
}

function FormSection({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: typeof UserRound;
  children: React.ReactNode;
}) {
  return (
    <section className="border-gp-border-subtle rounded-[14px] border bg-white p-4">
      <div className="mb-4 flex items-start gap-3">
        <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-9 shrink-0 items-center justify-center rounded-[10px] border">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-gp-navy-900 text-sm font-semibold">{title}</h3>
          <p className="text-gp-text-muted mt-0.5 text-xs font-medium">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function FieldShell({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <FormItem>
      <FormLabel className={labelClassName}>
        {label} {required && <RequiredMark />}
      </FormLabel>
      <FormControl>{children}</FormControl>
      <FormMessage className="text-gp-danger text-xs font-medium" />
    </FormItem>
  );
}

export default function AddDoctorForm({
  isModal = false,
  onSuccess,
  onCancel,
}: AddDoctorFormProps) {
  const router = useRouter();
  const { role } = useRoleUI();
  const isManager = role === "MANAGER";
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");

  const form = useForm<AddDoctorFormValues>({
    resolver: zodResolver(addDoctorSchema),
    shouldFocusError: true,
    defaultValues: {
      nameEN: "",
      nameAR: "",
      specialty: "",
      subRegion: "",
      license: "",
      email: "",
      phone: "",
      grade: "",
      avgPatients: "",
      accountName: "",
    },
  });

  const selectedTerritory = useWatch({
    control: form.control,
    name: "subRegion",
  });
  const territoryLookup = getTerritoryLookup(selectedTerritory);
  const [district, setDistrict] = useState("");
  const [region, setRegion] = useState("");

  const regionOptions = useMemo(() => {
    return (
      KSA_TERRITORY_STRUCTURE.find((item) => item.name === district)?.regions ??
      []
    );
  }, [district]);

  const territoryOptions = useMemo(() => {
    return (
      regionOptions.find((item) => item.name === region)?.territories ?? []
    );
  }, [region, regionOptions]);

  const getBackHref = () => {
    if (role === "MANAGER") return "/manager/doctors";
    if (role === "SUPERVISOR") return "/supervisor/doctors";
    return "/rep/doctors";
  };

  const updateDistrict = (value: string) => {
    setDistrict(value);
    setRegion("");
    form.setValue("subRegion", "", { shouldValidate: true });
  };

  const updateRegion = (value: string) => {
    setRegion(value);
    form.setValue("subRegion", "", { shouldValidate: true });
  };

  const onSubmit = (values: AddDoctorFormValues) => {
    setError("");
    startTransition(async () => {
      const payload = buildCreateDoctorPayload(values);
      try {
        const result = await createDoctorAction(payload);
        if (result.success) {
          if (onSuccess) {
            onSuccess(payload.nameEN);
          } else {
            toast.success({
              title: "Doctor added successfully",
              description: `${payload.nameEN} is now available.`,
            });
            router.push(getBackHref());
            router.refresh();
          }
        } else if (result.error) {
          const message =
            result.error.message ||
            "The doctor could not be created. Check the entered information and try again.";
          setError(message);
          toast.error({
            title: "Couldn't add doctor",
            description: message,
          });
        }
      } catch (err) {
        const message =
          (err as Error)?.message ||
          "The doctor could not be created. Check the entered information and try again.";
        setError(message);
        toast.error({
          title: "Couldn't add doctor",
          description: message,
        });
      }
    });
  };

  const formContent = (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          !isModal && "border-gp-border-default rounded-[16px] border bg-white",
        )}
      >
        <div
          className={cn(
            "space-y-4",
            isModal
              ? "bg-gp-surface-page min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6"
              : "p-4 sm:p-6",
          )}
        >
          {error && (
            <div className="border-gp-danger-border bg-gp-danger-soft text-gp-danger rounded-[12px] border p-3 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="border-gp-border-subtle grid gap-2 rounded-[14px] border bg-white p-3 sm:grid-cols-3">
            {[
              "01 Basic Information",
              "02 Professional Details",
              "03 Territory & Account",
            ].map((step) => (
              <div
                key={step}
                className="border-gp-border-subtle bg-gp-surface-subtle text-gp-navy-900 rounded-[10px] border px-3 py-2 text-xs font-semibold"
              >
                {step}
              </div>
            ))}
          </div>

          <FormSection
            title="Identity"
            subtitle="Doctor names as they should appear across CRM records."
            icon={UserRound}
          >
            <FormField
              control={form.control}
              name="nameEN"
              render={({ field }) => (
                <FieldShell label="English Name" required>
                  <Input
                    {...field}
                    className={fieldClassName}
                    placeholder="Dr. Mohammed Al-Rashid"
                    autoComplete="name"
                  />
                </FieldShell>
              )}
            />
            <FormField
              control={form.control}
              name="nameAR"
              render={({ field }) => (
                <FieldShell label="Arabic Name" required>
                  <Input
                    {...field}
                    className={fieldClassName}
                    placeholder="د. محمد الراشد"
                    dir="auto"
                  />
                </FieldShell>
              )}
            />
          </FormSection>

          <FormSection
            title="Professional Information"
            subtitle="Clinical specialty, grade and professional identifiers."
            icon={BriefcaseMedical}
          >
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FieldShell label="Specialty" required>
                  <Input
                    {...field}
                    className={fieldClassName}
                    placeholder="e.g. Dermatologist"
                  />
                </FieldShell>
              )}
            />
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FieldShell label="Grade" required>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={fieldClassName}>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent className={selectContentClassName}>
                      {["A", "B", "C", "D"].map((grade) => (
                        <SelectItem
                          key={grade}
                          value={grade}
                          className={selectItemClassName}
                        >
                          Grade {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldShell>
              )}
            />
            <FormField
              control={form.control}
              name="license"
              render={({ field }) => (
                <FieldShell label="License Number">
                  <Input
                    {...field}
                    className={fieldClassName}
                    placeholder="License number"
                  />
                </FieldShell>
              )}
            />
            <FormField
              control={form.control}
              name="avgPatients"
              render={({ field }) => (
                <FieldShell label="Avg. Patients / Day">
                  <Input
                    {...field}
                    className={fieldClassName}
                    type="number"
                    min={0}
                    placeholder="50"
                  />
                </FieldShell>
              )}
            />
          </FormSection>

          <FormSection
            title="Contact"
            subtitle="Direct contact details used by field teams."
            icon={Phone}
          >
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FieldShell label="Phone Number" required>
                  <Input
                    {...field}
                    className={fieldClassName}
                    placeholder="+966 50 123 4567"
                    autoComplete="tel"
                  />
                </FieldShell>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FieldShell label="Email">
                  <Input
                    {...field}
                    className={fieldClassName}
                    type="email"
                    placeholder="doctor@hospital.sa"
                    autoComplete="email"
                  />
                </FieldShell>
              )}
            />
          </FormSection>

          <FormSection
            title="Territory & Account"
            subtitle="Assign the doctor to the official field hierarchy."
            icon={MapPinned}
          >
            <FormItem>
              <FormLabel className={labelClassName}>
                District <RequiredMark />
              </FormLabel>
              <Select onValueChange={updateDistrict} value={district}>
                <SelectTrigger className={fieldClassName}>
                  <Layers3 className="text-gp-gold-600 size-4" />
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent className={selectContentClassName}>
                  {KSA_TERRITORY_STRUCTURE.map((item) => (
                    <SelectItem
                      key={item.name}
                      value={item.name}
                      className={selectItemClassName}
                    >
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>

            <FormItem>
              <FormLabel className={labelClassName}>
                Region <RequiredMark />
              </FormLabel>
              <Select
                onValueChange={updateRegion}
                value={region}
                disabled={!district}
              >
                <SelectTrigger className={fieldClassName}>
                  <MapPinned className="text-gp-gold-600 size-4" />
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent className={selectContentClassName}>
                  {regionOptions.map((item) => (
                    <SelectItem
                      key={item.name}
                      value={item.name}
                      className={selectItemClassName}
                    >
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>

            <FormField
              control={form.control}
              name="subRegion"
              render={({ field }) => (
                <FieldShell label="Territory" required>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!region}
                  >
                    <SelectTrigger className={fieldClassName}>
                      <MapPin className="text-gp-gold-600 size-4" />
                      <SelectValue placeholder="Select territory" />
                    </SelectTrigger>
                    <SelectContent className={selectContentClassName}>
                      {territoryOptions.map((item) => (
                        <SelectItem
                          key={item.name}
                          value={item.name}
                          className={selectItemClassName}
                        >
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldShell>
              )}
            />

            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FieldShell label="Account / Facility" required>
                  <Input
                    {...field}
                    className={fieldClassName}
                    placeholder="King Faisal Hospital"
                    dir="auto"
                  />
                </FieldShell>
              )}
            />

            {selectedTerritory && (
              <div className="border-gp-border-subtle bg-gp-surface-subtle text-gp-text-muted rounded-[10px] border px-3 py-2 text-xs font-medium md:col-span-2">
                Selected hierarchy:{" "}
                <span className="text-gp-navy-900 font-semibold">
                  {territoryLookup.district} / {territoryLookup.region} /{" "}
                  {territoryLookup.territory}
                </span>
              </div>
            )}
          </FormSection>
        </div>

        <div
          className={cn(
            "border-gp-border-subtle flex flex-col-reverse gap-3 border-t bg-white px-5 py-4 sm:flex-row sm:justify-end",
            isModal && "sticky bottom-0 z-10",
          )}
        >
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
              className="border-gp-border-control text-gp-navy-900 h-10 cursor-pointer rounded-[10px] px-5 text-sm font-semibold shadow-none"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isPending}
            className="group bg-gp-navy-900 hover:bg-gp-navy-900/95 h-10 cursor-pointer rounded-[10px] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(16,29,54,0.16)] transition-[background-color,box-shadow,transform] duration-[170ms] hover:-translate-y-px hover:shadow-[0_10px_24px_rgba(16,29,54,0.2)] disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus
                className="text-gp-gold-500 size-4 transition-transform duration-[170ms] group-hover:rotate-90 motion-reduce:transition-none"
                aria-hidden="true"
              />
            )}
            {isPending ? "Adding Doctor..." : "Add Doctor"}
          </Button>
        </div>
      </form>
    </Form>
  );

  if (isModal) return formContent;

  return (
    <PageContainer
      className={cn(
        "flex flex-col gap-5",
        isManager && "min-h-[calc(100vh-80px)] overflow-x-hidden bg-[#F6F8FB]",
      )}
    >
      <header className="flex flex-wrap items-center gap-3">
        <Link
          href={getBackHref()}
          className="border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-gold-50 inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] border bg-white transition-colors"
          aria-label="Back to doctors"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-gp-gold-700 text-[11px] font-semibold tracking-[0.14em] uppercase">
            Field Operations
          </p>
          <h1
            className={cn(
              "text-gp-navy-900 mt-1 font-semibold",
              isManager
                ? "text-[30px] leading-tight sm:text-[34px]"
                : "text-2xl md:text-3xl",
            )}
          >
            Add New Doctor
          </h1>
          <p className="text-gp-text-muted mt-1 text-sm font-medium">
            Create a doctor profile and assign territory coverage.
          </p>
        </div>
        <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 hidden size-11 items-center justify-center rounded-[12px] border sm:flex">
          <Stethoscope className="size-5" aria-hidden="true" />
        </span>
      </header>

      {formContent}
    </PageContainer>
  );
}
