"use client";

import { useState, useTransition, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useForm,
  useFieldArray,
  useWatch,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Send,
  X,
  Plus,
  Trash2,
  Paperclip,
  FileText,
  Building2,
} from "lucide-react";
import {
  submitRequestSchema,
  type SubmitRequestFormValues,
} from "@/features/requests/lib/schemas";
import { createRequestAction } from "@/features/requests/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/lib/utils/toast";
import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import type { ProductApiResponse } from "@/features/products/lib/types";
import type { CreateRequestDto } from "@/features/requests/lib/types";

interface SubmitRequestFormProps {
  doctors?: DoctorApiResponse[];
  products?: ProductApiResponse[];
}

const inputBase =
  "bg-secondary-very-light rounded-md border-[0.8px] border-[#E2E8F0] px-4 placeholder:text-secondary-text placeholder:text-sm/5 font-normal shadow-none";
const labelBase = "text-[14px] font-medium text-black";
const attachButtonBase =
  "border-secondary-light bg-secondary-very-light hover:bg-secondary-light inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors";

type HospitalGroup = { name: string; doctors: DoctorApiResponse[] };

function groupByHospital(doctors: DoctorApiResponse[]): HospitalGroup[] {
  return doctors.reduce((acc, doctor) => {
    const name = doctor.accountName || "Unassigned";
    const existing = acc.find((h) => h.name === name);
    if (existing) {
      existing.doctors.push(doctor);
    } else {
      acc.push({ name, doctors: [doctor] });
    }
    return acc;
  }, [] as HospitalGroup[]);
}

