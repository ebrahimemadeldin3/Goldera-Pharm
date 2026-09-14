"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  Layers3,
  Loader2,
  MapPin,
  MapPinned,
  Plus,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";
import {
  KSA_TERRITORY_STRUCTURE,
  getTerritoryLookup,
} from "@/features/plan/lib/territory";
import { createPharmacyAction } from "../api";
import {
  createPharmacySchema,
  type CreatePharmacyFormValues,
} from "../lib/schemas";

type PharmacyFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

type CityRule = {
  labels: string[];
  terms: string[];
};

const fieldClassName =
  "border-gp-border-default bg-white text-gp-navy-900 placeholder:text-gp-text-placeholder focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/10 h-11 rounded-[12px] text-sm font-medium shadow-none transition-[border-color,box-shadow,background-color] duration-[150ms] disabled:bg-gp-surface-subtle disabled:text-gp-text-placeholder disabled:opacity-100";
const labelClassName = "text-gp-navy-900 text-xs font-semibold";
const selectContentClassName =
  "plans-select-content border-gp-border-control bg-white p-1 shadow-gp-popover";
const selectItemClassName =
  "min-h-10 cursor-pointer rounded-[8px] py-1.5 pr-8 pl-2 text-sm font-semibold text-gp-navy-900 focus:bg-gp-gold-50 focus:text-gp-navy-900 data-[state=checked]:bg-gp-gold-50 data-[state=checked]:text-gp-navy-900";

const territoryCityRules: Record<string, CityRule> = {
  "Riyadh 1": { labels: ["Riyadh"], terms: ["riyadh"] },
  "Riyadh 2": { labels: ["Riyadh"], terms: ["riyadh"] },
  "Jeddah 1": { labels: ["Jeddah"], terms: ["jeddah"] },
  "Jeddah 2": { labels: ["Jeddah"], terms: ["jeddah"] },
  "Makkah / Taif": {
    labels: ["Makkah", "Taif"],
    terms: ["makkah", "taif"],
  },
  Madinah: { labels: ["Madinah"], terms: ["madinah", "medinah"] },
  Southern: { labels: ["Gizan", "Abha"], terms: ["gizan", "jizan", "abha"] },
};

function RequiredMark() {
  return <span className="text-gp-danger">*</span>;
}

function StepProgress({
  basicComplete,
  territoryComplete,
}: {
  basicComplete: boolean;
  territoryComplete: boolean;
}) {
  const territoryActive = basicComplete || territoryComplete;

  return (
    <div className="gp-form-section border-gp-border-subtle bg-gp-surface-subtle rounded-[14px] border p-3 [--gp-form-section-delay:40ms]">
      <div className="grid grid-cols-[auto_minmax(32px,1fr)_auto] items-center gap-3">
        <div
          className={cn(
            "flex min-w-0 items-center gap-2 rounded-[10px] px-2.5 py-2 transition-colors duration-[180ms]",
            basicComplete ? "bg-gp-gold-50 text-gp-navy-900" : "bg-white",
          )}
        >
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
              basicComplete
                ? "border-gp-gold-500 bg-gp-navy-900 text-gp-gold-500"
                : "border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700",
            )}
          >
            {basicComplete ? <Check className="size-3.5" /> : "01"}
          </span>
          <span className="min-w-0">
            <span className="text-gp-navy-900 block truncate text-xs font-semibold">
              Basic Information
            </span>
            <span className="text-gp-text-muted block truncate text-[11px] font-medium">
              Name, city, country
            </span>
          </span>
        </div>

        <span
          className={cn(
            "h-px rounded-full transition-colors duration-[180ms]",
            basicComplete ? "bg-gp-gold-500" : "bg-gp-border-default",
          )}
          aria-hidden="true"
        />

        <div
          className={cn(
            "flex min-w-0 items-center gap-2 rounded-[10px] px-2.5 py-2 transition-colors duration-[180ms]",
            territoryActive
              ? "text-gp-navy-900 bg-white"
              : "text-gp-text-muted",
            territoryComplete && "bg-gp-gold-50",
          )}
        >
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
              territoryComplete
                ? "border-gp-gold-500 bg-gp-navy-900 text-gp-gold-500"
                : territoryActive
                  ? "border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700"
                  : "border-gp-border-control text-gp-text-placeholder bg-white",
            )}
          >
            {territoryComplete ? <Check className="size-3.5" /> : "02"}
          </span>
          <span className="min-w-0">
            <span className="text-gp-navy-900 block truncate text-xs font-semibold">
              Territory
            </span>
            <span className="text-gp-text-muted block truncate text-[11px] font-medium">
              District, region, territory
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function FieldShell({
  label,
  required = false,
  children,
  hint,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <FormItem className={className}>
      <FormLabel className={labelClassName}>
        {label} {required && <RequiredMark />}
      </FormLabel>
      <FormControl>{children}</FormControl>
      {hint && (
        <p className="text-gp-text-muted text-[11px] leading-4 font-medium">
          {hint}
        </p>
      )}
      <FormMessage className="text-gp-danger text-xs font-medium" />
    </FormItem>
  );
}

