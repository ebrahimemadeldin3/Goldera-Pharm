"use client";

import type { CSSProperties } from "react";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  BadgeCheck,
  Calendar as CalendarIcon,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UploadCloud,
  UserCog,
  UserPlus,
  UserRound,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { formatSaudiDateDisplay, getSaudiYear } from "@/lib/utils";
import { addMemberSchema, type AddMemberFormValues } from "../lib/schemas";
import { addTeamMemberAction } from "../api";
import { toast } from "@/lib/utils/toast";
import { User } from "../lib/types";
import { Region } from "@/lib/types/regions";
import { cn } from "@/lib/utils";
import { getTerritoryLookup } from "@/features/plan/lib/territory";

type AddMemberDialogProps = {
  supervisors?: User[];
  regions?: Region[];
};

type WorkflowSectionId = "basic" | "assignment" | "documents" | "review";

type WorkflowSection = {
  id: WorkflowSectionId;
  label: string;
  description: string;
  icon: LucideIcon;
};

const workflowSections: WorkflowSection[] = [
  {
    id: "basic",
    label: "Basic Information",
    description: "Identity and credentials",
    icon: UserRound,
  },
  {
    id: "assignment",
    label: "Role & Assignment",
    description: "Access and territory",
    icon: ShieldCheck,
  },
  {
    id: "documents",
    label: "Documents",
    description: "IDs and attachments",
    icon: FileText,
  },
  {
    id: "review",
    label: "Review & Confirm",
    description: "Final check",
    icon: ClipboardCheck,
  },
];

function RequiredMark() {
  return <span className="text-gp-danger">*</span>;
}

