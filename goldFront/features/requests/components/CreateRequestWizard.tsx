"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  submitRequestSchema,
  type SubmitRequestFormValues,
} from "@/features/requests/lib/schemas";
import { createRequestAction } from "@/features/requests/api";
import { RequestType } from "@/lib/types";
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
import { toast } from "@/lib/utils/toast";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Send,
  DollarSign,
  Briefcase,
  Calendar,
  Package,
  UserCheck,
  CheckCircle2,
  Edit3,
  Trash2,
  Paperclip,
  Plus,
  X,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import type { ProductApiResponse } from "@/features/products/lib/types";
import type { CreateRequestDto } from "@/features/requests/lib/types";

interface CreateRequestWizardProps {
  doctors?: DoctorApiResponse[];
  products?: ProductApiResponse[];
}

const REQUEST_TYPES: Array<{
  type: RequestType;
  title: string;
  description: string;
  icon: typeof DollarSign;
}> = [
  {
    type: "EXPENSE",
    title: "Expense Reimbursement",
    description: "Request budget or reimbursement for work-related expenses",
    icon: DollarSign,
  },
  {
    type: "SAMPLE",
    title: "Sample Allocation",
    description: "Request product samples for distribution to target doctors",
    icon: Package,
  },
  {
    type: "LEAVE",
    title: "Leave Request",
    description: "Submit annual, sick, or emergency leave requests",
    icon: Calendar,
  },
  {
    type: "MARKETING",
    title: "Marketing Request",
    description: "Request funding for marketing materials or doctor events",
    icon: Briefcase,
  },
  {
    type: "PERSONAL_EXPENSE",
    title: "Personal Travel Expense",
    description: "Reimburse travel, per diem, and city visit costs",
    icon: UserCheck,
  },
];

const formatUrgencyLabel = (urgency: string) => {
  switch (urgency?.toLowerCase()) {
    case "priority":
    case "critical":
      return "Critical Priority";
    case "high":
      return "High Priority";
    case "low":
      return "Low Priority";
    default:
      return "Medium Priority";
  }
};

