"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, Loader2, User, Calendar } from "lucide-react";
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

function badgeFor(s: number) {
  if (s >= 90)
    return { label: "Excellent", cls: "bg-green-100 text-green-700" };
  if (s >= 70) return { label: "Good", cls: "bg-blue-100 text-blue-700" };
  if (s >= 50)
    return { label: "Improving", cls: "bg-yellow-100 text-yellow-700" };
  return { label: "Needs Improvement", cls: "bg-red-100 text-red-700" };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NewAppraisalDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [reps, setReps] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Imperative refs for the overall bar — avoids any parent re-render on every slider move
  const barRef = useRef<HTMLDivElement>(null);
  const scoreTextRef = useRef<HTMLSpanElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);

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
      badgeRef.current.className = `rounded-full px-3 py-0.5 text-xs font-semibold ${b.cls}`;
    }
  }

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
        router.refresh();
      } else {
        toast.error({
          title: "Failed to create appraisal",
          description: result.error?.message,
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gold border-gold hover:text-gold ml-auto cursor-pointer rounded-lg border px-4 py-2 text-sm/5 font-medium text-white hover:bg-white">
          <Plus size={16} /> New Appraisal
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-130">
        <DialogHeader>
          <DialogTitle>Create New Performance Appraisal</DialogTitle>
          <DialogDescription>
            Evaluate employee performance across key categories
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Employee + Period */}
            <div className="flex w-full justify-between">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4" /> Select Employee
                </label>
                <Controller
                  control={control}
                  name="repId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="border-gray-200 bg-gray-50">
                        <SelectValue placeholder="Choose an employee..." />
                      </SelectTrigger>
                      <SelectContent>
                        {reps.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4" /> Review Period
                </label>
                <p className="text-secondary-dark text-xs">
                  Uses Saudi Arabia timezone (Asia/Riyadh).
                </p>
                <Controller
                  control={control}
                  name="period"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="border-gray-200 bg-gray-50">
                        <SelectValue>
                          {formatSaudiMonthYear(new Date(field.value))}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Score sections */}
            {SECTIONS.map(({ title, fields }) => (
              <div
                key={title}
                className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
                {fields.map(({ name, label }) => (
                  <Controller
                    key={name}
                    control={control}
                    name={name as keyof CreateAppraisalFormValues}
                    render={({ field }) => {
                      const val = (field.value as number) ?? 0;
                      return (
                        <div className="flex flex-wrap items-center gap-x-3">
                          <span className="w-full shrink-0 text-sm text-gray-700">
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
                            className="appraisal-slider flex-1 cursor-pointer"
                            style={{
                              background: `linear-gradient(to right,#3b82f6 ${val}%,#e5e7eb ${val}%)`,
                            }}
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
                            className="w-16 text-center text-sm font-semibold text-blue-600"
                          />
                        </div>
                      );
                    }}
                  />
                ))}
              </div>
            ))}

            {/* Overall */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">
                  Overall Performance Score
                </span>
                <div className="flex items-center gap-2">
                  <span
                    ref={scoreTextRef}
                    className="text-xl font-bold text-blue-600"
                  >
                    {DEFAULT_SCORE}%
                  </span>
                  <span
                    ref={badgeRef}
                    className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700"
                  >
                    Good
                  </span>
                </div>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  ref={barRef}
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${DEFAULT_SCORE}%` }}
                />
              </div>
            </div>

            {/* Feedback */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Feedback Comments{" "}
                <span className="text-gray-400">(optional)</span>
              </label>
              <Textarea
                {...register("feedbackComments")}
                placeholder="Add any additional feedback or comments..."
                className="min-h-25 resize-none border-gray-200 bg-gray-50"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                className="border-gray-300"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-gold hover:bg-gold/90 text-white"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Submit Appraisal
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