export default function AddMemberDialog({
  supervisors = [],
  regions = [],
}: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDraggingCV, setIsDraggingCV] = useState(false);
  const [isDraggingCerts, setIsDraggingCerts] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeSection, setActiveSection] =
    useState<WorkflowSectionId>("basic");

  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      dateOfBirth: undefined,
      role: "MEDICAL_REP",
      regionId: "",
      subRegionId: "",
      dateOfRecruitment: undefined,
      educationBackground: "",
      iqamaNumber: "",
      passportNumber: "",
      resume: undefined,
      certificates: undefined,
      supervisorId: "",
    },
  });

  const resetFormState = () => {
    form.reset();
    setIsDraggingCV(false);
    setIsDraggingCerts(false);
    setShowPassword(false);
    setActiveSection("basic");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen && !isPending) {
      resetFormState();
    }
  };

  const selectedRole = useWatch({ control: form.control, name: "role" });
  const selectedRegionId = useWatch({
    control: form.control,
    name: "regionId",
  });

  // Get sub-regions for selected region
  const selectedRegion = regions.find((r) => r.id === selectedRegionId);
  const subRegions = selectedRegion?.subRegions || [];
  const selectedSubRegionId = useWatch({
    control: form.control,
    name: "subRegionId",
  });
  const selectedSubRegion = subRegions.find(
    (subRegion) => subRegion.id === selectedSubRegionId,
  );
  const assignedTerritory = getTerritoryLookup(selectedSubRegion?.name || "");

  const activeWorkflowIndex = workflowSections.findIndex(
    (section) => section.id === activeSection,
  );
  const activeWorkflowStep = Math.max(activeWorkflowIndex, 0) + 1;
  const activeWorkflowSection =
    workflowSections[activeWorkflowIndex] ?? workflowSections[0];
  const progressPercent = (activeWorkflowStep / workflowSections.length) * 100;

  const onSubmit = (values: AddMemberFormValues) => {
    startTransition(async () => {
      try {
        const result = await addTeamMemberAction(values);

        if (result.success) {
          form.reset();
          setOpen(false);
          setIsDraggingCV(false);
          setIsDraggingCerts(false);
          setShowPassword(false);
          setActiveSection("basic");
          toast.success({
            title: "Team member added successfully",
            description: values.name,
          });
        } else {
          toast.error({
            title: "Failed to add team member",
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

  function scrollToSection(sectionId: WorkflowSectionId) {
    setActiveSection(sectionId);

    const section = document.getElementById(`team-add-section-${sectionId}`);
    if (!section) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    section.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });

    window.setTimeout(
      () => {
        section.focus({ preventScroll: true });
      },
      prefersReducedMotion ? 0 : 220,
    );
  }

  const inputBase =
    "h-11 rounded-[10px] border border-gp-border-control bg-white px-3 text-sm font-medium text-gp-text-primary shadow-none transition-[border-color,background-color,box-shadow] duration-[160ms] placeholder:text-gp-text-placeholder hover:border-gp-border-default focus-visible:border-gp-gold-500 focus-visible:bg-gp-surface-hover focus-visible:ring-[3px] focus-visible:ring-gp-gold-500/10 aria-invalid:border-gp-danger aria-invalid:ring-gp-danger/10";

  const selectTriggerBase =
    "h-11 w-full cursor-pointer rounded-[10px] border border-gp-border-control bg-white px-3 text-sm font-medium text-gp-text-primary shadow-none transition-[border-color,background-color,box-shadow] duration-[160ms] hover:border-gp-border-default focus:border-gp-gold-500 focus:ring-[3px] focus:ring-gp-gold-500/10 data-[state=open]:border-gp-gold-500 data-[state=open]:bg-gp-surface-hover disabled:cursor-not-allowed disabled:bg-gp-surface-subtle disabled:text-gp-text-placeholder disabled:opacity-70";

  const popoverButtonBase =
    "h-11 w-full justify-start cursor-pointer rounded-[10px] border border-gp-border-control bg-white px-3 text-left text-sm font-medium text-gp-text-primary shadow-none transition-[border-color,background-color,box-shadow] duration-[160ms] hover:border-gp-border-default hover:bg-gp-surface-hover focus-visible:border-gp-gold-500 focus-visible:ring-[3px] focus-visible:ring-gp-gold-500/10";

  const formSectionClassName =
    "team-add-form-section team-add-form-stagger scroll-mt-24 rounded-[16px] border border-gp-border-default bg-white p-4 shadow-gp-card outline-none sm:p-5";

  const sectionIconClassName =
    "border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-9 shrink-0 items-center justify-center rounded-[10px] border";

  const sectionTitleClassName =
    "text-gp-navy-850 text-[11px] font-bold tracking-[0.08em] uppercase";

  const sectionCopyClassName =
    "text-gp-text-muted mt-1 text-xs leading-5 font-medium";

  const fieldLabelClassName = "text-gp-navy-800 text-xs font-semibold";
  const fieldMessageClassName = "text-gp-danger text-xs font-medium";
  const fieldIconClassName =
    "team-add-field-icon text-gp-navy-800 pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2";
  const selectIconClassName =
    "team-add-select-icon text-gp-navy-800 size-4 shrink-0";
  const selectContentClassName =
    "border-gp-border-default shadow-gp-popover max-h-72 rounded-[12px] bg-white text-gp-text-primary";
  const selectItemClassName =
    "cursor-pointer rounded-[8px] text-sm font-medium text-gp-text-secondary focus:bg-gp-gold-50 focus:text-gp-gold-700 data-[state=checked]:text-gp-text-primary";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          data-dialog-trigger="add-member"
          className="team-add-trigger group bg-gp-navy-900 hover:bg-gp-navy-850 focus-visible:ring-gp-gold-500/25 h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-transparent px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(16,29,54,0.18)] transition-[background-color,color,transform,box-shadow] duration-[170ms] hover:-translate-y-px hover:text-white hover:shadow-[0_10px_24px_rgba(16,29,54,0.24)] focus-visible:ring-[3px] focus-visible:outline-none active:translate-y-0 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto"
        >
          <UserPlus
            className="team-add-icon text-gp-gold-500 size-4"
            aria-hidden="true"
          />
          Add Team Member
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        hideCloseButton
        overlayClassName="team-add-sheet-overlay bg-[rgba(15,23,42,0.26)] backdrop-blur-[1px]"
        className="team-add-sheet border-gp-border-default shadow-gp-dialog !w-full gap-0 overflow-hidden border-l bg-white p-0 sm:!w-[min(760px,calc(100vw-24px))] sm:!max-w-[760px] lg:!w-[min(900px,calc(100vw-32px))] lg:!max-w-[900px]"
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="team-add-form flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="grid min-h-0 flex-1 lg:grid-cols-[260px_minmax(0,1fr)]">
              <aside className="team-add-workflow-panel border-gp-border-subtle bg-gp-surface-card hidden min-h-0 flex-col border-r px-5 py-5 lg:flex">
                <div className="min-w-0">
                  <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-11 items-center justify-center rounded-[12px] border">
                    <UserPlus className="size-5" aria-hidden="true" />
                  </span>
                  <h2 className="text-gp-navy-900 mt-4 text-[22px] leading-tight font-semibold">
                    Add Team Member
                  </h2>
                  <p className="text-gp-text-muted mt-2 text-sm leading-6 font-medium">
                    Create a representative or supervisor profile for this team.
                  </p>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-gp-gold-700 text-[11px] font-bold tracking-[0.08em] uppercase">
                      Step {activeWorkflowStep} of {workflowSections.length}
                    </p>
                    <p className="text-gp-text-muted text-xs font-semibold">
                      {Math.round(progressPercent)}%
                    </p>
                  </div>
                  <div
                    className="bg-gp-border-subtle mt-2 h-1.5 overflow-hidden rounded-full"
                    aria-hidden="true"
                  >
                    <span
                      className="bg-gp-gold-500 ease-gp-premium block h-full rounded-full transition-[width] duration-[220ms] motion-reduce:transition-none"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <nav
                  className="mt-6 space-y-2"
                  aria-label="Add member form sections"
                >
                  {workflowSections.map((section, index) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;

                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => scrollToSection(section.id)}
                        aria-current={isActive ? "step" : undefined}
                        className={cn(
                          "team-add-workflow-step group focus-visible:ring-gp-gold-500/15 flex w-full items-start gap-3 rounded-[12px] border p-3 text-left transition-[background-color,border-color,box-shadow,transform] duration-[180ms] focus-visible:ring-[3px] focus-visible:outline-none motion-reduce:transition-none",
                          isActive
                            ? "border-gp-gold-300 bg-gp-gold-50 shadow-gp-card"
                            : "border-gp-border-subtle hover:border-gp-border-control hover:bg-gp-surface-subtle bg-white",
                        )}
                      >
                        <span
                          className={cn(
                            "team-add-workflow-icon flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-[background-color,border-color,color,transform] duration-[180ms]",
                            isActive
                              ? "border-gp-gold-300 text-gp-gold-700 bg-white"
                              : "border-gp-border-default bg-gp-surface-control text-gp-text-muted",
                          )}
                        >
                          <Icon className="size-3.5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span
                            className={cn(
                              "block text-sm leading-5 font-semibold",
                              isActive
                                ? "text-gp-navy-850"
                                : "text-gp-text-secondary",
                            )}
                          >
                            {index + 1}. {section.label}
                          </span>
                          <span className="text-gp-text-muted mt-0.5 block text-xs leading-4 font-medium">
                            {section.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </nav>

                <div className="team-add-security-note bg-gp-surface-subtle border-gp-border-subtle mt-auto rounded-[14px] border p-4">
                  <div className="flex items-start gap-3">
                    <span className="bg-gp-surface-card text-gp-navy-800 border-gp-border-default flex size-8 shrink-0 items-center justify-center rounded-[9px] border">
                      <ShieldCheck className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-gp-navy-850 text-sm font-semibold">
                        Secure & Compliant
                      </p>
                      <p className="text-gp-text-muted mt-1 text-xs leading-5 font-medium">
                        Member information is handled securely.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="flex min-h-0 flex-col">
                <SheetHeader className="team-add-sheet-header border-gp-border-subtle sticky top-0 z-20 border-b bg-white/95 px-4 py-4 text-left backdrop-blur sm:px-5 lg:px-6">
                  <SheetTitle className="sr-only">Add Team Member</SheetTitle>
                  <SheetDescription className="sr-only">
                    Create a representative or supervisor profile for this team.
                  </SheetDescription>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 lg:hidden">
                      <p className="text-gp-gold-700 text-[11px] font-bold tracking-[0.08em] uppercase">
                        Member Creation Workspace
                      </p>
                      <h2 className="text-gp-navy-900 mt-1 text-[21px] leading-tight font-semibold">
                        Add Team Member
                      </h2>
                      <p className="text-gp-text-muted mt-1 text-sm leading-5 font-medium">
                        Step {activeWorkflowStep} of {workflowSections.length}:{" "}
                        {activeWorkflowSection.label}
                      </p>
                    </div>
                    <div className="hidden min-w-0 items-center gap-2 lg:flex">
                      <span className="bg-gp-gold-50 text-gp-gold-700 border-gp-gold-300 flex size-9 items-center justify-center rounded-[10px] border">
                        <ClipboardCheck className="size-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-gp-navy-850 text-sm font-semibold">
                          Member Creation Workspace
                        </p>
                        <p className="text-gp-text-muted text-xs font-medium">
                          Complete the profile details below.
                        </p>
                      </div>
                    </div>

                    <SheetClose asChild>
                      <button
                        type="button"
                        aria-label="Close add member sheet"
                        className="text-gp-text-muted hover:bg-gp-surface-subtle hover:text-gp-text-primary focus-visible:ring-gp-gold-500/25 inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] transition-[background-color,color,transform] duration-[160ms] hover:-translate-y-px focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </SheetClose>
                  </div>
                </SheetHeader>

                <div className="team-add-form-body bg-gp-surface-subtle min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5 lg:px-6">
                  <div className="team-add-mobile-progress border-gp-border-default shadow-gp-card rounded-[14px] border bg-white p-3 lg:hidden">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-gp-navy-850 text-sm font-semibold">
                        {activeWorkflowSection.label}
                      </p>
                      <p className="text-gp-gold-700 text-xs font-bold">
                        {activeWorkflowStep}/{workflowSections.length}
                      </p>
                    </div>
                    <div
                      className="bg-gp-border-subtle mt-2 h-1.5 overflow-hidden rounded-full"
                      aria-hidden="true"
                    >
                      <span
                        className="bg-gp-gold-500 ease-gp-premium block h-full rounded-full transition-[width] duration-[220ms] motion-reduce:transition-none"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {workflowSections.map((section, index) => {
                        const isActive = activeSection === section.id;

                        return (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => scrollToSection(section.id)}
                            aria-label={`Go to ${section.label}`}
                            aria-current={isActive ? "step" : undefined}
                            className={cn(
                              "team-add-mobile-step focus-visible:ring-gp-gold-500/15 h-8 rounded-[9px] border text-xs font-bold transition-[background-color,border-color,color,transform] duration-[160ms] focus-visible:ring-[3px] focus-visible:outline-none motion-reduce:transition-none",
                              isActive
                                ? "border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700"
                                : "border-gp-border-subtle bg-gp-surface-control text-gp-text-muted",
                            )}
                          >
                            {index + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    className="team-add-timezone team-add-form-stagger border-gp-gold-300 bg-gp-gold-50 text-gp-navy-800 flex items-start gap-3 rounded-[12px] border px-3 py-2.5 text-xs font-semibold"
                    style={
                      { "--team-add-stagger-delay": "20ms" } as CSSProperties
                    }
                  >
                    <CalendarClock
                      className="text-gp-gold-700 mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      Date fields use Saudi Arabia timezone (Asia/Riyadh).
                    </span>
                  </div>

                  <section
                    id="team-add-section-basic"
                    tabIndex={-1}
                    aria-labelledby="team-add-section-basic-heading"
                    onFocusCapture={() => setActiveSection("basic")}
                    className={formSectionClassName}
                    style={
                      { "--team-add-stagger-delay": "40ms" } as CSSProperties
                    }
                  >
                    <div className="mb-4 flex min-w-0 items-start gap-3">
                      <span className={sectionIconClassName}>
                        <UserRound className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h3
                          id="team-add-section-basic-heading"
                          className={sectionTitleClassName}
                        >
                          Basic Information
                        </h3>
                        <p className={sectionCopyClassName}>
                          Core identity and account credentials.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className={fieldLabelClassName}>
                              Full Name <RequiredMark />
                            </FormLabel>
                            <div className="team-add-field-shell relative">
                              <UserRound
                                className={fieldIconClassName}
                                aria-hidden="true"
                              />
                              <FormControl>
                                <Input
                                  placeholder="Enter full name"
                                  {...field}
                                  className={`${inputBase} pl-10`}
                                />
                              </FormControl>
                            </div>
                            <FormMessage className={fieldMessageClassName} />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className={fieldLabelClassName}>
                              Email <RequiredMark />
                            </FormLabel>
                            <div className="team-add-field-shell relative">
                              <Mail
                                className={fieldIconClassName}
                                aria-hidden="true"
                              />
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="email@golderapharm.com"
                                  {...field}
                                  className={`${inputBase} pl-10`}
                                />
                              </FormControl>
                            </div>
                            <FormMessage className={fieldMessageClassName} />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className={fieldLabelClassName}>
                              Phone Number <RequiredMark />
                            </FormLabel>
                            <div className="team-add-field-shell relative">
                              <Phone
                                className={fieldIconClassName}
                                aria-hidden="true"
                              />
                              <FormControl>
                                <Input
                                  placeholder="+966 XX XXX XXXX"
                                  {...field}
                                  className={`${inputBase} pl-10`}
                                />
                              </FormControl>
                            </div>
                            <FormMessage className={fieldMessageClassName} />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className={fieldLabelClassName}>
                              Password <RequiredMark />
                            </FormLabel>
                            <div className="team-add-field-shell relative">
                              <Lock
                                className={fieldIconClassName}
                                aria-hidden="true"
                              />
                              <FormControl>
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter password"
                                  {...field}
                                  className={`${inputBase} pr-10 pl-10`}
                                />
                              </FormControl>
                              <button
                                type="button"
                                aria-label={
                                  showPassword
                                    ? "Hide password"
                                    : "Show password"
                                }
                                onClick={() =>
                                  setShowPassword(
                                    (currentValue) => !currentValue,
                                  )
                                }
                                className="team-add-password-toggle text-gp-text-muted hover:bg-gp-surface-subtle hover:text-gp-navy-850 focus-visible:ring-gp-gold-500/20 absolute top-1/2 right-2.5 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-[8px] transition-[background-color,color,transform] duration-[160ms] focus-visible:ring-[3px] focus-visible:outline-none motion-reduce:transition-none"
                              >
                                {showPassword ? (
                                  <EyeOff
                                    className="team-add-password-toggle-icon size-4"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <Eye
                                    className="team-add-password-toggle-icon size-4"
                                    aria-hidden="true"
                                  />
                                )}
                              </button>
                            </div>
                            <FormMessage className={fieldMessageClassName} />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem className="space-y-2 md:col-span-2">
                            <FormLabel className={fieldLabelClassName}>
                              Date of Birth <RequiredMark />
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className={`${popoverButtonBase} ${
                                      !field.value && "text-gp-text-placeholder"
                                    }`}
                                  >
                                    <CalendarIcon
                                      className="team-add-select-icon text-gp-text-placeholder mr-2 size-4"
                                      aria-hidden="true"
                                    />
                                    <span className="truncate">
                                      {field.value
                                        ? formatSaudiDateDisplay(field.value)
                                        : "Pick a date"}
                                    </span>
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                align="start"
                                sideOffset={8}
                                className="border-gp-border-default shadow-gp-popover w-auto rounded-[12px] bg-white p-0"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  captionLayout="dropdown"
                                  fromYear={1950}
                                  toYear={getSaudiYear(new Date())}
                                  defaultMonth={
                                    field.value || new Date(1990, 0)
                                  }
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage className={fieldMessageClassName} />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>

                  <section
                    id="team-add-section-assignment"
                    tabIndex={-1}
                    aria-labelledby="team-add-section-assignment-heading"
                    onFocusCapture={() => setActiveSection("assignment")}
                    className={formSectionClassName}
                    style={
                      { "--team-add-stagger-delay": "80ms" } as CSSProperties
                    }
                  >
                    <div className="mb-4 flex min-w-0 items-start gap-3">
                      <span className={sectionIconClassName}>
                        <ShieldCheck className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h3
                          id="team-add-section-assignment-heading"
                          className={sectionTitleClassName}
                        >
                          Role & Assignment
                        </h3>
                        <p className={sectionCopyClassName}>
                          Team access, supervisor relationship, and territory.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className={fieldLabelClassName}>
                              Role <RequiredMark />
                            </FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                if (value === "SUPERVISOR") {
                                  form.setValue("supervisorId", "");
                                }
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className={selectTriggerBase}>
                                  <UserCog
                                    className={selectIconClassName}
                                    aria-hidden="true"
                                  />
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className={selectContentClassName}>
                                <SelectItem
                                  value="MEDICAL_REP"
                                  className={selectItemClassName}
                                >
                                  Medical Representative
                                </SelectItem>
                                <SelectItem
                                  value="SUPERVISOR"
                                  className={selectItemClassName}
                                >
                                  Supervisor
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className={fieldMessageClassName} />
                          </FormItem>
                        )}
                      />

                      {selectedRole === "MEDICAL_REP" && (
                        <FormField
                          control={form.control}
                          name="supervisorId"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className={fieldLabelClassName}>
                                Supervisor <RequiredMark />
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className={selectTriggerBase}>
                                    <UsersRound
                                      className={selectIconClassName}
                                      aria-hidden="true"
                                    />
                                    <SelectValue placeholder="Select supervisor" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent
                                  className={selectContentClassName}
                                >
                                  {supervisors.length > 0 ? (
                                    supervisors.map((supervisor) => (
                                      <SelectItem
                                        key={supervisor.id}
                                        value={supervisor.id}
                                        className={selectItemClassName}
                                      >
                                        {supervisor.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="no-supervisors" disabled>
                                      No supervisors available
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage className={fieldMessageClassName} />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="regionId"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className={fieldLabelClassName}>
                              Region
                            </FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue("subRegionId", "");
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className={selectTriggerBase}>
                                  <MapPin
                                    className={selectIconClassName}
                                    aria-hidden="true"
                                  />
                                  <SelectValue placeholder="Select region" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className={selectContentClassName}>
                                {regions.map((region) => (
                                  <SelectItem
                                    key={region.id}
                                    value={region.id}
                                    className={selectItemClassName}
                                  >
                                    {region.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className={fieldMessageClassName} />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subRegionId"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className={fieldLabelClassName}>
                              Sub-Region
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={
                                !selectedRegionId || subRegions.length === 0
                              }
                            >
                              <FormControl>
                                <SelectTrigger className={selectTriggerBase}>
                                  <MapPin
                                    className={selectIconClassName}
                                    aria-hidden="true"
                                  />
                                  <SelectValue
                                    placeholder={
                                      selectedRegionId
                                        ? "Select territory"
                                        : "Select region first"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className={selectContentClassName}>
                                {subRegions.map((subRegion) => (
                                  <SelectItem
                                    key={subRegion.id}
                                    value={subRegion.id}
                                    className={selectItemClassName}
                                  >
                                    {subRegion.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className={fieldMessageClassName} />
                          </FormItem>
                        )}
                      />

                      <div
                        data-ready={selectedSubRegion ? "true" : "false"}
                        className={cn(
                          "gp-territory-preview md:col-span-2 rounded-[12px] border px-3 py-3 transition-[border-color,background-color,transform,opacity] duration-[200ms] motion-reduce:transition-none",
                          selectedSubRegion
                            ? "border-gp-gold-300 bg-gp-gold-50"
                            : "border-gp-border-subtle bg-gp-surface-subtle",
                        )}
                      >
                        <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.08em] uppercase">
                          Assigned Territory
                        </p>
                        {selectedSubRegion ? (
                          <div className="text-gp-navy-900 mt-2 flex flex-wrap items-center gap-1.5 text-sm font-semibold">
                            <span>{assignedTerritory.district}</span>
                            <ChevronRight
                              className="text-gp-gold-600 size-3.5"
                              aria-hidden="true"
                            />
                            <span>{assignedTerritory.region}</span>
                            <ChevronRight
                              className="text-gp-gold-600 size-3.5"
                              aria-hidden="true"
                            />
                            <span>{assignedTerritory.territory}</span>
                          </div>
                        ) : (
                          <p className="text-gp-text-muted mt-2 text-sm font-medium">
                            Select a region first, then choose a territory to
                            preview the assignment.
                          </p>
                        )}
                      </div>

                      <FormField
                        control={form.control}
                        name="dateOfRecruitment"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className={fieldLabelClassName}>
                              Date of Recruitment
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className={`${popoverButtonBase} ${
                                      !field.value && "text-gp-text-placeholder"
                                    }`}
                                  >
                                    <CalendarDays
                                      className="team-add-select-icon text-gp-text-placeholder mr-2 size-4"
                                      aria-hidden="true"
                                    />
                                    <span className="truncate">
                                      {field.value
                                        ? formatSaudiDateDisplay(field.value)
                                        : "Pick a date"}
                                    </span>
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                align="start"
                                sideOffset={8}
                                className="border-gp-border-default shadow-gp-popover w-auto rounded-[12px] bg-white p-0"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  captionLayout="dropdown"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage className={fieldMessageClassName} />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="educationBackground"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className={fieldLabelClassName}>
                              Educational Background
                            </FormLabel>
                            <div className="team-add-field-shell relative">
                              <GraduationCap
                                className={fieldIconClassName}
                                aria-hidden="true"
                              />
                              <FormControl>
                                <Input
                                  placeholder="e.g., Bachelor of Pharmaceutical Sciences"
                                  {...field}
                                  className={`${inputBase} pl-10`}
                                />
                              </FormControl>
                            </div>
                            <FormMessage className={fieldMessageClassName} />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>

                  <section
                    id="team-add-section-documents"
                    tabIndex={-1}
                    aria-labelledby="team-add-section-documents-heading"
                    onFocusCapture={() => setActiveSection("documents")}
                    className={formSectionClassName}
                    style={
                      { "--team-add-stagger-delay": "120ms" } as CSSProperties
                    }
                  >
                    <div className="mb-4 flex min-w-0 items-start gap-3">
                      <span className={sectionIconClassName}>
                        <FileText className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h3
                          id="team-add-section-documents-heading"
                          className={sectionTitleClassName}
                        >
                          Documents & Identification
                        </h3>
                        <p className={sectionCopyClassName}>
                          Optional IDs and supporting profile documents.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="iqamaNumber"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className={fieldLabelClassName}>
                              Iqama Number
                            </FormLabel>
                            <div className="team-add-field-shell relative">
                              <BadgeCheck
                                className={fieldIconClassName}
                                aria-hidden="true"
                              />
                              <FormControl>
                                <Input
                                  placeholder="Enter Iqama number"
                                  {...field}
                                  className={`${inputBase} pl-10`}
                                />
                              </FormControl>
                            </div>
                            <FormMessage className={fieldMessageClassName} />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="passportNumber"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className={fieldLabelClassName}>
                              Passport Number
                            </FormLabel>
                            <div className="team-add-field-shell relative">
                              <FileText
                                className={fieldIconClassName}
                                aria-hidden="true"
                              />
                              <FormControl>
                                <Input
                                  placeholder="Enter passport number"
                                  {...field}
                                  className={`${inputBase} pl-10`}
                                />
                              </FormControl>
                            </div>
                            <FormMessage className={fieldMessageClassName} />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="resume"
                        render={({
                          field: { value, onChange, ...fieldProps },
                        }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className={fieldLabelClassName}>
                              Attach CV/Resume
                            </FormLabel>
                            <FormControl>
                              <div
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  setIsDraggingCV(true);
                                }}
                                onDragLeave={() => setIsDraggingCV(false)}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setIsDraggingCV(false);
                                  const file = e.dataTransfer.files?.[0];
                                  if (file) {
                                    onChange(file);
                                  }
                                }}
                                className={cn(
                                  "team-upload-zone focus-within:ring-gp-gold-500/15 relative flex min-h-[132px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[14px] border border-dashed p-4 text-center transition-[border-color,background-color,box-shadow] duration-[190ms] focus-within:ring-[3px]",
                                  isDraggingCV
                                    ? "border-gp-gold-500 bg-gp-gold-100 shadow-gp-card"
                                    : value
                                      ? "border-gp-gold-300 bg-gp-gold-50"
                                      : "border-gp-border-control bg-white",
                                )}
                              >
                                <input
                                  {...fieldProps}
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  aria-label="Attach CV or resume"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    onChange(file);
                                  }}
                                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                                />
                                <span className="bg-gp-surface-subtle border-gp-border-subtle text-gp-gold-700 flex size-11 items-center justify-center rounded-full border">
                                  <UploadCloud
                                    className="team-upload-icon size-5"
                                    aria-hidden="true"
                                  />
                                </span>
                                {value ? (
                                  <div className="mt-3 max-w-full text-center">
                                    <div className="team-upload-file-row border-gp-border-subtle mx-auto flex max-w-full items-center gap-2 rounded-[10px] border bg-white px-3 py-2 text-left">
                                      <FileText
                                        className="text-gp-gold-700 size-4 shrink-0"
                                        aria-hidden="true"
                                      />
                                      <div className="min-w-0">
                                        <p
                                          className="text-gp-navy-850 max-w-full truncate text-sm font-semibold"
                                          title={value.name}
                                        >
                                          {value.name}
                                        </p>
                                        <p className="text-gp-text-muted text-xs font-medium">
                                          {(value.size / 1024).toFixed(1)} KB
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-gp-text-muted mt-2 text-xs font-medium">
                                      Click or drop to replace
                                    </p>
                                  </div>
                                ) : (
                                  <div className="mt-3 text-center">
                                    <p className="text-gp-navy-850 text-sm font-semibold">
                                      Upload resume
                                    </p>
                                    <p className="text-gp-text-muted mt-1 text-xs font-medium">
                                      PDF, DOC, DOCX - Max 5MB
                                    </p>
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage className={fieldMessageClassName} />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="certificates"
                        render={({
                          field: { value, onChange, ...fieldProps },
                        }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className={fieldLabelClassName}>
                              Certificates
                            </FormLabel>
                            <FormControl>
                              <div
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  setIsDraggingCerts(true);
                                }}
                                onDragLeave={() => setIsDraggingCerts(false)}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setIsDraggingCerts(false);
                                  const files = e.dataTransfer.files;
                                  if (files && files.length > 0) {
                                    onChange(files);
                                  }
                                }}
                                className={cn(
                                  "team-upload-zone focus-within:ring-gp-gold-500/15 relative flex min-h-[132px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[14px] border border-dashed p-4 text-center transition-[border-color,background-color,box-shadow] duration-[190ms] focus-within:ring-[3px]",
                                  isDraggingCerts
                                    ? "border-gp-gold-500 bg-gp-gold-100 shadow-gp-card"
                                    : value && value.length > 0
                                      ? "border-gp-gold-300 bg-gp-gold-50"
                                      : "border-gp-border-control bg-white",
                                )}
                              >
                                <input
                                  {...fieldProps}
                                  type="file"
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  multiple
                                  aria-label="Attach certificates"
                                  onChange={(e) => {
                                    const files = e.target.files;
                                    onChange(files);
                                  }}
                                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                                />
                                <span className="bg-gp-surface-subtle border-gp-border-subtle text-gp-gold-700 flex size-11 items-center justify-center rounded-full border">
                                  <UploadCloud
                                    className="team-upload-icon size-5"
                                    aria-hidden="true"
                                  />
                                </span>
                                {value && value.length > 0 ? (
                                  <div className="mt-3 max-w-full text-center">
                                    <div className="team-upload-file-row border-gp-border-subtle mx-auto max-w-full rounded-[10px] border bg-white px-3 py-2 text-left">
                                      <p className="text-gp-navy-850 text-sm font-semibold">
                                        {value.length} file
                                        {value.length > 1 ? "s" : ""} selected
                                      </p>
                                      <div className="mt-1 max-h-14 max-w-full overflow-y-auto">
                                        {Array.from(value).map((file, idx) => (
                                          <p
                                            key={idx}
                                            className="text-gp-text-muted max-w-full truncate text-xs font-medium"
                                            title={file.name}
                                          >
                                            {file.name} (
                                            {(file.size / 1024).toFixed(1)} KB)
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                    <p className="text-gp-text-muted mt-2 text-xs font-medium">
                                      Click or drop to replace
                                    </p>
                                  </div>
                                ) : (
                                  <div className="mt-3 text-center">
                                    <p className="text-gp-navy-850 text-sm font-semibold">
                                      Upload certificates
                                    </p>
                                    <p className="text-gp-text-muted mt-1 text-xs font-medium">
                                      PDF, DOC, DOCX, JPG, PNG
                                    </p>
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage className={fieldMessageClassName} />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>

                  <section
                    id="team-add-section-review"
                    tabIndex={-1}
                    aria-labelledby="team-add-section-review-heading"
                    onFocusCapture={() => setActiveSection("review")}
                    className={cn(formSectionClassName, "mb-1")}
                    style={
                      { "--team-add-stagger-delay": "160ms" } as CSSProperties
                    }
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className={sectionIconClassName}>
                        <ClipboardCheck className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h3
                          id="team-add-section-review-heading"
                          className={sectionTitleClassName}
                        >
                          Review & Confirm
                        </h3>
                        <p className={sectionCopyClassName}>
                          Confirm the member details before creating the
                          profile.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="team-add-review-card border-gp-border-subtle bg-gp-surface-subtle rounded-[12px] border px-3 py-3">
                        <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.04em] uppercase">
                          Identity
                        </p>
                        <p className="text-gp-navy-850 mt-1 text-sm font-semibold">
                          Required
                        </p>
                      </div>
                      <div className="team-add-review-card border-gp-border-subtle bg-gp-surface-subtle rounded-[12px] border px-3 py-3">
                        <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.04em] uppercase">
                          Assignment
                        </p>
                        <p className="text-gp-navy-850 mt-1 text-sm font-semibold">
                          Role based
                        </p>
                      </div>
                      <div className="team-add-review-card border-gp-border-subtle bg-gp-surface-subtle rounded-[12px] border px-3 py-3">
                        <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.04em] uppercase">
                          Documents
                        </p>
                        <p className="text-gp-navy-850 mt-1 text-sm font-semibold">
                          Optional
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                <SheetFooter className="team-add-form-footer border-gp-border-subtle sticky bottom-0 z-20 mt-0 flex flex-col-reverse gap-3 border-t bg-white/95 px-4 py-4 shadow-[0_-10px_24px_rgba(16,29,54,0.06)] backdrop-blur sm:flex-row sm:justify-end sm:px-5 lg:px-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      resetFormState();
                    }}
                    disabled={isPending}
                    className="border-gp-border-default text-gp-text-secondary hover:border-gp-border-control hover:bg-gp-surface-control hover:text-gp-text-primary focus-visible:ring-gp-gold-500/15 h-11 cursor-pointer rounded-[10px] px-5 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-[160ms] hover:-translate-y-px focus-visible:ring-[3px] focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="team-add-submit bg-gp-navy-900 hover:bg-gp-navy-850 focus-visible:ring-gp-gold-500/25 h-11 cursor-pointer rounded-[10px] border border-transparent px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(16,29,54,0.18)] transition-[background-color,color,transform,box-shadow] duration-[170ms] hover:-translate-y-px hover:text-white hover:shadow-[0_10px_24px_rgba(16,29,54,0.24)] focus-visible:ring-[3px] focus-visible:outline-none active:translate-y-0 active:scale-[0.98] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    {isPending ? (
                      <Loader2
                        className="text-gp-gold-500 size-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <UserPlus
                        className="team-add-submit-icon text-gp-gold-500 size-4"
                        aria-hidden="true"
                      />
                    )}
                    {isPending ? "Adding Member..." : "Add Team Member"}
                  </Button>
                </SheetFooter>
              </div>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
