"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDrawer } from "@/components/shared/FormDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarDays,
  ClipboardCheck,
  Loader2,
  MessageSquare,
  Star,
  UserPlus,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createAppraisalSchema,
  type CreateAppraisalFormValues,
} from "../lib/schemas";
import { createAppraisalAction } from "../api";
import { getManagerTeamAction } from "@/features/team/api";
import { toast } from "@/lib/utils/toast";
import {
  formatDateOnly,
  formatSaudiMonthYear,
  getSaudiDateParts,
} from "@/lib/utils";
import { OPEN_APPRAISAL_DIALOG_EVENT } from "../lib/events";

// ─── Static config ────────────────────────────────────────────────────────────

function lastDay(year: number, month: number) {
  return formatDateOnly(new Date(year, month, 0));
}

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: lastDay(2026, i + 1),
  label: formatSaudiMonthYear(new Date(2026, i, 1)),
}));

const SECTIONS: {
  title: string;
  fields: { name: keyof CreateAppraisalFormValues; label: string }[];
}[] = [
  {
    title: "Job Related Skills",
    fields: [
      { name: "presentationSkills", label: "Presentation Skills" },
      { name: "sellingSkills", label: "Selling Skills" },
      { name: "reporting", label: "Reporting" },
    ],
  },
  {
    title: "Job Knowledge Skills",
    fields: [
      { name: "productInformation", label: "Product Information" },
      { name: "competitorsInformation", label: "Competitors Information" },
    ],
  },
  {
    title: "Organizational Skills",
    fields: [
      {
        name: "organizationalValueAwareness",
        label: "Organization's Value and Policy Awareness",
      },
      {
        name: "properUtilizationOfResources",
        label: "Proper Utilization of Resources",
      },
    ],
  },
  {
    title: "Interpersonal Skills",
    fields: [
      {
        name: "reliabilityAndCredibility",
        label: "Reliability and Credibility",
      },
      { name: "independenceAndJudgment", label: "Independence and Judgment" },
      { name: "teamSpirit", label: "Team Spirit" },
      { name: "personalDrive", label: "Personal Drive" },
      { name: "creativityAndInitiative", label: "Creativity and Initiative" },
      { name: "broadProspective", label: "Broad Prospective" },
      { name: "communicationSkills", label: "Communication Skills" },
      { name: "planningAndOrganizing", label: "Planning and Organizing" },
    ],
  },
  {
    title: "General Factors",
    fields: [
      { name: "appearance", label: "Appearance" },
      { name: "attitude", label: "Attitude" },
      { name: "timing", label: "Timing" },
    ],
  },
];

const SCORE_NAMES = SECTIONS.flatMap((s) => s.fields.map((f) => f.name));
const DEFAULT_SCORE = 75;
const SAUDI_TODAY = getSaudiDateParts(new Date());
const SAUDI_CURRENT_YEAR = Number(SAUDI_TODAY.year);
const SAUDI_CURRENT_MONTH = Number(SAUDI_TODAY.month);

const STEP_NAMES = [
  { number: "01", label: "Context" },
  { number: "02", label: "Criteria" },
  { number: "03", label: "Rating" },
  { number: "04", label: "Feedback" },
];