export default function CreateRequestWizard({
  doctors = [],
  products = [],
}: CreateRequestWizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<RequestType>("EXPENSE");

  // Type-specific state
  const [sampleItems, setSampleItems] = useState<
    Array<{ productId: string; productName: string; amount: number }>
  >([]);
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<string[]>([]);
  const [expenseItems, setExpenseItems] = useState<
    Array<{ name: string; amount: number }>
  >([{ name: "Travel / Per Diem", amount: 100 }]);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  // Inline Validation Errors
  const [doctorError, setDoctorError] = useState<string>("");
  const [sampleError, setSampleError] = useState<string>("");
  const [expenseItemError, setExpenseItemError] = useState<string>("");
  const [attachmentError, setAttachmentError] = useState<string>("");

  const form = useForm<SubmitRequestFormValues>({
    resolver: zodResolver(
      submitRequestSchema,
    ) as unknown as Resolver<SubmitRequestFormValues>,
    defaultValues: {
      type: "EXPENSE",
      urgency: "medium",
      title: "",
      subject: "",
      description: "",
      leaveType: "Annual",
      leaveStartDate: "",
      leaveEndDate: "",
      visitedCity: "",
      visitDaysCount: 1,
      budget: 500,
    },
  });

  const watched = useWatch({ control: form.control });

  const handleSelectType = (type: RequestType) => {
    setSelectedType(type);
    form.setValue("type", type);
    setDoctorError("");
    setSampleError("");
  };

  const handleNextStep1 = () => {
    form.setValue("type", selectedType);
    setStep(2);
  };

  const handleNextStep2 = async () => {
    setDoctorError("");
    setSampleError("");
    setExpenseItemError("");
    setAttachmentError("");

    // Common validations
    const validTitle = await form.trigger("title");
    const validSubject = await form.trigger("subject");
    const validDescription = await form.trigger("description");

    let isTypeValid = true;

    // File attachment is required for all request types EXCEPT SAMPLE (backend contract requirement)
    if (selectedType !== "SAMPLE" && !attachedFile) {
      const errorMsg =
        selectedType === "LEAVE"
          ? "Supporting document (medical note or leave form) is required."
          : "File attachment (invoice or supporting document) is required for this request type.";
      setAttachmentError(errorMsg);
      isTypeValid = false;
    }

    // Type specific validations
    if (selectedType === "EXPENSE" || selectedType === "MARKETING") {
      const validBudget = await form.trigger("budget");
      if (selectedDoctorIds.length === 0) {
        setDoctorError("At least one target doctor is required.");
        isTypeValid = false;
      }
      if (!validBudget) isTypeValid = false;
    } else if (selectedType === "LEAVE") {
      const validStart = await form.trigger("leaveStartDate");
      const validEnd = await form.trigger("leaveEndDate");
      if (!validStart || !validEnd) isTypeValid = false;
    } else if (selectedType === "SAMPLE") {
      if (selectedDoctorIds.length === 0) {
        setDoctorError("At least one target doctor is required.");
        isTypeValid = false;
      }
      if (sampleItems.length === 0) {
        setSampleError("At least one sample product is required.");
        isTypeValid = false;
      }
    } else if (selectedType === "PERSONAL_EXPENSE") {
      const validCity = await form.trigger("visitedCity");
      const validDays = await form.trigger("visitDaysCount");
      if (expenseItems.length === 0) {
        setExpenseItemError("At least one expense item is required.");
        isTypeValid = false;
      }
      if (!validCity || !validDays) isTypeValid = false;
    }

    if (validTitle && validSubject && validDescription && isTypeValid) {
      setStep(3);
    }
  };

  const onSubmit = () => {
    startTransition(async () => {
      try {
        const values = form.getValues();
        let payload: Record<string, unknown> = {
          title: values.title,
          subject: values.subject,
          description: values.description,
          type: selectedType,
          urgency: values.urgency,
        };

        if (selectedType === "LEAVE") {
          payload = {
            ...payload,
            leaveType: values.leaveType || "Annual",
            leaveStartDate: values.leaveStartDate,
            leaveEndDate: values.leaveEndDate,
          };
        } else if (selectedType === "EXPENSE" || selectedType === "MARKETING") {
          payload = {
            ...payload,
            budget: Number(values.budget) || 0,
            doctorIds: selectedDoctorIds,
          };
        } else if (selectedType === "SAMPLE") {
          payload = {
            ...payload,
            doctorIds: selectedDoctorIds,
            productIds: sampleItems.map((i) => i.productId),
            sampleData: sampleItems,
          };
        } else if (selectedType === "PERSONAL_EXPENSE") {
          const totalAmount = expenseItems.reduce(
            (s, i) => s + (i.amount || 0),
            0,
          );
          payload = {
            ...payload,
            visitedCity: values.visitedCity,
            visitDaysCount: Number(values.visitDaysCount) || 1,
            totalExpenseAmount: totalAmount,
            totalExpenseData: expenseItems,
          };
        }

        const result = await createRequestAction(payload as CreateRequestDto, {
          invoice: attachedFile || undefined,
        });
        if (result.success) {
          toast.success({ title: "Request submitted successfully!" });
          router.push("/rep/requests");
        } else {
          toast.error({
            title: result.error?.message || "Failed to submit request",
          });
        }
      } catch (err) {
        console.error("Create request error:", err);
        toast.error({ title: "An unexpected error occurred." });
      }
    });
  };

  const handleAddSampleItem = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    if (sampleItems.some((i) => i.productId === productId)) return;
    setSampleItems((prev) => [
      ...prev,
      { productId, productName: prod.name, amount: 5 },
    ]);
    setSampleError("");
  };

  const handleRemoveSampleItem = (productId: string) => {
    setSampleItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleToggleDoctor = (doctorId: string) => {
    setSelectedDoctorIds((prev) => {
      if (prev.includes(doctorId)) {
        return prev.filter((id) => id !== doctorId);
      }
      return [...prev, doctorId];
    });
    setDoctorError("");
  };

  const selectedDoctorNames = useMemo(() => {
    return doctors
      .filter((d) => selectedDoctorIds.includes(d.id))
      .map((d) => d.nameEN || d.nameAR || d.accountName)
      .filter(Boolean);
  }, [doctors, selectedDoctorIds]);

  return (
    <div className="space-y-6">
      {/* Workflow Stepper Header */}
      <div className="rounded-[14px] border border-[#E5E8EF] bg-white p-4">
        <ol className="flex items-center justify-between">
          {[
            { id: 1, label: "Request Type" },
            { id: 2, label: "Request Details" },
            { id: 3, label: "Review & Submit" },
          ].map((s, idx) => {
            const isCurrent = step === s.id;
            const isCompleted = step > s.id;
            return (
              <li key={s.id} className="flex flex-1 items-center">
                <button
                  type="button"
                  onClick={() => s.id < step && setStep(s.id as 1 | 2 | 3)}
                  className="flex cursor-pointer items-center gap-2.5 outline-none"
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all",
                      isCurrent
                        ? "bg-[#168557] text-white ring-4 ring-[#E9F8F1]"
                        : isCompleted
                          ? "bg-[#168557] text-white"
                          : "border border-[#E5E8EF] bg-[#F4F6FA] text-[#667085]",
                    )}
                  >
                    {isCompleted ? <Check className="size-3.5" /> : s.id}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold",
                      isCurrent || isCompleted
                        ? "text-[#182033]"
                        : "text-[#667085]",
                    )}
                  >
                    {s.label}
                  </span>
                </button>
                {idx < 2 && (
                  <div
                    className={cn(
                      "mx-4 h-0.5 flex-1",
                      s.id < step ? "bg-[#168557]" : "bg-[#E5E8EF]",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Main Card Content */}
      <div className="space-y-6 rounded-[14px] border border-[#E5E8EF] bg-white p-6 md:p-8">
        <Form {...form}>
          {/* STEP 1: Select Request Type */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-[#182033]">
                  Select Request Type
                </h2>
                <p className="text-xs text-[#667085]">
                  Choose the category that best matches your request.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2 md:grid-cols-2">
                {REQUEST_TYPES.map((t) => {
                  const Icon = t.icon;
                  const isSelected = selectedType === t.type;
                  return (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => handleSelectType(t.type)}
                      className={cn(
                        "flex cursor-pointer items-start gap-3.5 rounded-[12px] border p-4 text-left transition-all",
                        isSelected
                          ? "border-[#168557] bg-[#E9F8F1]/50 shadow-2xs"
                          : "border-[#E5E8EF] bg-white hover:border-[#CBEFDD]",
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-[10px]",
                          isSelected
                            ? "bg-[#168557] text-white"
                            : "bg-[#F4F6FA] text-[#667085]",
                        )}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#182033]">
                          {t.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-[#667085]">
                          {t.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Request Details & Conditional Fields */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[#182033]">
                  {REQUEST_TYPES.find((t) => t.type === selectedType)?.title}{" "}
                  Details
                </h2>
                <p className="text-xs text-[#667085]">
                  Fill in the required information for your request.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-[#182033]">
                        Request Title *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Q4 Marketing Materials Budget"
                          className="h-10 rounded-[10px] border-[#DDE3EE] text-xs"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-[#182033]">
                        Subject *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Doctor Symposium Expenses"
                          className="h-10 rounded-[10px] border-[#DDE3EE] text-xs"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="urgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-[#182033]">
                        Urgency / Priority *
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 rounded-[10px] border-[#DDE3EE] text-xs">
                            <SelectValue placeholder="Select Urgency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">
                            Medium Priority
                          </SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="priority">
                            Critical / Priority
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(selectedType === "EXPENSE" ||
                  selectedType === "MARKETING") && (
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-[#182033]">
                          Budget Amount (SAR) *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            className="h-10 rounded-[10px] border-[#DDE3EE] text-xs"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Target Doctor Selector for Expense, Marketing & Sample */}
              {(selectedType === "EXPENSE" ||
                selectedType === "MARKETING" ||
                selectedType === "SAMPLE") && (
                <div className="space-y-2 rounded-[10px] border border-[#E5E8EF] bg-[#F9FAFB] p-4">
                  <div className="flex items-center justify-between">
                    <FormLabel className="flex items-center gap-1.5 text-xs font-bold text-[#182033]">
                      <Stethoscope size={14} className="text-[#168557]" />
                      Target Doctors * ({selectedDoctorIds.length} Selected)
                    </FormLabel>
                  </div>

                  {doctors.length === 0 ? (
                    <p className="text-xs text-[#667085]">
                      No doctors available in region.
                    </p>
                  ) : (
                    <div className="grid max-h-36 grid-cols-1 gap-2 overflow-y-auto pt-1 sm:grid-cols-2">
                      {doctors.map((doc) => {
                        const isSelected = selectedDoctorIds.includes(doc.id);
                        return (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => handleToggleDoctor(doc.id)}
                            className={cn(
                              "flex cursor-pointer items-center justify-between rounded-[8px] border px-3 py-2 text-left text-xs font-medium transition-all",
                              isSelected
                                ? "border-[#168557] bg-[#E9F8F1] text-[#168557]"
                                : "border-[#E5E8EF] bg-white text-[#344054] hover:border-[#CBEFDD]",
                            )}
                          >
                            <span className="truncate">
                              {doc.nameEN || doc.nameAR || doc.accountName}
                            </span>
                            {isSelected && (
                              <Check
                                size={14}
                                className="shrink-0 text-[#168557]"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {doctorError && (
                    <p className="pt-1 text-[11px] font-medium text-[#D92D20]">
                      {doctorError}
                    </p>
                  )}
                </div>
              )}

              {selectedType === "LEAVE" && (
                <div className="grid grid-cols-1 gap-4 rounded-[10px] border border-[#E5E8EF] bg-[#F9FAFB] p-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="leaveType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-[#182033]">
                          Leave Type *
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 rounded-[10px] border-[#DDE3EE] bg-white text-xs">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Annual">Annual Leave</SelectItem>
                            <SelectItem value="Sick">Sick Leave</SelectItem>
                            <SelectItem value="Emergency">
                              Emergency Leave
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="leaveStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-[#182033]">
                          Start Date *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="h-10 rounded-[10px] border-[#DDE3EE] bg-white text-xs"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="leaveEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-[#182033]">
                          End Date *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="h-10 rounded-[10px] border-[#DDE3EE] bg-white text-xs"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {selectedType === "SAMPLE" && (
                <div className="space-y-3 rounded-[10px] border border-[#E5E8EF] bg-[#F9FAFB] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#182033]">
                      Sample Products Selection * ({sampleItems.length})
                    </span>
                    <Select onValueChange={handleAddSampleItem}>
                      <SelectTrigger className="h-8 w-48 cursor-pointer rounded-[8px] border-[#DDE3EE] bg-white text-xs">
                        <SelectValue placeholder="+ Add Sample Product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {sampleItems.length === 0 ? (
                    <p className="py-2 text-center text-xs text-[#667085]">
                      Select sample products from catalog above.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {sampleItems.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between rounded-[8px] border border-[#E5E8EF] bg-white p-2.5 text-xs"
                        >
                          <span className="font-semibold text-[#182033]">
                            {item.productName}
                          </span>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={item.amount}
                              onChange={(e) =>
                                setSampleItems((prev) =>
                                  prev.map((i) =>
                                    i.productId === item.productId
                                      ? { ...i, amount: Number(e.target.value) }
                                      : i,
                                  ),
                                )
                              }
                              className="h-7 w-20 rounded-[6px] border-[#DDE3EE] text-center text-xs"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveSampleItem(item.productId)
                              }
                              className="cursor-pointer rounded p-1 text-[#D92D20] hover:bg-[#FEF3F2]"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {sampleError && (
                    <p className="pt-1 text-[11px] font-medium text-[#D92D20]">
                      {sampleError}
                    </p>
                  )}
                </div>
              )}

              {selectedType === "PERSONAL_EXPENSE" && (
                <div className="space-y-4 rounded-[10px] border border-[#E5E8EF] bg-[#F9FAFB] p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="visitedCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-[#182033]">
                            Visited City *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. Riyadh"
                              className="h-10 rounded-[10px] border-[#DDE3EE] bg-white text-xs"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="visitDaysCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-[#182033]">
                            Visit Days *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              className="h-10 rounded-[10px] border-[#DDE3EE] bg-white text-xs"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#182033]">
                        Expense Breakdown *
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setExpenseItems([
                            ...expenseItems,
                            { name: "", amount: 0 },
                          ]);
                          setExpenseItemError("");
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#168557] hover:underline"
                      >
                        <Plus className="size-3.5" />
                        <span>Add Item</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {expenseItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 rounded-lg border border-[#E5E8EF] bg-white p-2.5"
                        >
                          <Input
                            placeholder="Expense description (e.g. Hotel, Taxi)"
                            value={item.name}
                            onChange={(e) => {
                              const updated = [...expenseItems];
                              updated[idx].name = e.target.value;
                              setExpenseItems(updated);
                            }}
                            className="h-9 flex-1 text-xs"
                          />
                          <div className="flex w-32 shrink-0 items-center gap-1.5">
                            <Input
                              type="number"
                              min={0}
                              placeholder="Amount"
                              value={item.amount || ""}
                              onChange={(e) => {
                                const updated = [...expenseItems];
                                updated[idx].amount =
                                  Number(e.target.value) || 0;
                                setExpenseItems(updated);
                              }}
                              className="h-9 text-xs"
                            />
                            <span className="text-[11px] font-medium text-[#667085]">
                              EGP
                            </span>
                          </div>
                          {expenseItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setExpenseItems(
                                  expenseItems.filter((_, i) => i !== idx),
                                );
                              }}
                              className="p-1 text-[#98A2B3] hover:text-[#D92D20]"
                              aria-label="Remove item"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-1">
                      <span className="text-xs font-bold text-[#182033]">
                        Total:{" "}
                        <span className="text-[#168557]">
                          {expenseItems.reduce(
                            (s, i) => s + (i.amount || 0),
                            0,
                          )}{" "}
                          EGP
                        </span>
                      </span>
                    </div>
                  </div>

                  {expenseItemError && (
                    <p className="text-[11px] font-medium text-[#D92D20]">
                      {expenseItemError}
                    </p>
                  )}
                </div>
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-[#182033]">
                      Description / Justification *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="Explain the background and purpose of this request..."
                        className="rounded-[10px] border-[#DDE3EE] text-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Attachment Control */}
              <div className="space-y-2 rounded-[10px] border border-[#E5E8EF] bg-white p-3.5">
                <FormLabel className="flex items-center justify-between text-xs font-bold text-[#182033]">
                  <span>
                    {selectedType === "LEAVE"
                      ? "Supporting Document (PDF) *"
                      : selectedType !== "SAMPLE"
                        ? "Attachment (Invoice / PDF Document Required) *"
                        : "Attachment (Optional Invoice / PDF)"}
                  </span>
                  {selectedType !== "SAMPLE" ? (
                    <span className="text-[11px] font-bold text-[#D92D20]">
                      Required
                    </span>
                  ) : (
                    <span className="text-[11px] font-normal text-[#667085]">
                      Optional
                    </span>
                  )}
                </FormLabel>

                {attachedFile ? (
                  <div className="flex items-center justify-between rounded-[8px] border border-[#CBEFDD] bg-[#E9F8F1] p-2.5 text-xs text-[#168557]">
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip size={14} />
                      <span className="truncate font-semibold">
                        {attachedFile.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="cursor-pointer rounded p-1 text-[#D92D20] hover:bg-white/50"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[8px] border border-dashed border-[#DDE3EE] bg-[#F9FAFB] p-3 text-xs text-[#667085] transition-colors hover:bg-[#F4F6FA]">
                    <Paperclip size={14} />
                    <span>Upload invoice or document (PDF, up to 5 MB)</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          if (
                            file.type !== "application/pdf" ||
                            file.size > 5 * 1024 * 1024
                          ) {
                            setAttachedFile(null);
                            setAttachmentError("Choose a PDF file up to 5 MB.");
                            e.target.value = "";
                            return;
                          }
                          setAttachedFile(e.target.files[0]);
                          setAttachmentError("");
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}

                {attachmentError && (
                  <p className="pt-1 text-[11px] font-medium text-[#D92D20]">
                    {attachmentError}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-[12px] border border-[#CBEFDD] bg-[#E9F8F1]/60 p-4">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-[#168557] uppercase">
                    Ready For Submission
                  </span>
                  <h3 className="text-base font-bold text-[#182033]">
                    {watched.title}
                  </h3>
                  <p className="text-xs text-[#667085]">
                    {REQUEST_TYPES.find((t) => t.type === selectedType)?.title}{" "}
                    · {formatUrgencyLabel(watched.urgency || "medium")}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#168557]">
                  <CheckCircle2 size={16} /> Verified
                </span>
              </div>

              <div className="space-y-3.5 rounded-[10px] border border-[#E5E8EF] bg-white p-4 text-xs">
                <div className="flex justify-between border-b border-[#EEF1F6] pb-2">
                  <span className="font-bold text-[#182033]">
                    Request Details
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex cursor-pointer items-center gap-1 font-bold text-[#168557] hover:underline"
                  >
                    <Edit3 size={12} /> Edit Details
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[#667085]">Subject:</span>{" "}
                    <span className="font-bold text-[#182033]">
                      {watched.subject}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#667085]">Priority:</span>{" "}
                    <span className="font-bold text-[#182033]">
                      {formatUrgencyLabel(watched.urgency || "medium")}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[#667085]">Description:</span>
                  <p className="mt-1 rounded-[8px] border border-[#EEF1F6] bg-[#F9FAFB] p-2.5 text-[#344054]">
                    {watched.description}
                  </p>
                </div>

                {/* Type-specific breakdown */}
                {(selectedType === "EXPENSE" ||
                  selectedType === "MARKETING") && (
                  <div className="space-y-1.5 border-t border-[#EEF1F6] pt-2">
                    <div className="flex justify-between">
                      <span className="text-[#667085]">Budget Amount:</span>
                      <span className="font-bold text-[#168557]">
                        SAR {watched.budget}
                      </span>
                    </div>
                    {selectedDoctorNames.length > 0 && (
                      <div>
                        <span className="text-[#667085]">
                          Target Doctors ({selectedDoctorNames.length}):
                        </span>
                        <p className="mt-0.5 font-semibold text-[#182033]">
                          {selectedDoctorNames.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedType === "LEAVE" && (
                  <div className="space-y-1.5 border-t border-[#EEF1F6] pt-2">
                    <div className="flex justify-between">
                      <span className="text-[#667085]">Leave Type:</span>
                      <span className="font-bold text-[#182033]">
                        {watched.leaveType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#667085]">Period:</span>
                      <span className="font-bold text-[#182033]">
                        {watched.leaveStartDate} to {watched.leaveEndDate}
                      </span>
                    </div>
                  </div>
                )}

                {selectedType === "SAMPLE" && (
                  <div className="space-y-2 border-t border-[#EEF1F6] pt-2">
                    {selectedDoctorNames.length > 0 && (
                      <div>
                        <span className="text-[#667085]">Target Doctors:</span>
                        <p className="mt-0.5 font-semibold text-[#182033]">
                          {selectedDoctorNames.join(", ")}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="mb-1 block font-semibold text-[#667085]">
                        Requested Samples ({sampleItems.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {sampleItems.map((item) => (
                          <span
                            key={item.productId}
                            className="rounded-md border border-[#CBEFDD] bg-[#E9F8F1] px-2 py-0.5 text-[11px] font-bold text-[#168557]"
                          >
                            {item.productName}: {item.amount} units
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedType === "PERSONAL_EXPENSE" && (
                  <div className="space-y-1.5 border-t border-[#EEF1F6] pt-2">
                    <div className="flex justify-between">
                      <span className="text-[#667085]">Visited City:</span>
                      <span className="font-bold text-[#182033]">
                        {watched.visitedCity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#667085]">Visit Duration:</span>
                      <span className="font-bold text-[#182033]">
                        {watched.visitDaysCount} Days
                      </span>
                    </div>
                  </div>
                )}

                {/* Optional Attachment Summary */}
                <div className="flex items-center justify-between border-t border-[#EEF1F6] pt-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[#667085]">
                    <Paperclip
                      size={14}
                      className={
                        attachedFile ? "text-[#168557]" : "text-[#98A2B3]"
                      }
                    />
                    <span
                      className={
                        attachedFile
                          ? "font-semibold text-[#168557]"
                          : "text-[#667085]"
                      }
                    >
                      {attachedFile ? attachedFile.name : "No attachment"}
                    </span>
                  </div>
                  {attachedFile && (
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="cursor-pointer font-bold text-[#168557] hover:underline"
                    >
                      Edit / Replace
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Navigation Footer */}
          <div className="flex items-center justify-between border-t border-[#EEF1F6] pt-5">
            <div>
              {step > 1 ? (
                <Button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                  variant="outline"
                  className="h-10 cursor-pointer rounded-[10px] border-[#E5E8EF] px-5 text-xs font-semibold text-[#344054]"
                >
                  <ChevronLeft className="mr-1.5 size-4" />
                  Back
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => router.push("/rep/requests")}
                  variant="outline"
                  className="h-10 cursor-pointer rounded-[10px] border-[#E5E8EF] px-5 text-xs font-semibold text-[#344054]"
                >
                  Cancel
                </Button>
              )}
            </div>

            <div>
              {step === 1 && (
                <Button
                  type="button"
                  onClick={handleNextStep1}
                  className="bg-gp-rep-primary hover:bg-gp-rep-primary-hover h-10 cursor-pointer rounded-[10px] px-6 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(22,133,87,0.22)]"
                >
                  Continue
                  <ChevronRight className="ml-1.5 size-4" />
                </Button>
              )}

              {step === 2 && (
                <Button
                  type="button"
                  onClick={handleNextStep2}
                  className="bg-gp-rep-primary hover:bg-gp-rep-primary-hover h-10 cursor-pointer rounded-[10px] px-6 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(22,133,87,0.22)]"
                >
                  Review Request
                  <ChevronRight className="ml-1.5 size-4" />
                </Button>
              )}

              {step === 3 && (
                <Button
                  type="button"
                  onClick={onSubmit}
                  disabled={isPending}
                  className="bg-gp-rep-primary hover:bg-gp-rep-primary-hover h-10 cursor-pointer rounded-[10px] px-6 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(22,133,87,0.22)]"
                >
                  {isPending ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send size={15} className="mr-1.5" />
                      Submit Request
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