function SectionTitle({
  title,
  icon: Icon,
}: {
  title: string;
  icon: typeof Store;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-8 shrink-0 items-center justify-center rounded-[9px] border">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <h3 className="text-gp-navy-900 text-sm font-semibold tracking-[0.04em] uppercase">
        {title}
      </h3>
    </div>
  );
}

function getCityWarning(city: string, territory: string) {
  const rule = territoryCityRules[territory];
  const cityKey = city.trim().toLowerCase();

  if (!rule || !cityKey) return "";

  const matches = rule.terms.some((term) => cityKey.includes(term));
  if (matches) return "";

  return `This territory usually maps to ${rule.labels.join(" or ")}. Check the city before submitting.`;
}

export function PharmacyForm({ onSuccess, onCancel }: PharmacyFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [district, setDistrict] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);

  const form = useForm<CreatePharmacyFormValues>({
    resolver: zodResolver(createPharmacySchema),
    shouldFocusError: true,
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      city: "",
      subRegion: "",
      region: "",
      country: "Saudi Arabia",
    },
  });

  const pharmacyName = useWatch({ control: form.control, name: "name" });
  const city = useWatch({ control: form.control, name: "city" });
  const country = useWatch({ control: form.control, name: "country" });
  const selectedRegion = useWatch({ control: form.control, name: "region" });
  const selectedTerritory = useWatch({
    control: form.control,
    name: "subRegion",
  });
  const territoryLookup = getTerritoryLookup(selectedTerritory);
  const cityWarning = getCityWarning(city, selectedTerritory);
  const basicComplete = Boolean(
    pharmacyName?.trim() && city?.trim() && country?.trim(),
  );
  const territoryComplete = Boolean(
    district && selectedRegion && selectedTerritory,
  );

  const regionOptions = useMemo(() => {
    return (
      KSA_TERRITORY_STRUCTURE.find((item) => item.name === district)?.regions ??
      []
    );
  }, [district]);

  const territoryOptions = useMemo(() => {
    return (
      regionOptions.find((item) => item.name === selectedRegion)?.territories ??
      []
    );
  }, [regionOptions, selectedRegion]);

  useEffect(() => {
    if (form.formState.submitCount === 0) return;

    const invalidField = formRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]',
    );

    if (!invalidField) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.requestAnimationFrame(() => {
      invalidField.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      });
      invalidField.focus({ preventScroll: true });
    });
  }, [form.formState.errors, form.formState.submitCount]);

  function updateDistrict(value: string) {
    setDistrict(value);
    form.setValue("region", "", {
      shouldDirty: true,
      shouldTouch: form.formState.isSubmitted,
      shouldValidate: form.formState.isSubmitted,
    });
    form.setValue("subRegion", "", {
      shouldDirty: true,
      shouldTouch: form.formState.isSubmitted,
      shouldValidate: form.formState.isSubmitted,
    });
  }

  function updateRegion(value: string) {
    form.setValue("region", value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: form.formState.isSubmitted,
    });
    form.setValue("subRegion", "", {
      shouldDirty: true,
      shouldTouch: form.formState.isSubmitted,
      shouldValidate: form.formState.isSubmitted,
    });
  }

  function onSubmit(values: CreatePharmacyFormValues) {
    setError("");

    if (!district) {
      setError("Select a district before adding the pharmacy.");
      return;
    }

    const validRegion = regionOptions.some(
      (item) => item.name === values.region,
    );
    const validTerritory = territoryOptions.some(
      (item) => item.name === values.subRegion,
    );

    if (!validRegion || !validTerritory) {
      setError("Select a valid district, region and territory combination.");
      return;
    }

    startTransition(async () => {
      const result = await createPharmacyAction({
        name: values.name.trim(),
        city: values.city.trim(),
        subRegion: values.subRegion,
        region: values.region,
        country: values.country.trim() || "Saudi Arabia",
      });

      if (result.success) {
        form.reset();
        setDistrict("");
        toast.success({ title: "Pharmacy added successfully" });
        onSuccess?.();
      } else {
        const message =
          result.error?.message ||
          "Unable to add pharmacy. Please check the entered information and try again.";
        setError(message);
        toast.error({ title: "Unable to add pharmacy", description: message });
      }
    });
  }

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="bg-gp-surface-page min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
          <StepProgress
            basicComplete={basicComplete}
            territoryComplete={territoryComplete}
          />

          {error && (
            <div className="border-gp-danger-border bg-gp-danger-soft text-gp-danger rounded-[12px] border p-3 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="gp-form-section border-gp-border-subtle rounded-[14px] border bg-white p-4 [--gp-form-section-delay:70ms]">
              <SectionTitle title="Basic Information" icon={Store} />
              <div className="space-y-3.5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FieldShell
                      label="Pharmacy Name"
                      required
                      hint="Use the account name exactly as it should appear in CRM."
                    >
                      <Input
                        {...field}
                        className={fieldClassName}
                        placeholder="Pharmacy name"
                        dir="auto"
                        autoComplete="organization"
                      />
                    </FieldShell>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FieldShell label="City" required>
                      <Input
                        {...field}
                        className={cn(
                          fieldClassName,
                          cityWarning &&
                            "border-gp-warning-border focus-visible:border-gp-gold-500",
                        )}
                        placeholder="Riyadh"
                        autoComplete="address-level2"
                      />
                    </FieldShell>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FieldShell label="Country" required>
                      <Input
                        {...field}
                        className={fieldClassName}
                        placeholder="Saudi Arabia"
                        autoComplete="country-name"
                      />
                    </FieldShell>
                  )}
                />
              </div>
            </section>

            <section className="gp-form-section border-gp-border-subtle rounded-[14px] border bg-white p-4 [--gp-form-section-delay:100ms]">
              <SectionTitle title="Territory Assignment" icon={MapPinned} />
              <div className="space-y-3.5">
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

                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FieldShell
                      label="Region"
                      required
                      hint={!district ? "Select a district first." : undefined}
                      className={district ? "gp-field-enabled" : undefined}
                    >
                      <Select
                        onValueChange={updateRegion}
                        value={field.value}
                        disabled={!district}
                      >
                        <SelectTrigger className={fieldClassName}>
                          <MapPinned className="text-gp-gold-600 size-4" />
                          <SelectValue
                            placeholder={
                              district
                                ? "Select region"
                                : "Select district first"
                            }
                          />
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
                    </FieldShell>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subRegion"
                  render={({ field }) => (
                    <FieldShell
                      label="Territory"
                      required
                      hint={
                        !selectedRegion ? "Select a region first." : undefined
                      }
                      className={
                        selectedRegion ? "gp-field-enabled" : undefined
                      }
                    >
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedRegion}
                      >
                        <SelectTrigger className={fieldClassName}>
                          <MapPin className="text-gp-gold-600 size-4" />
                          <SelectValue
                            placeholder={
                              selectedRegion
                                ? "Select territory"
                                : "Select region first"
                            }
                          />
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

                <div
                  className={cn(
                    "transition-[border-color,background-color,transform,opacity] duration-[200ms] motion-reduce:transition-none",
                    selectedTerritory
                      ? "translate-y-0 opacity-100"
                      : "translate-y-1 opacity-90",
                  )}
                >
                  <div
                    data-ready={selectedTerritory ? "true" : "false"}
                    className={cn(
                      "gp-territory-preview",
                      "rounded-[12px] border px-3 py-3",
                      selectedTerritory
                        ? "border-gp-gold-300 bg-gp-gold-50"
                        : "border-gp-border-subtle bg-gp-surface-subtle",
                    )}
                  >
                    <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.08em] uppercase">
                      Assigned Territory
                    </p>
                    {selectedTerritory ? (
                      <div className="text-gp-navy-900 mt-2 flex flex-wrap items-center gap-1.5 text-sm font-semibold">
                        <span>{territoryLookup.district}</span>
                        <ChevronRight className="text-gp-gold-600 size-3.5" />
                        <span>{territoryLookup.region}</span>
                        <ChevronRight className="text-gp-gold-600 size-3.5" />
                        <span>{territoryLookup.territory}</span>
                      </div>
                    ) : (
                      <p className="text-gp-text-muted mt-2 text-sm font-medium">
                        Complete the hierarchy to preview the assigned coverage.
                      </p>
                    )}
                  </div>

                  {cityWarning && (
                    <div
                      className="border-gp-warning-border bg-gp-warning-soft text-gp-gold-700 mt-2 flex items-start gap-2 rounded-[10px] border px-3 py-2 text-xs font-medium"
                      role="status"
                      aria-live="polite"
                    >
                      <AlertTriangle
                        className="mt-0.5 size-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{cityWarning}</span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="gp-form-section border-gp-border-subtle sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t bg-white px-5 py-4 [--gp-form-section-delay:130ms] sm:flex-row sm:items-center sm:justify-between">
          <div className="text-gp-text-muted hidden items-center gap-2 text-xs font-medium sm:flex">
            {territoryComplete ? (
              <>
                <CheckCircle2 className="text-gp-success size-4" />
                Territory ready to assign
              </>
            ) : (
              <>
                <MapPinned className="text-gp-gold-600 size-4" />
                Complete required fields before submitting
              </>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}
                className="border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-gold-50 h-10 cursor-pointer rounded-[10px] px-5 text-sm font-semibold shadow-none transition-[background-color,border-color,transform] duration-[170ms] hover:-translate-y-px motion-reduce:hover:translate-y-0"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isPending}
              className="gp-primary-action group bg-gp-navy-900 hover:bg-gp-navy-900/95 h-10 cursor-pointer rounded-[10px] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(16,29,54,0.16)] hover:shadow-[0_10px_24px_rgba(16,29,54,0.2)] disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Plus
                  className="text-gp-gold-500 size-4 transition-transform duration-[170ms] group-hover:rotate-90 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              )}
              {isPending ? "Adding Pharmacy..." : "Add Pharmacy"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