function badgeFor(s: number) {
  if (s >= 90)
    return {
      label: "Excellent",
      cls: "text-gp-success border-gp-success-border bg-gp-success-soft",
    };
  if (s >= 70)
    return {
      label: "Good",
      cls: "text-gp-gold-700 border-gp-gold-300 bg-gp-gold-50",
    };
  if (s >= 50)
    return {
      label: "Improving",
      cls: "text-gp-warning border-gp-warning-border bg-gp-warning-soft",
    };
  return {
    label: "Needs Improvement",
    cls: "text-gp-danger border-gp-danger-border bg-gp-danger-soft",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NewAppraisalDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [activeStep, setActiveStep] = useState(0);
  const [reps, setReps] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Imperative refs for the overall bar — avoids any parent re-render on every slider move
  const barRef = useRef<HTMLDivElement>(null);
  const scoreTextRef = useRef<HTMLSpanElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);

  // Imperative refs for the scroll-tracked progress stepper
  const bodyRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const activeStepRef = useRef(0);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);

  const { control, handleSubmit, reset, getValues, register } =
    useForm<CreateAppraisalFormValues>({
      resolver: zodResolver(createAppraisalSchema),
      defaultValues: {
        repId: "",
        period: lastDay(SAUDI_CURRENT_YEAR, SAUDI_CURRENT_MONTH),
        ...Object.fromEntries(SCORE_NAMES.map((n) => [n, DEFAULT_SCORE])),
        feedbackComments: "",
      },
    });

  // Direct DOM update — zero React renders for the overall bar
  function syncOverall() {
    const vals = SCORE_NAMES.map(
      (n) => (getValues(n as keyof CreateAppraisalFormValues) as number) ?? 0,
    );
    const score = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    if (barRef.current) barRef.current.style.width = `${score}%`;
    if (scoreTextRef.current) scoreTextRef.current.textContent = `${score}%`;
    if (badgeRef.current) {
      const b = badgeFor(score);
      badgeRef.current.textContent = b.label;
      badgeRef.current.className = `rounded-full border px-3 py-0.5 text-xs font-semibold ${b.cls}`;
    }
  }

  function handleBodyScroll() {
    const body = bodyRef.current;
    const bar = progressRef.current;
    if (!body || !bar) return;
    const maxScroll = body.scrollHeight - body.clientHeight;
    const ratio = maxScroll > 0 ? Math.min(1, body.scrollTop / maxScroll) : 0;
    bar.style.width = `${Math.round(ratio * 100)}%`;

    let active = 0;
    for (let i = 0; i < stepRefs.current.length; i++) {
      const el = stepRefs.current[i];
      if (el && el.offsetTop - body.scrollTop <= 96) active = i;
    }
    if (active !== activeStepRef.current) {
      activeStepRef.current = active;
      setActiveStep(active);
    }
  }

  function scrollToStep(index: number) {
    const body = bodyRef.current;
    const el = stepRefs.current[index];
    if (!body || !el) return;
    body.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
  }

  function closeAndReset() {
    setOpen(false);
    reset();
    activeStepRef.current = 0;
    setActiveStep(0);
  }

  useEffect(() => {
    function onRequestOpen() {
      setOpen(true);
    }
    window.addEventListener(OPEN_APPRAISAL_DIALOG_EVENT, onRequestOpen);
    return () =>
      window.removeEventListener(OPEN_APPRAISAL_DIALOG_EVENT, onRequestOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    getManagerTeamAction("MEDICAL_REP")
      .then((r) => {
        if (r.success && r.medicalReps) setReps(r.medicalReps);
      })
      .catch(() => toast.error({ title: "Failed to load team" }))
      .finally(() => setIsLoading(false));
  }, [open]);

  function onSubmit(values: CreateAppraisalFormValues) {
    startTransition(async () => {
      const result = await createAppraisalAction(values);
      if (result.success) {
        toast.success({ title: "Appraisal created successfully" });
        setOpen(false);
        reset();
        activeStepRef.current = 0;
        setActiveStep(0);
        router.refresh();
      } else {
        toast.error({
          title: "Couldn't create appraisal",
          description: result.error?.message,
        });
      }
    });
  }

  const selectTriggerBase =
    "h-11 w-full cursor-pointer rounded-[10px] border border-gp-border-control bg-white px-3 text-sm font-medium text-gp-text-primary shadow-none transition-[border-color,background-color,box-shadow,color] duration-[160ms] hover:border-gp-border-default hover:bg-gp-surface-hover focus:border-gp-gold-500 focus:ring-[3px] focus:ring-gp-gold-500/10 data-[state=open]:border-gp-gold-500 data-[state=open]:bg-gp-surface-hover disabled:cursor-not-allowed disabled:opacity-70";

  const fieldLabel =
    "text-gp-navy-800 flex items-center gap-1.5 text-xs font-semibold";

  return (
    <FormDrawer
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button className="appraisal-add-trigger group bg-gp-navy-900 hover:bg-gp-navy-900/95 focus-visible:ring-gp-gold-500/25 h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-transparent px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(16,29,54,0.18)] transition-[filter,box-shadow,transform] duration-[170ms] hover:-translate-y-px hover:shadow-[0_10px_24px_rgba(16,29,54,0.22)] focus-visible:ring-[3px] focus-visible:outline-none active:translate-y-0 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
          <UserPlus
            className="appraisal-add-icon text-gp-gold-500 size-4"
            aria-hidden="true"
          />
          New Appraisal
        </Button>
      }
      title="New Performance Appraisal"
      eyebrow="New Appraisal"
      description="Create and document an employee review."
      icon={<ClipboardCheck className="size-5" aria-hidden="true" />}
      width="xl"
      bodyClassName="flex flex-col overflow-hidden bg-white p-0"
      closeLabel="Close new appraisal drawer"
    >
      {isLoading ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 bg-white">
          <span className="bg-gp-gold-50 text-gp-gold-700 flex size-11 items-center justify-center rounded-full">
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          </span>
          <p className="text-gp-text-muted text-sm font-medium">
            Loading your team...
          </p>
        </div>
      ) : (
        <>
          <div className="border-gp-border-subtle flex flex-col gap-2.5 border-b bg-white px-5 py-3 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <p
                className="text-gp-navy-900 text-sm font-semibold"
                aria-live="polite"
              >
                {STEP_NAMES[activeStep].number} · {STEP_NAMES[activeStep].label}
              </p>
              <p className="text-gp-gold-700 text-xs font-bold">
                Step {activeStep + 1} of {STEP_NAMES.length}
              </p>
            </div>
            <div
              className="bg-gp-border-subtle h-1.5 w-full overflow-hidden rounded-full"
              aria-hidden="true"
            >
              <span
                ref={progressRef}
                className="bg-gp-gold-500 block h-full rounded-full transition-[width] duration-[220ms] ease-out motion-reduce:transition-none"
                style={{ width: "0%" }}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {STEP_NAMES.map((step, index) => (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => scrollToStep(index)}
                  aria-current={activeStep === index ? "step" : undefined}
                  aria-label={`Go to step ${step.number} ${step.label}`}
                  className={cn(
                    "h-8 cursor-pointer rounded-[9px] border text-xs font-bold transition-[background-color,border-color,color] duration-[160ms] motion-reduce:transition-none",
                    activeStep === index
                      ? "border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700"
                      : "border-gp-border-subtle bg-gp-surface-control text-gp-text-muted hover:border-gp-gold-300 hover:text-gp-gold-700",
                  )}
                >
                  {step.number} {step.label}
                </button>
              ))}
            </div>
          </div>

          <form
            id="new-appraisal-form"
            // eslint-disable-next-line react-hooks/refs -- onSubmit writes legacy refs inside the async submit handler, not during render
            onSubmit={handleSubmit(onSubmit)}
            className="min-h-0 flex-1"
          >
            <div
              ref={bodyRef}
              onScroll={handleBodyScroll}
              className="bg-gp-surface-subtle h-full min-h-0 space-y-4 overflow-y-auto p-4 sm:p-5"
            >
              {/* 01 Employee & Review Context */}
              <section
                ref={(element) => {
                  stepRefs.current[0] = element;
                }}
                aria-labelledby="appraisal-step-context-heading"
                className="appraisal-form-section border-gp-border-default shadow-gp-card scroll-mt-24 rounded-[16px] border bg-white p-4 sm:p-5"
              >
                <div className="mb-4 flex min-w-0 items-start gap-3">
                  <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-8 shrink-0 items-center justify-center rounded-[9px] border text-xs font-bold">
                    01
                  </span>
                  <div className="min-w-0">
                    <h3
                      id="appraisal-step-context-heading"
                      className="text-gp-navy-850 text-[11px] font-bold tracking-[0.08em] uppercase"
                    >
                      Employee & Review Context
                    </h3>
                    <p className="text-gp-text-muted mt-0.5 text-xs leading-5 font-medium">
                      Select the employee and the appraisal review period.
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
                  <div className="min-w-0 space-y-1.5">
                    <label className={fieldLabel}>
                      <UserRound
                        className="text-gp-gold-600 size-4"
                        aria-hidden="true"
                      />
                      Select Employee
                    </label>
                    <Controller
                      control={control}
                      name="repId"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger
                            className={cn(selectTriggerBase, "pl-10")}
                          >
                            <UserRound
                              className="text-gp-text-placeholder pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                              aria-hidden="true"
                            />
                            <SelectValue placeholder="Choose an employee..." />
                          </SelectTrigger>
                          <SelectContent className="border-gp-border-default shadow-gp-popover text-gp-text-primary max-h-72 rounded-[12px] bg-white">
                            {reps.map((r) => (
                              <SelectItem
                                key={r.id}
                                value={r.id}
                                className="text-gp-text-secondary focus:bg-gp-gold-50 focus:text-gp-gold-700 data-[state=checked]:text-gp-text-primary cursor-pointer rounded-[8px] text-sm font-medium"
                              >
                                {r.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="min-w-0 space-y-1.5">
                    <label className={fieldLabel}>
                      <CalendarDays
                        className="text-gp-gold-600 size-4"
                        aria-hidden="true"
                      />
                      Review Period
                    </label>
                    <p className="text-gp-text-muted text-xs">
                      Uses Saudi Arabia timezone (Asia/Riyadh).
                    </p>
                    <Controller
                      control={control}
                      name="period"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger
                            className={cn(selectTriggerBase, "pl-10")}
                          >
                            <CalendarDays
                              className="text-gp-text-placeholder pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                              aria-hidden="true"
                            />
                            <SelectValue>
                              {formatSaudiMonthYear(new Date(field.value))}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="border-gp-border-default shadow-gp-popover text-gp-text-primary max-h-72 rounded-[12px] bg-white">
                            {MONTHS.map((m) => (
                              <SelectItem
                                key={m.value}
                                value={m.value}
                                className="text-gp-text-secondary focus:bg-gp-gold-50 focus:text-gp-gold-700 data-[state=checked]:text-gp-text-primary cursor-pointer rounded-[8px] text-sm font-medium"
                              >
                                {m.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </section>

              {/* 02 Performance Criteria */}
              <section
                ref={(element) => {
                  stepRefs.current[1] = element;
                }}
                aria-labelledby="appraisal-step-criteria-heading"
                className="appraisal-form-section border-gp-border-default shadow-gp-card scroll-mt-24 rounded-[16px] border bg-white p-4 sm:p-5"
              >
                <div className="mb-4 flex min-w-0 items-start gap-3">
                  <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-8 shrink-0 items-center justify-center rounded-[9px] border text-xs font-bold">
                    02
                  </span>
                  <div className="min-w-0">
                    <h3
                      id="appraisal-step-criteria-heading"
                      className="text-gp-navy-850 text-[11px] font-bold tracking-[0.08em] uppercase"
                    >
                      Performance Criteria
                    </h3>
                    <p className="text-gp-text-muted mt-0.5 text-xs leading-5 font-medium">
                      Score each criterion on a 0–100 scale.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {SECTIONS.map(({ title, fields }) => (
                    <div
                      key={title}
                      className="border-gp-border-subtle bg-gp-surface-subtle/50 space-y-3.5 rounded-[12px] border p-3.5 sm:p-4"
                    >
                      <div className="flex items-center gap-2">
                        <span className="bg-gp-navy-900 text-gp-gold-500 flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold">
                          {title.split(" ")[0].slice(0, 1)}
                        </span>
                        <h4 className="text-gp-navy-900 text-[13px] leading-5 font-semibold">
                          {title}
                        </h4>
                      </div>
                      {fields.map(({ name, label }) => (
                        <Controller
                          key={name}
                          control={control}
                          name={name as keyof CreateAppraisalFormValues}
                          render={({ field }) => {
                            const val = (field.value as number) ?? 0;
                            return (
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                <span className="text-gp-navy-800 w-full shrink-0 text-[13px] font-medium sm:w-52">
                                  {label}
                                </span>
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={val}
                                  onChange={(e) => {
                                    field.onChange(+e.target.value);
                                    syncOverall();
                                  }}
                                  className="appraisal-slider min-w-32 flex-1 cursor-pointer"
                                  style={{
                                    background: `linear-gradient(90deg,#C9A44C ${val}%, var(--gp-border-subtle) ${val}%)`,
                                  }}
                                  aria-label={`${label} score`}
                                />
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={val}
                                  onChange={(e) => {
                                    const n = Math.min(
                                      100,
                                      Math.max(0, +e.target.value || 0),
                                    );
                                    field.onChange(n);
                                    syncOverall();
                                  }}
                                  className="border-gp-border-control text-gp-navy-900 focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/10 w-16 text-center text-sm font-semibold shadow-none"
                                  aria-label={`${label} score value`}
                                />
                              </div>
                            );
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </section>

              {/* 03 Overall Rating */}
              <section
                ref={(element) => {
                  stepRefs.current[2] = element;
                }}
                aria-labelledby="appraisal-step-rating-heading"
                className="appraisal-form-section border-gp-border-default shadow-gp-card scroll-mt-24 rounded-[16px] border bg-white p-4 sm:p-5"
              >
                <div className="mb-4 flex min-w-0 items-start gap-3">
                  <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-8 shrink-0 items-center justify-center rounded-[9px] border text-xs font-bold">
                    03
                  </span>
                  <div className="min-w-0">
                    <h3
                      id="appraisal-step-rating-heading"
                      className="text-gp-navy-850 text-[11px] font-bold tracking-[0.08em] uppercase"
                    >
                      Overall Rating
                    </h3>
                    <p className="text-gp-text-muted mt-0.5 text-xs leading-5 font-medium">
                      Automatically averaged from all criteria.
                    </p>
                  </div>
                </div>
                <div className="border-gp-border-subtle bg-gp-surface-subtle/50 rounded-[14px] border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <Star
                        className="text-gp-gold-600 size-4 shrink-0"
                        aria-hidden="true"
                      />
                      <p className="text-gp-navy-900 text-sm font-semibold">
                        Overall Performance Score
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        ref={scoreTextRef}
                        className="text-gp-navy-900 text-2xl leading-none font-bold"
                      >
                        {DEFAULT_SCORE}%
                      </span>
                      <span
                        ref={badgeRef}
                        className="text-gp-gold-700 border-gp-gold-300 bg-gp-gold-50 rounded-full border px-3 py-0.5 text-xs font-semibold"
                      >
                        Good
                      </span>
                    </div>
                  </div>
                  <div
                    className="bg-gp-border-subtle mt-4 h-2.5 w-full overflow-hidden rounded-full"
                    aria-hidden="true"
                  >
                    <div
                      ref={barRef}
                      className="bg-gp-gold-500 h-full rounded-full"
                      style={{ width: `${DEFAULT_SCORE}%` }}
                    />
                  </div>
                </div>
              </section>

              {/* 04 Final Comments */}
              <section
                ref={(element) => {
                  stepRefs.current[3] = element;
                }}
                aria-labelledby="appraisal-step-feedback-heading"
                className="appraisal-form-section border-gp-border-default shadow-gp-card scroll-mt-24 rounded-[16px] border bg-white p-4 sm:p-5"
              >
                <div className="mb-4 flex min-w-0 items-start gap-3">
                  <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-8 shrink-0 items-center justify-center rounded-[9px] border text-xs font-bold">
                    04
                  </span>
                  <div className="min-w-0">
                    <h3
                      id="appraisal-step-feedback-heading"
                      className="text-gp-navy-850 text-[11px] font-bold tracking-[0.08em] uppercase"
                    >
                      Final Comments
                    </h3>
                    <p className="text-gp-text-muted mt-0.5 text-xs leading-5 font-medium">
                      Add supporting feedback for the review.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MessageSquare
                    className="text-gp-gold-600 mt-3 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <label htmlFor="appraisal-feedback" className={fieldLabel}>
                      Feedback Comments{" "}
                      <span className="text-gp-text-placeholder font-medium">
                        (optional)
                      </span>
                    </label>
                    <Textarea
                      id="appraisal-feedback"
                      {...register("feedbackComments")}
                      placeholder="Add any additional feedback or comments..."
                      className="appraisal-textarea border-gp-border-control bg-gp-surface-control text-gp-navy-900 placeholder:text-gp-text-placeholder hover:border-gp-gold-300 focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/15 min-h-28 w-full rounded-[10px] px-3.5 py-2.5 text-sm leading-5 shadow-none"
                    />
                  </div>
                </div>
              </section>
            </div>
          </form>

          <footer className="border-gp-border-subtle sticky bottom-0 z-10 flex flex-col gap-3 border-t bg-white/95 px-4 py-3.5 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-gp-text-muted text-xs font-medium">
              All criteria are scored on a 0–100 scale.
            </p>
            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                className="border-gp-border-default text-gp-text-secondary hover:border-gp-border-control hover:bg-gp-surface-control hover:text-gp-text-primary focus-visible:ring-gp-gold-500/15 h-11 cursor-pointer rounded-[10px] px-5 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-[160ms] hover:-translate-y-px focus-visible:ring-[3px] focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                onClick={closeAndReset}
              >
                Cancel
              </Button>
              <Button
                form="new-appraisal-form"
                type="submit"
                disabled={isPending}
                className="appraisal-save gp-primary-action border-gp-navy-900 bg-gp-navy-900 hover:bg-gp-navy-900/95 focus-visible:ring-gp-gold-500/25 h-11 cursor-pointer rounded-[10px] border px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(16,29,54,0.18)] transition-[box-shadow,transform,background-color] duration-[170ms] hover:-translate-y-px hover:shadow-[0_10px_24px_rgba(16,29,54,0.22)] focus-visible:ring-[3px] focus-visible:outline-none active:translate-y-0 active:scale-[0.98] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                {isPending ? (
                  <>
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4" aria-hidden="true" />
                    Submit Appraisal
                  </>
                )}
              </Button>
            </div>
          </footer>
        </>
      )}
    </FormDrawer>
  );
}