function DoctorPicker({
  doctors,
  value,
  onChange,
  disabled,
}: {
  doctors: DoctorApiResponse[];
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}) {
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const hospitals = useMemo(() => groupByHospital(doctors), [doctors]);
  const filtered =
    hospitalFilter === "all"
      ? hospitals
      : hospitals.filter((h) => h.name === hospitalFilter);

  return (
    <div className="space-y-3">
      {/* Hospital filter */}
      <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
        <SelectTrigger className={`${inputBase} cursor-pointer`}>
          <SelectValue placeholder="All Hospitals" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Hospitals</SelectItem>
          {hospitals.map((h) => (
            <SelectItem key={h.name} value={h.name}>
              {h.name} ({h.doctors.length})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Selected count badge */}
      {value.length > 0 && (
        <p className="text-dashboard-green text-xs">
          {value.length} doctor{value.length !== 1 ? "s" : ""} selected
        </p>
      )}

      {/* Scrollable grouped list */}
      <div className="max-h-60 space-y-4 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="text-secondary-dark py-6 text-center text-sm">
            No doctors available
          </p>
        ) : (
          filtered.map((hospital) => (
            <div key={hospital.name} className="space-y-2">
              {/* Hospital header */}
              <div className="flex items-center gap-2">
                <Building2 className="text-dashboard-blue size-4 shrink-0" />
                <span className="text-sm/5 font-medium">{hospital.name}</span>
                <span className="bg-secondary-text rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {hospital.doctors.length}
                </span>
              </div>
              {/* Doctor cards */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {hospital.doctors.map((d) => {
                  const checked = value.includes(d.id);
                  return (
                    <label
                      key={d.id}
                      className={`border-secondary-light flex cursor-pointer items-start gap-2.5 rounded-md border p-2.5 transition-colors ${
                        checked
                          ? "border-dashboard-green bg-light-green"
                          : "bg-secondary-very-light"
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(v) =>
                          onChange(
                            v
                              ? [...value, d.id]
                              : value.filter((id) => id !== d.id),
                          )
                        }
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-black">
                          {d.nameEN}
                        </p>
                        <p className="text-secondary-dark truncate text-xs">
                          {d.accountName}
                        </p>
                        <p className="text-secondary-dark truncate text-xs">
                          {d.subRegion}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function FilePickerRow({
  label,
  file,
  inputRef,
  onChange,
  onClear,
}: {
  label: string;
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (f: File | null) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className={labelBase}>{label}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={attachButtonBase}
        >
          <span className="bg-dashboard-blue/10 text-dashboard-blue inline-flex size-6 items-center justify-center rounded-full">
            <Paperclip size={13} />
          </span>
          {file ? file.name : "Attach PDF"}
        </button>
        {file && (
          <button
            type="button"
            onClick={onClear}
            className="text-dashboard-red hover:text-dashboard-red/80"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

export default function SubmitRequestForm({
  doctors = [],
  products = [],
}: SubmitRequestFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");

  // File states (outside react-hook-form schema)
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [medicalReportFile, setMedicalReportFile] = useState<File | null>(null);
  const [expenseItemFiles, setExpenseItemFiles] = useState<(File | null)[]>([]);

  const invoiceRef = useRef<HTMLInputElement>(null);
  const medicalReportRef = useRef<HTMLInputElement>(null);

  const form = useForm<
    SubmitRequestFormValues,
    unknown,
    SubmitRequestFormValues
  >({
    resolver: zodResolver(submitRequestSchema) as unknown as Resolver<
      SubmitRequestFormValues,
      unknown,
      SubmitRequestFormValues
    >,
    defaultValues: {
      title: "",
      subject: "",
      description: "",
      type: "EXPENSE",
      urgency: "priority",
      leaveType: "",
      leaveStartDate: "",
      leaveEndDate: "",
      doctorIds: [],
      budget: undefined,
      sampleData: [{ productId: "", productName: "", amount: 1 }],
      visitedCity: "",
      visitDaysCount: undefined,
      totalExpenseAmount: undefined,
      totalExpenseData: [{ name: "", amount: 0 }],
    },
  });

  const {
    fields: personalExpenseFields,
    append: appendPersonalExpense,
    remove: removePersonalExpense,
  } = useFieldArray({
    control: form.control,
    name: "totalExpenseData",
  });

  const {
    fields: sampleFields,
    append: appendSample,
    remove: removeSample,
  } = useFieldArray({
    control: form.control,
    name: "sampleData",
  });

  const requestType = useWatch({ control: form.control, name: "type" });
  const expenseItems =
    useWatch({ control: form.control, name: "totalExpenseData" }) ?? [];
  const totalExpense = expenseItems.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );

  const onSubmit = (values: SubmitRequestFormValues) => {
    setError("");
    startTransition(async () => {
      try {
        const payload: CreateRequestDto = {
          ...values,
          totalExpenseAmount:
            values.type === "PERSONAL_EXPENSE" ? totalExpense : undefined,
          totalExpenseData:
            values.type === "PERSONAL_EXPENSE"
              ? (values.totalExpenseData ?? []).map((item) => ({
                  name: item.name?.trim() ?? "",
                  amount: Number(item.amount ?? 0),
                }))
              : undefined,
          sampleData:
            values.type === "SAMPLE"
              ? (values.sampleData ?? [])
                  .filter((item) => Boolean(item.productId))
                  .map((item) => {
                    const foundProduct = products.find(
                      (p) => p.id === item.productId,
                    );
                    return {
                      productId: item.productId as string,
                      productName: item.productName || foundProduct?.name || "",
                      amount: Number(item.amount ?? 0),
                    };
                  })
              : undefined,
        };

        const result = await createRequestAction(payload, {
          invoice: invoiceFile ?? undefined,
          medicalReport: medicalReportFile ?? undefined,
          personalExpenseInvoices: expenseItemFiles,
        });

        if (result.success) {
          form.reset();
          setInvoiceFile(null);
          setMedicalReportFile(null);
          setExpenseItemFiles([]);
          toast.success({
            title: "Request submitted successfully",
            description: values.title,
          });
        } else {
          setError(result.error?.message || "Failed to submit request");
        }
      } catch {
        setError("An unexpected error occurred");
      }
    });
  };

  const onCancel = () => router.back();

  return (
    <div className="border-system-primary w-full rounded-md border bg-white">
      <h2 className="bg-system-primary rounded-t-md p-6 text-base/4 font-normal text-white">
        Submit New Request
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6">
          {/* Row 1: Title + Type */}
          <div className="grid w-full grid-cols-1 gap-4 *:flex-1 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className={labelBase}>Title *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      className={inputBase}
                      placeholder="Enter request title"
                    />
                  </FormControl>
                  <FormMessage className="absolute -bottom-6 left-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="relative flex-1">
                  <FormLabel className={labelBase}>Request Type *</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as SubmitRequestFormValues["type"])
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger
                        className={`${inputBase} data-placeholder:text-secondary-text w-full cursor-pointer`}
                      >
                        <SelectValue placeholder="Select request type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="MARKETING">Marketing</SelectItem>
                        <SelectItem value="SAMPLE">Sample</SelectItem>
                        <SelectItem value="LEAVE">Leave</SelectItem>
                        <SelectItem value="PERSONAL_EXPENSE">
                          Personal Expense
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="absolute -bottom-5 left-1" />
                </FormItem>
              )}
            />
          </div>

          {/* Row 2: Urgency + Subject */}
          <div className="grid grid-cols-1 gap-4 *:flex-1 md:grid-cols-2">
            <FormField
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className={labelBase}>Urgency *</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isPending}
                    >
                      <SelectTrigger
                        className={`${inputBase} data-placeholder:text-secondary-text w-full cursor-pointer`}
                      >
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="absolute -bottom-5 left-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className={labelBase}>Subject *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      className={inputBase}
                      placeholder="Brief description of your request"
                    />
                  </FormControl>
                  <FormMessage className="absolute -bottom-6 left-1" />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel className={labelBase}>Description *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    disabled={isPending}
                    className={`${inputBase} resize-none`}
                    placeholder="Provide detailed information about your request..."
                  />
                </FormControl>
                <FormMessage className="absolute -bottom-6 left-1" />
              </FormItem>
            )}
          />

          {/* ─── EXPENSE-specific ─── */}
          {requestType === "EXPENSE" && (
            <div className="space-y-6">
              <p className="text-sm font-medium text-black">Expense Details</p>
              {/* Doctor — hospital-grouped multi-select */}
              <FormField
                control={form.control}
                name="doctorIds"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel className={labelBase}>Doctors</FormLabel>
                    <DoctorPicker
                      doctors={doctors}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      disabled={isPending}
                    />
                    <FormMessage className="mt-1" />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Budget (EXPENSE) */}
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className={labelBase}>Budget</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                          type="number"
                          min={0}
                          disabled={isPending}
                          className={inputBase}
                          placeholder="Enter budget amount"
                        />
                      </FormControl>
                      <FormMessage className="absolute -bottom-6 left-1" />
                    </FormItem>
                  )}
                />
                {/* Invoice PDF (EXPENSE) */}
                <FilePickerRow
                  label="Invoice — PDF"
                  file={invoiceFile}
                  inputRef={invoiceRef}
                  onChange={setInvoiceFile}
                  onClear={() => {
                    setInvoiceFile(null);
                    if (invoiceRef.current) invoiceRef.current.value = "";
                  }}
                />
              </div>
            </div>
          )}

          {/* ─── PERSONAL_EXPENSE-specific ─── */}
          {requestType === "PERSONAL_EXPENSE" && (
            <div className="space-y-6">
              <p className="text-sm font-medium text-black">
                Personal Expense Details
              </p>
              <div className="flex flex-col gap-4 *:flex-1 md:flex-row">
                {/* Visit City */}
                <FormField
                  control={form.control}
                  name="visitedCity"
                  render={({ field }) => (
                    <FormItem className="relative flex-1">
                      <FormLabel className={labelBase}>Visit City *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          className={inputBase}
                          placeholder="Enter city name"
                        />
                      </FormControl>
                      <FormMessage className="absolute -bottom-6 left-1" />
                    </FormItem>
                  )}
                />
                {/* Days Count */}
                <FormField
                  control={form.control}
                  name="visitDaysCount"
                  render={({ field }) => (
                    <FormItem className="relative w-full md:w-40">
                      <FormLabel className={labelBase}>
                        Number of Days *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                          type="number"
                          min={1}
                          disabled={isPending}
                          className={inputBase}
                          placeholder="0"
                        />
                      </FormControl>
                      <FormMessage className="absolute -bottom-6 left-1" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dynamic expense items */}
              <div className="space-y-3">
                <p className={labelBase}>Expense Items</p>
                {personalExpenseFields.map((fieldItem, index) => (
                  <div
                    key={fieldItem.id}
                    className="bg-secondary-very-light grid grid-cols-1 items-start gap-3 rounded-md p-3 md:grid-cols-[1fr_180px_1fr_auto]"
                  >
                    <FormField
                      control={form.control}
                      name={`totalExpenseData.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="relative">
                          <FormLabel className="text-xs text-black">
                            Item Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isPending}
                              className={inputBase}
                              placeholder="e.g., Transportation"
                            />
                          </FormControl>
                          <FormMessage className="absolute -bottom-5 left-1 text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`totalExpenseData.${index}.amount`}
                      render={({ field }) => (
                        <FormItem className="relative">
                          <FormLabel className="text-xs text-black">
                            Amount
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value),
                                )
                              }
                              type="number"
                              min={0}
                              disabled={isPending}
                              className={inputBase}
                              placeholder="0.00"
                            />
                          </FormControl>
                          <FormMessage className="absolute -bottom-5 left-1 text-xs" />
                        </FormItem>
                      )}
                    />
                    {/* Per-item invoice */}
                    <div className="space-y-1">
                      <p className="text-xs text-black">Invoice (PDF)</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const inp = document.createElement("input");
                            inp.type = "file";
                            inp.accept = ".pdf,application/pdf";
                            inp.onchange = (e) => {
                              const f =
                                (e.target as HTMLInputElement).files?.[0] ??
                                null;
                              setExpenseItemFiles((prev) => {
                                const next = [...prev];
                                next[index] = f;
                                return next;
                              });
                            };
                            inp.click();
                          }}
                          className="border-secondary-light hover:bg-secondary-light inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-xs font-medium transition-colors"
                        >
                          <span className="bg-dashboard-blue/10 text-dashboard-blue inline-flex size-5 items-center justify-center rounded-full">
                            <Paperclip size={11} />
                          </span>
                          {expenseItemFiles[index]
                            ? expenseItemFiles[index]!.name
                            : "Attach"}
                        </button>
                        {expenseItemFiles[index] && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpenseItemFiles((prev) => {
                                const next = [...prev];
                                next[index] = null;
                                return next;
                              })
                            }
                            className="text-dashboard-red"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    {personalExpenseFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          removePersonalExpense(index);
                          setExpenseItemFiles((prev) =>
                            prev.filter((_, i) => i !== index),
                          );
                        }}
                        className="text-dashboard-red mt-6 hover:opacity-80"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    appendPersonalExpense({ name: "", amount: 0 });
                    setExpenseItemFiles((prev) => [...prev, null]);
                  }}
                  className="text-system-primary flex items-center gap-1.5 text-sm"
                >
                  <Plus size={16} />
                  Add Expense
                </button>

                {/* Total */}
                <div className="border-secondary-light flex items-center justify-between rounded-md border px-4 py-3">
                  <span className="text-secondary-dark text-sm">Total</span>
                  <span className="text-base font-semibold text-black">
                    {totalExpense.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ─── MARKETING-specific ─── */}
          {requestType === "MARKETING" && (
            <div className="space-y-6">
              <p className="text-sm font-medium text-black">
                Marketing Details
              </p>
              {/* Doctor — hospital-grouped multi-select (MARKETING) */}
              <FormField
                control={form.control}
                name="doctorIds"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel className={labelBase}>Doctors</FormLabel>
                    <DoctorPicker
                      doctors={doctors}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      disabled={isPending}
                    />
                    <FormMessage className="mt-1" />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Budget */}
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className={labelBase}>Budget</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                          type="number"
                          min={0}
                          disabled={isPending}
                          className={inputBase}
                          placeholder="Enter budget amount"
                        />
                      </FormControl>
                      <FormMessage className="absolute -bottom-6 left-1" />
                    </FormItem>
                  )}
                />
                {/* Invoice PDF (MARKETING) */}
                <FilePickerRow
                  label="Invoice — PDF"
                  file={invoiceFile}
                  inputRef={invoiceRef}
                  onChange={setInvoiceFile}
                  onClear={() => {
                    setInvoiceFile(null);
                    if (invoiceRef.current) invoiceRef.current.value = "";
                  }}
                />
              </div>
            </div>
          )}

          {/* ─── SAMPLE-specific ─── */}
          {requestType === "SAMPLE" && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-black">Sample Details</p>
              {sampleFields.map((fieldItem, index) => (
                <div
                  key={fieldItem.id}
                  className="bg-secondary-very-light flex w-full flex-col gap-3 rounded-md p-3 md:flex-row md:*:flex-1"
                >
                  <FormField
                    control={form.control}
                    name={`sampleData.${index}.productId`}
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel className="text-xs text-black">
                          Product
                        </FormLabel>
                        <FormControl>
                          <Select
                            value={field.value ?? ""}
                            onValueChange={(value) => {
                              const selected = products.find(
                                (p) => p.id === value,
                              );
                              field.onChange(value);
                              form.setValue(
                                `sampleData.${index}.productName`,
                                selected?.name ?? "",
                                { shouldValidate: true },
                              );
                            }}
                            disabled={isPending}
                          >
                            <SelectTrigger
                              className={`${inputBase} w-full cursor-pointer`}
                            >
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products?.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="absolute -bottom-5 left-1 text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`sampleData.${index}.amount`}
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel className="text-xs text-black">
                          Amount
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value),
                              )
                            }
                            type="number"
                            min={1}
                            disabled={isPending}
                            className={inputBase}
                            placeholder="0"
                          />
                        </FormControl>
                        <FormMessage className="absolute -bottom-5 left-1 text-xs" />
                      </FormItem>
                    )}
                  />
                  {sampleFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSample(index)}
                      className="text-dashboard-red mt-6 hover:opacity-80"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  appendSample({ productId: "", productName: "", amount: 1 })
                }
                className="text-system-primary flex items-center gap-1.5 text-sm"
              >
                <Plus size={16} />
                Add Product
              </button>

              <FormField
                control={form.control}
                name="sampleData"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* ─── LEAVE-specific ─── */}
          {requestType === "LEAVE" && (
            <div className="space-y-6">
              <p className="text-sm font-medium text-black">Leave Details</p>
              <FormField
                control={form.control}
                name="leaveType"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel className={labelBase}>Leave Type</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        className={inputBase}
                        placeholder="e.g., Annual Leave, Sick Leave"
                      />
                    </FormControl>
                    <FormMessage className="absolute -bottom-6 left-1" />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="leaveStartDate"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className={labelBase}>Start Date *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          disabled={isPending}
                          className={inputBase}
                        />
                      </FormControl>
                      <FormMessage className="absolute -bottom-6 left-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="leaveEndDate"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel className={labelBase}>End Date *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          disabled={isPending}
                          className={inputBase}
                        />
                      </FormControl>
                      <FormMessage className="absolute -bottom-6 left-1" />
                    </FormItem>
                  )}
                />
              </div>
              {/* Medical Report PDF */}
              <div className="space-y-1.5">
                <p className={labelBase}>Medical Report (PDF)</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => medicalReportRef.current?.click()}
                    className={attachButtonBase}
                  >
                    <span className="bg-dashboard-blue/10 text-dashboard-blue inline-flex size-6 items-center justify-center rounded-full">
                      <FileText size={13} />
                    </span>
                    {medicalReportFile
                      ? medicalReportFile.name
                      : "Attach Medical Report"}
                  </button>
                  {medicalReportFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setMedicalReportFile(null);
                        if (medicalReportRef.current)
                          medicalReportRef.current.value = "";
                      }}
                      className="text-dashboard-red"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <input
                  ref={medicalReportRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) =>
                    setMedicalReportFile(e.target.files?.[0] ?? null)
                  }
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-system-primary border-system-primary hover:text-system-primary flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm/5 font-medium text-white transition-colors hover:bg-white"
            >
              {isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Request
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              variant="outline"
              className="border-secondary-light hover:bg-secondary-very-light flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm/5 font-medium text-black transition-colors"
            >
              <X size={16} />
              Cancel
            </Button>
            {error && (
              <div className="text-dashboard-red ml-auto rounded-lg bg-red-50 p-4 text-sm">
                {error}
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
