"use client";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Award,
  CalendarCheck2,
  Calendar as CalendarIcon,
  Check,
  CircleCheck,
  CheckCircle2,
  CircleX,
  MessageSquareText,
  Pencil,
  Plus,
  RotateCcw,
  LoaderCircle,
  Meh,
  Minus,
  Smile,
  Square,
  Star,
  ThumbsUp,
  Trash2,
  TrendingUp,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  coachingReviewSchema,
  type CoachingReviewFormValues,
} from "../../lib/schemas";
import { createCoachingReportAction } from "../../api/create";
import {
  getSupervisorTeamAction,
  getManagerTeamAction,
} from "@/features/team/api";
import { getDoctorsAction } from "@/features/doctors/api";
import { toast } from "@/lib/utils/toast";
import { cn } from "@/lib/utils";
import type { User } from "@/features/team/lib/types";
import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import { VisitLocationField } from "./VisitLocationField";

type ReviewSectionId = "visit" | "performance" | "assessment" | "coaching";

const reviewSections: {
  id: ReviewSectionId;
  number: string;
  label: string;
  subtitle: string;
  icon: typeof CalendarCheck2;
}[] = [
  {
    id: "visit",
    number: "01",
    label: "Visit Info",
    subtitle: "Basic details",
    icon: CalendarCheck2,
  },
  {
    id: "performance",
    number: "02",
    label: "Performance",
    subtitle: "Rate the visit",
    icon: Star,
  },
  {
    id: "assessment",
    number: "03",
    label: "Assessment",
    subtitle: "Pros & cons",
    icon: ThumbsUp,
  },
  {
    id: "coaching",
    number: "04",
    label: "Coaching Plan",
    subtitle: "Actions & next steps",
    icon: TrendingUp,
  },
];

const ratingOptions = [
  { value: 1, label: "Poor", tone: "poor", icon: CircleX },
  { value: 2, label: "Fair", tone: "fair", icon: Meh },
  { value: 3, label: "Good", tone: "good", icon: Minus },
  { value: 4, label: "Very Good", tone: "very-good", icon: Smile },
  { value: 5, label: "Excellent", tone: "excellent", icon: Award },
];

function countPoints(value: string): number {
  return splitPoints(value).length;
}

function PointHelper({
  value,
  hint = "One point per line",
}: {
  value: string;
  hint?: string;
}) {
  const count = countPoints(value);
  return (
    <div className="mt-1.5 flex items-center justify-between gap-2">
      <p className="coaching-textarea-helper text-gp-text-placeholder text-xs font-medium">
        {hint}
      </p>
      <span
        key={count}
        className="coaching-point-count coaching-count-refresh text-gp-text-secondary bg-gp-surface-subtle border-gp-border-subtle inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] leading-4 font-semibold"
      >
        {count} {count === 1 ? "point" : "points"}
      </span>
    </div>
  );
}

type PointComposerTone = "positive" | "improvement" | "coaching" | "action";

type DeletedPoint = {
  index: number;
  point: string;
} | null;

function splitPoints(value = ""): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function joinPoints(points: string[]): string {
  return points.map((point) => point.trim()).filter(Boolean).join("\n");
}

function getCountLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function PointComposer({
  value,
  onChange,
  onBlur,
  ariaLabel,
  addPlaceholder,
  quickAdds,
  emptyText,
  countSingular,
  countPlural,
  tone,
  icon: Icon,
  showNumbers = false,
  disabled = false,
}: {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  ariaLabel: string;
  addPlaceholder: string;
  quickAdds: string[];
  emptyText: string;
  countSingular: string;
  countPlural: string;
  tone: PointComposerTone;
  icon: typeof CheckCircle2;
  showNumbers?: boolean;
  disabled?: boolean;
}) {
  const inputId = useId();
  const points = splitPoints(value);
  const [draft, setDraft] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [deletedPoint, setDeletedPoint] = useState<DeletedPoint>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const editInputRef = useRef<HTMLInputElement | null>(null);

  const addPoint = (rawPoint = draft) => {
    const point = rawPoint.trim();
    if (!point || disabled) return;

    if (points.includes(point)) {
      setDraft("");
      setLiveMessage("That point is already listed.");
      window.requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    onChange(joinPoints([...points, point]));
    setDraft("");
    setDeletedPoint(null);
    setLiveMessage(`Added ${point}.`);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const deletePoint = (index: number) => {
    const point = points[index];
    if (!point || disabled) return;

    const nextPoints = points.filter((_, pointIndex) => pointIndex !== index);
    onChange(joinPoints(nextPoints));
    setDeletedPoint({ index, point });
    setLiveMessage(`Deleted ${point}.`);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const undoDelete = () => {
    if (!deletedPoint || disabled) return;

    const nextPoints = [...points];
    if (!nextPoints.includes(deletedPoint.point)) {
      nextPoints.splice(
        Math.min(deletedPoint.index, nextPoints.length),
        0,
        deletedPoint.point,
      );
      onChange(joinPoints(nextPoints));
      setLiveMessage(`Restored ${deletedPoint.point}.`);
    }
    setDeletedPoint(null);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingDraft(points[index] ?? "");
    window.requestAnimationFrame(() => editInputRef.current?.focus());
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingDraft("");
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const saveEdit = (index: number) => {
    const nextPoint = editingDraft.trim();
    if (!nextPoint || disabled) return;

    const duplicate = points.some(
      (point, pointIndex) => pointIndex !== index && point === nextPoint,
    );

    if (duplicate) {
      setLiveMessage("That point is already listed.");
      return;
    }

    const nextPoints = [...points];
    nextPoints[index] = nextPoint;
    onChange(joinPoints(nextPoints));
    setEditingIndex(null);
    setEditingDraft("");
    setDeletedPoint(null);
    setLiveMessage(`Updated ${nextPoint}.`);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleDraftKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addPoint();
  };

  const handleEditKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveEdit(index);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  };

  return (
    <div className="coaching-point-composer" data-tone={tone}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id={inputId}
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleDraftKeyDown}
          onBlur={onBlur}
          disabled={disabled}
          aria-label={ariaLabel}
          className="coaching-point-input border-gp-border-control bg-gp-surface-control text-gp-navy-900 placeholder:text-gp-text-placeholder hover:border-gp-gold-300 focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/15 h-11 rounded-[10px] px-3.5 text-sm font-medium shadow-none"
          placeholder={addPlaceholder}
        />
        <Button
          type="button"
          onClick={() => addPoint()}
          disabled={disabled || !draft.trim()}
          className="coaching-point-add bg-gp-navy-900 hover:bg-gp-navy-850 focus-visible:ring-gp-gold-500/25 h-11 shrink-0 rounded-[10px] px-3.5 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(16,29,54,0.14)] focus-visible:ring-3 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-20"
        >
          <Plus className="text-gp-gold-500 size-4" aria-hidden="true" />
          Add
        </Button>
      </div>

      <div className="mt-3">
        <p className="text-gp-text-muted text-[11px] leading-4 font-semibold">
          Quick Add:
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {quickAdds.map((point) => (
            <button
              key={point}
              type="button"
              onClick={() => addPoint(point)}
              disabled={disabled || points.includes(point)}
              className="coaching-quick-chip border-gp-border-control bg-gp-surface-card text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-surface-hover focus-visible:ring-gp-gold-500/20 inline-flex min-h-7 cursor-pointer items-center rounded-[8px] border px-2.5 py-1 text-xs leading-4 font-semibold transition-[background-color,border-color,color,box-shadow] duration-[150ms] focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45"
            >
              {point}
            </button>
          ))}
        </div>
      </div>

      <div className="coaching-point-list mt-3 space-y-2">
        {points.length === 0 ? (
          <p className="coaching-point-empty border-gp-border-subtle bg-gp-surface-subtle text-gp-text-muted rounded-[10px] border border-dashed px-3 py-2.5 text-sm leading-5 font-medium">
            {emptyText}
          </p>
        ) : (
          points.map((point, index) => (
            <div
              key={`${point}-${index}`}
              className="coaching-point-row group/point border-gp-border-default bg-gp-surface-card flex min-h-12 items-center gap-3 rounded-[10px] border px-3 py-2"
            >
              {showNumbers ? (
                <span className="coaching-point-number border-gp-border-control bg-gp-surface-subtle text-gp-navy-900 flex size-8 shrink-0 items-center justify-center rounded-[8px] border text-[11px] font-bold">
                  {String(index + 1).padStart(2, "0")}
                </span>
              ) : (
                <span className="coaching-point-icon flex size-8 shrink-0 items-center justify-center rounded-[8px] border">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              )}

              {editingIndex === index ? (
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    ref={editInputRef}
                    value={editingDraft}
                    onChange={(event) => setEditingDraft(event.target.value)}
                    onKeyDown={(event) => handleEditKeyDown(event, index)}
                    onBlur={onBlur}
                    aria-label={`Edit ${ariaLabel}`}
                    className="coaching-point-edit border-gp-border-control bg-gp-surface-control text-gp-navy-900 focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/15 h-9 rounded-[9px] text-sm shadow-none"
                  />
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      size="icon-sm"
                      onClick={() => saveEdit(index)}
                      className="coaching-point-action text-gp-success hover:bg-gp-success-soft focus-visible:ring-gp-success/20 size-8 rounded-[8px] bg-transparent shadow-none focus-visible:ring-2 focus-visible:outline-none"
                      aria-label={`Save point ${index + 1}`}
                    >
                      <Check className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      onClick={cancelEditing}
                      className="coaching-point-action text-gp-text-muted hover:bg-gp-surface-hover hover:text-gp-navy-900 focus-visible:ring-gp-gold-500/20 size-8 rounded-[8px] bg-transparent shadow-none focus-visible:ring-2 focus-visible:outline-none"
                      aria-label={`Cancel editing point ${index + 1}`}
                    >
                      <X className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gp-navy-900 min-w-0 flex-1 text-sm leading-5 font-medium break-words">
                    {point}
                  </p>
                  <div className="coaching-point-actions flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover/point:opacity-100 sm:group-focus-within/point:opacity-100">
                    <Button
                      type="button"
                      size="icon-sm"
                      onClick={() => startEditing(index)}
                      disabled={disabled}
                      className="coaching-point-action text-gp-text-muted hover:bg-gp-surface-hover hover:text-gp-navy-900 focus-visible:ring-gp-gold-500/20 size-8 rounded-[8px] bg-transparent shadow-none focus-visible:ring-2 focus-visible:outline-none"
                      aria-label={`Edit point ${index + 1}`}
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      onClick={() => deletePoint(index)}
                      disabled={disabled}
                      className="coaching-point-action text-gp-text-muted hover:bg-gp-danger-soft hover:text-gp-danger focus-visible:ring-gp-danger/20 size-8 rounded-[8px] bg-transparent shadow-none focus-visible:ring-2 focus-visible:outline-none"
                      aria-label={`Delete point ${index + 1}`}
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span
          key={points.length}
          className="coaching-point-count coaching-count-refresh text-gp-text-secondary bg-gp-surface-subtle border-gp-border-subtle inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] leading-4 font-semibold"
        >
          {getCountLabel(points.length, countSingular, countPlural)}
        </span>

        {deletedPoint ? (
          <button
            type="button"
            onClick={undoDelete}
            disabled={disabled}
            className="coaching-point-undo text-gp-navy-900 hover:bg-gp-gold-50 focus-visible:ring-gp-gold-500/20 inline-flex min-h-7 items-center gap-1.5 rounded-[8px] px-2 text-xs font-semibold transition-[background-color,color,box-shadow] duration-[150ms] focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="text-gp-gold-600 size-3.5" aria-hidden="true" />
            Undo
          </button>
        ) : null}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </p>
    </div>
  );
}

const selectTriggerClassName =
  "coaching-select-trigger h-11 w-full rounded-[10px] border-gp-border-control bg-gp-surface-control text-gp-navy-900 shadow-none data-[placeholder]:text-gp-text-placeholder hover:border-gp-gold-300 focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/15 [&_svg]:text-gp-text-muted";

const textareaClassName =
  "coaching-textarea min-h-28 w-full rounded-[10px] border-gp-border-control bg-gp-surface-control px-3.5 py-2.5 text-sm leading-5 text-gp-navy-900 shadow-none placeholder:text-gp-text-placeholder hover:border-gp-gold-300 focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/15";

const ReviewForm = ({
  pointComposerEnabled = false,
}: {
  pointComposerEnabled?: boolean;
}) => {
  const router = useRouter();
  const { role, user } = useRoleUI();
  const [isPending, startTransition] = useTransition();
  const [reps, setReps] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<DoctorApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const [composerResetKey, setComposerResetKey] = useState(0);
  const [activeSection, setActiveSection] = useState<ReviewSectionId>("visit");
  const activeSectionIndex = reviewSections.findIndex(
    (section) => section.id === activeSection,
  );
  const sectionRefs = useRef<Record<ReviewSectionId, HTMLElement | null>>({
    visit: null,
    performance: null,
    assessment: null,
    coaching: null,
  });
  const ratingRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const form = useForm<CoachingReviewFormValues>({
    resolver: zodResolver(coachingReviewSchema),
    defaultValues: {
      repId: "",
      doctorId: "",
      visitDate: undefined,
      visitDuration: "",
      visitLocation: "",
      performanceRating: 0,
      visitPros: "",
      visitCons: "",
      recommendations: "",
      actionItems: "",
      notes: "",
    },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    if (!saveSucceeded) return;
    const timer = window.setTimeout(() => setSaveSucceeded(false), 1600);
    return () => window.clearTimeout(timer);
  }, [saveSucceeded]);

  // Track which section is currently in view
  useEffect(() => {
    const sections = reviewSections
      .map((section) => sectionRefs.current[section.id])
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as ReviewSectionId);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  function scrollToSection(sectionId: ReviewSectionId) {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    sectionRefs.current[sectionId]?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  const resetReviewForm = () => {
    form.reset();
    setComposerResetKey((key) => key + 1);
  };

  // Fetch reps and doctors on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch team members based on role
        let repsResult;
        if (role === "MANAGER") {
          // Manager fetches medical reps from their team
          repsResult = await getManagerTeamAction("MEDICAL_REP");
          if (repsResult.success && repsResult.medicalReps) {
            setReps(repsResult.medicalReps);
          }
        } else {
          // Supervisor fetches their team
          repsResult = await getSupervisorTeamAction();
          if (repsResult.success && repsResult.members) {
            setReps(repsResult.members);
          }
        }

        // Fetch doctors
        const doctorsResult = await getDoctorsAction();
        if (doctorsResult.success && doctorsResult.data) {
          setDoctors(doctorsResult.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error({ title: "Failed to load reps and doctors" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [role]);

  const onSubmit = (values: CoachingReviewFormValues) => {
    setSaveSucceeded(false);
    startTransition(async () => {
      try {
        const result = await createCoachingReportAction(values);

        if (result.success) {
          toast.success({ title: "Joint visit review submitted successfully" });
          setSaveSucceeded(true);
          resetReviewForm();
          router.refresh();
        } else {
          toast.error({
            title: result.error?.message || "Failed to submit review",
          });
        }
      } catch (error) {
        console.error("Submit error:", error);
        toast.error({ title: "An unexpected error occurred" });
      }
    });
  };

  function handleRatingKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
    onChange: (value: number) => void,
  ) {
    let next = index;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = ratingOptions.length - 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (index - 1 + ratingOptions.length) % ratingOptions.length;
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (index + 1) % ratingOptions.length;
    } else {
      return;
    }
    event.preventDefault();
    onChange(ratingOptions[next].value);
    ratingRefs.current[next]?.focus();
  }

  return (
    <Card className="coaching-review-shell coaching-section-enter border-gp-border-default bg-gp-surface-card shadow-gp-card w-full gap-0 overflow-hidden rounded-[16px] border py-0">
      {/* Shell header */}
      <header className="coaching-review-header border-gp-border-subtle flex flex-col gap-3 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <h2 className="text-gp-navy-900 text-lg leading-6 font-semibold">
            Joint Visit Review
          </h2>
          <p className="text-gp-text-muted mt-0.5 text-sm leading-5 font-medium">
            Capture visit context, performance and coaching feedback.
          </p>
        </div>
        <span className="coaching-draft-badge coaching-status-badge text-gp-warning border-gp-warning-border bg-gp-warning-soft inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs leading-4 font-semibold">
          <span
            className="coaching-status-badge-dot bg-gp-warning size-1.5 rounded-full"
            aria-hidden="true"
          />
          Draft
        </span>
      </header>

      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Section navigator */}
            <nav
              aria-label="Review sections"
              className="coaching-nav-tabs border-gp-border-subtle bg-gp-surface-card overflow-x-auto border-b"
            >
              <div className="coaching-workflow-grid relative grid min-w-[680px] grid-cols-4 gap-2 p-2 sm:min-w-0">
                <span
                  className="coaching-workflow-indicator pointer-events-none absolute bottom-0 left-0 w-1/4 px-3"
                  style={{
                    transform: `translateX(${activeSectionIndex * 100}%)`,
                  }}
                  aria-hidden="true"
                >
                  <span className="bg-gp-gold-500 block h-0.5 rounded-full" />
                </span>

                {reviewSections.map((section) => {
                  const Icon = section.icon;
                  const active = activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      data-active={active}
                      aria-current={active ? "step" : undefined}
                      aria-controls={section.id}
                      className={cn(
                        "coaching-nav-tab focus-visible:ring-gp-gold-500/25 relative z-10 flex min-h-[74px] cursor-pointer items-center gap-3 rounded-[12px] border px-3 py-2.5 text-left transition-[background-color,border-color,color,box-shadow,transform] duration-[220ms] focus-visible:ring-3 focus-visible:outline-none",
                        active
                          ? "border-gp-navy-900 bg-gp-navy-900 -translate-y-px text-white shadow-[0_6px_16px_rgba(16,29,54,0.14)]"
                          : "border-gp-border-subtle text-gp-navy-900 hover:bg-gp-navy-900/5 bg-white",
                      )}
                    >
                      <span
                        className={cn(
                          "coaching-workflow-icon flex size-9 shrink-0 items-center justify-center rounded-[10px] border",
                          active
                            ? "text-gp-gold-500 border-white/10 bg-white/10"
                            : "border-gp-border-control bg-gp-surface-control text-gp-text-muted",
                        )}
                      >
                        <Icon className="size-[17px]" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span
                          className={cn(
                            "coaching-workflow-number block text-[10px] leading-3 font-bold tracking-[0.08em]",
                            active
                              ? "text-gp-gold-500"
                              : "text-gp-text-placeholder",
                          )}
                        >
                          {section.number}
                        </span>
                        <span className="mt-0.5 block text-sm leading-4 font-semibold">
                          {section.label}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 block truncate text-[11px] leading-4 font-medium",
                            active ? "text-white/65" : "text-gp-text-muted",
                          )}
                        >
                          {section.subtitle}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="space-y-9 px-5 py-6 sm:px-6">
              {/* 01 Visit Information */}
              <section
                id="visit"
                ref={(element) => {
                  sectionRefs.current.visit = element;
                }}
                aria-labelledby="visit-heading"
                data-active={activeSection === "visit"}
                className="coaching-section"
              >
                <div className="flex items-center gap-2.5">
                  <span className="coaching-section-head-icon text-gp-gold-700 border-gp-gold-300 bg-gp-gold-50 flex size-9 items-center justify-center rounded-[10px] border">
                    <CalendarCheck2
                      className="size-[18px]"
                      aria-hidden="true"
                    />
                  </span>
                  <div>
                    <h3
                      id="visit-heading"
                      className="text-gp-navy-900 text-[15px] leading-5 font-semibold"
                    >
                      Visit Information
                    </h3>
                    <p className="text-gp-text-muted text-xs leading-4 font-medium">
                      Context for the coaching session.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Medical Rep */}
                  <FormField
                    control={form.control}
                    name="repId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gp-navy-900 text-[13px] leading-[18px] font-semibold">
                          Medical Representative *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loading}
                        >
                          <FormControl>
                            <SelectTrigger className={selectTriggerClassName}>
                              <SelectValue placeholder="Select rep" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="coaching-select-content border-gp-border-default shadow-gp-popover rounded-[10px] bg-white">
                            {reps.map((rep) => (
                              <SelectItem key={rep.id} value={rep.id}>
                                {rep.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-gp-danger text-[13px]" />
                      </FormItem>
                    )}
                  />

                  {/* Doctor Name */}
                  <FormField
                    control={form.control}
                    name="doctorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gp-navy-900 text-[13px] leading-[18px] font-semibold">
                          Doctor Name *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loading}
                        >
                          <FormControl>
                            <SelectTrigger className={selectTriggerClassName}>
                              <SelectValue placeholder="Select doctor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="coaching-select-content border-gp-border-default shadow-gp-popover rounded-[10px] bg-white">
                            {doctors.map((doctor) => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                {doctor.nameAR} - {doctor.nameEN} -{" "}
                                {doctor.subRegion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-gp-danger text-[13px]" />
                      </FormItem>
                    )}
                  />

                  {/* Visit Date */}
                  <FormField
                    control={form.control}
                    name="visitDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gp-navy-900 text-[13px] leading-[18px] font-semibold">
                          Visit Date *
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                className="coaching-control border-gp-border-control bg-gp-surface-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-surface-hover focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/15 h-11 w-full justify-start gap-2 rounded-[10px] px-3 text-sm font-medium shadow-none"
                              >
                                <CalendarIcon
                                  className="text-gp-text-muted size-4"
                                  aria-hidden="true"
                                />
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span className="text-gp-text-placeholder">
                                    Select date
                                  </span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-gp-danger text-[13px]" />
                      </FormItem>
                    )}
                  />

                  {/* Visit Duration */}
                  <FormField
                    control={form.control}
                    name="visitDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gp-navy-900 text-[13px] leading-[18px] font-semibold">
                          Visit Duration *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className={selectTriggerClassName}>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="coaching-select-content border-gp-border-default shadow-gp-popover rounded-[10px] bg-white">
                            <SelectItem value="15 min">15 minutes</SelectItem>
                            <SelectItem value="30 min">30 minutes</SelectItem>
                            <SelectItem value="45 min">45 minutes</SelectItem>
                            <SelectItem value="60 min">60 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-gp-danger text-[13px]" />
                      </FormItem>
                    )}
                  />

                  {/* Location full width */}
                  <div className="col-span-1 md:col-span-2">
                    <FormField
                      control={form.control}
                      name="visitLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gp-navy-900 text-[13px] leading-[18px] font-semibold">
                            Visit Location *
                          </FormLabel>
                          <FormControl>
                            <VisitLocationField
                              ref={field.ref}
                              name={field.name}
                              value={field.value}
                              userId={user.id}
                              disabled={isPending}
                              onValueChange={field.onChange}
                              onBlur={field.onBlur}
                            />
                          </FormControl>
                          <FormMessage className="text-gp-danger text-[13px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </section>

              {/* 02 Performance */}
              <section
                id="performance"
                ref={(element) => {
                  sectionRefs.current.performance = element;
                }}
                aria-labelledby="performance-heading"
                data-active={activeSection === "performance"}
                className="coaching-section"
              >
                <div className="flex items-center gap-2.5">
                  <span className="coaching-section-head-icon text-gp-gold-700 border-gp-gold-300 bg-gp-gold-50 flex size-9 items-center justify-center rounded-[10px] border">
                    <Star className="size-[18px]" aria-hidden="true" />
                  </span>
                  <div>
                    <h3
                      id="performance-heading"
                      className="text-gp-navy-900 text-[15px] leading-5 font-semibold"
                    >
                      Performance
                    </h3>
                    <p className="text-gp-text-muted text-xs leading-4 font-medium">
                      Rate the overall performance of the reported visit.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="performanceRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gp-navy-900 text-[13px] leading-[18px] font-semibold">
                          Overall Performance *
                        </FormLabel>
                        <FormControl>
                          <div
                            role="radiogroup"
                            aria-label="Overall performance rating"
                            className="border-gp-border-control bg-gp-surface-control rounded-[14px] border p-2.5"
                          >
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                              {ratingOptions.map((option, index) => {
                                const isChecked = field.value === option.value;
                                const RatingIcon = option.icon;
                                return (
                                  <button
                                    key={option.value}
                                    ref={(element) => {
                                      ratingRefs.current[index] = element;
                                    }}
                                    type="button"
                                    role="radio"
                                    data-rating-tone={option.tone}
                                    data-selected={isChecked || undefined}
                                    aria-checked={isChecked}
                                    aria-label={`${option.value} - ${option.label}`}
                                    tabIndex={
                                      isChecked ||
                                      (field.value === 0 && index === 0)
                                        ? 0
                                        : -1
                                    }
                                    onClick={() => field.onChange(option.value)}
                                    onKeyDown={(event) =>
                                      handleRatingKeyDown(
                                        event,
                                        index,
                                        field.onChange,
                                      )
                                    }
                                    className={cn(
                                      "coaching-rating-option focus-visible:ring-gp-gold-500/25 relative flex min-h-[82px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[10px] border px-2 py-2 text-center focus-visible:ring-3 focus-visible:outline-none",
                                      isChecked
                                        ? "is-selected text-gp-navy-900"
                                        : "border-gp-border-subtle text-gp-text-muted bg-white",
                                    )}
                                  >
                                    <RatingIcon
                                      className="coaching-rating-icon size-[18px]"
                                      aria-hidden="true"
                                    />
                                    <span className="text-gp-navy-900 text-base leading-4 font-bold">
                                      {option.value}
                                    </span>
                                    <span className="text-[11px] leading-3 font-semibold">
                                      {option.label}
                                    </span>
                                    {isChecked && (
                                      <span className="coaching-rating-check absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full border bg-white">
                                        <Check
                                          className="size-2.5"
                                          aria-hidden="true"
                                        />
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            <div
                              className="coaching-rating-progress mt-3 grid grid-cols-5 gap-1.5"
                              aria-hidden="true"
                            >
                              {ratingOptions.map((option) => (
                                <span
                                  key={option.value}
                                  className="bg-gp-border-subtle h-1.5 overflow-hidden rounded-full"
                                >
                                  <span
                                    data-rating-tone={option.tone}
                                    data-filled={
                                      option.value <= field.value || undefined
                                    }
                                    className="coaching-rating-segment block h-full w-full rounded-full"
                                  />
                                </span>
                              ))}
                            </div>
                            <div className="mt-1.5 flex items-center justify-between gap-3 text-[10px] leading-4 font-semibold">
                              <span className="text-gp-danger">Poor</span>
                              <span
                                className="text-gp-navy-900"
                                role="status"
                                aria-live="polite"
                              >
                                {field.value
                                  ? ratingOptions[field.value - 1].label
                                  : "Select a rating"}
                              </span>
                              <span className="text-gp-success">Excellent</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-gp-danger text-[13px]" />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* 03 Assessment */}
              <section
                id="assessment"
                ref={(element) => {
                  sectionRefs.current.assessment = element;
                }}
                aria-labelledby="assessment-heading"
                data-active={activeSection === "assessment"}
                className="coaching-section"
              >
                <div className="flex items-center gap-2.5">
                  <span className="coaching-section-head-icon text-gp-gold-700 border-gp-gold-300 bg-gp-gold-50 flex size-9 items-center justify-center rounded-[10px] border">
                    <ThumbsUp className="size-[18px]" aria-hidden="true" />
                  </span>
                  <div>
                    <h3
                      id="assessment-heading"
                      className="text-gp-navy-900 text-[15px] leading-5 font-semibold"
                    >
                      Visit Assessment
                    </h3>
                    <p className="text-gp-text-muted text-xs leading-4 font-medium">
                      Balance what worked well with what can improve.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {/* Pros */}
                  <div className="coaching-assessment-panel coaching-assessment-positive coaching-card-panel border-gp-border-default bg-gp-surface-card relative overflow-hidden rounded-[14px] border p-4 sm:p-5">
                    <span
                      className="coaching-panel-rail bg-gp-success absolute top-3 bottom-3 left-0 w-[3px]"
                      aria-hidden="true"
                    />
                    <div className="flex items-start gap-3">
                      <span className="coaching-panel-icon text-gp-success border-gp-success-border bg-gp-success-soft flex size-9 shrink-0 items-center justify-center rounded-[9px] border">
                        <CheckCircle2 className="size-4" aria-hidden="true" />
                      </span>
                      <div>
                        <h4 className="text-gp-navy-900 text-xs font-bold tracking-[0.05em] uppercase">
                          What Went Well
                        </h4>
                        <p className="text-gp-text-muted mt-0.5 text-xs leading-4 font-medium">
                          Positive observations
                        </p>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="visitPros"
                      render={({ field }) => (
                        <FormItem className="coaching-textarea-field mt-3">
                          {pointComposerEnabled ? (
                            <PointComposer
                              key={`visit-pros-${composerResetKey}`}
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              disabled={isPending}
                              ariaLabel="Add a positive observation"
                              addPlaceholder="Add a positive observation..."
                              quickAdds={[
                                "Good engagement",
                                "Product knowledge",
                                "Clear explanation",
                                "Strong relationship",
                                "Good objection handling",
                              ]}
                              emptyText="No observations added yet."
                              countSingular="observation"
                              countPlural="observations"
                              tone="positive"
                              icon={CheckCircle2}
                            />
                          ) : (
                            <>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  className={textareaClassName}
                                  placeholder="List positive aspects of the visit"
                                />
                              </FormControl>
                              <PointHelper value={field.value} />
                            </>
                          )}
                          <FormMessage className="text-gp-danger text-[13px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Improvements */}
                  <div className="coaching-assessment-panel coaching-assessment-improvement coaching-card-panel border-gp-border-default bg-gp-surface-card relative overflow-hidden rounded-[14px] border p-4 sm:p-5">
                    <span
                      className="coaching-panel-rail bg-gp-warning absolute top-3 bottom-3 left-0 w-[3px]"
                      aria-hidden="true"
                    />
                    <div className="flex items-start gap-3">
                      <span className="coaching-panel-icon text-gp-warning border-gp-warning-border bg-gp-warning-soft flex size-9 shrink-0 items-center justify-center rounded-[9px] border">
                        <TriangleAlert className="size-4" aria-hidden="true" />
                      </span>
                      <div>
                        <h4 className="text-gp-navy-900 text-xs font-bold tracking-[0.05em] uppercase">
                          Areas for Improvement
                        </h4>
                        <p className="text-gp-text-muted mt-0.5 text-xs leading-4 font-medium">
                          Opportunities to improve
                        </p>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="visitCons"
                      render={({ field }) => (
                        <FormItem className="coaching-textarea-field mt-3">
                          {pointComposerEnabled ? (
                            <PointComposer
                              key={`visit-cons-${composerResetKey}`}
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              disabled={isPending}
                              ariaLabel="Add an improvement point"
                              addPlaceholder="Add an improvement point..."
                              quickAdds={[
                                "Handle objections",
                                "Product knowledge",
                                "Visit timing",
                                "Clinical evidence",
                                "Follow-up",
                              ]}
                              emptyText="No improvement points added yet."
                              countSingular="improvement point"
                              countPlural="improvement points"
                              tone="improvement"
                              icon={TriangleAlert}
                            />
                          ) : (
                            <>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  className={textareaClassName}
                                  placeholder="List areas that need improvement"
                                />
                              </FormControl>
                              <PointHelper value={field.value} />
                            </>
                          )}
                          <FormMessage className="text-gp-danger text-[13px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </section>

              {/* 04 Coaching Plan */}
              <section
                id="coaching"
                ref={(element) => {
                  sectionRefs.current.coaching = element;
                }}
                aria-labelledby="coaching-heading"
                data-active={activeSection === "coaching"}
                className="coaching-section"
              >
                <div className="flex items-center gap-2.5">
                  <span className="coaching-section-head-icon text-gp-gold-700 border-gp-gold-300 bg-gp-gold-50 flex size-9 items-center justify-center rounded-[10px] border">
                    <TrendingUp className="size-[18px]" aria-hidden="true" />
                  </span>
                  <div>
                    <h3
                      id="coaching-heading"
                      className="text-gp-navy-900 text-[15px] leading-5 font-semibold"
                    >
                      Coaching Plan
                    </h3>
                    <p className="text-gp-text-muted text-xs leading-4 font-medium">
                      Recommendations, follow-up actions and overall notes.
                    </p>
                  </div>
                </div>

                <div className="coaching-plan-steps relative mt-5 space-y-4 pl-11">
                  <span
                    className="coaching-plan-line border-gp-navy-900/15 pointer-events-none absolute top-4 bottom-6 left-[15px] border-l"
                    aria-hidden="true"
                  />
                  {/* 1 Recommendations */}
                  <FormField
                    control={form.control}
                    name="recommendations"
                    render={({ field }) => (
                      <FormItem className="coaching-plan-step coaching-plan-step-1 coaching-textarea-field border-gp-border-subtle bg-gp-surface-card relative rounded-[12px] border p-4">
                        <span className="coaching-plan-number text-gp-gold-700 border-gp-gold-300 bg-gp-gold-50 absolute top-4 -left-[44px] z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-[11px] leading-none font-bold shadow-[0_0_0_5px_white]">
                          01
                        </span>
                        <div>
                          <FormLabel className="text-gp-navy-900 text-[13px] leading-[18px] font-semibold">
                            Recommendations & Coaching Points *
                          </FormLabel>
                          <p className="text-gp-text-muted mt-0.5 text-xs leading-4 font-medium">
                            Capture specific guidance for the representative.
                          </p>
                        </div>
                        {pointComposerEnabled ? (
                          <PointComposer
                            key={`recommendations-${composerResetKey}`}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={isPending}
                            ariaLabel="Add coaching recommendation"
                            addPlaceholder="Add coaching recommendation..."
                            quickAdds={[
                              "Strengthen objection-handling technique",
                              "Improve product comparison knowledge",
                              "Review clinical evidence",
                              "Practice call opening",
                              "Clarify visit objective",
                            ]}
                            emptyText="No recommendations added yet."
                            countSingular="recommendation"
                            countPlural="recommendations"
                            tone="coaching"
                            icon={MessageSquareText}
                            showNumbers
                          />
                        ) : (
                          <>
                            <FormControl>
                              <Textarea
                                {...field}
                                className={textareaClassName}
                                placeholder="Provide specific recommendations for improvement and coaching guidance..."
                              />
                            </FormControl>
                            <PointHelper value={field.value} />
                          </>
                        )}
                        <FormMessage className="text-gp-danger text-[13px]" />
                      </FormItem>
                    )}
                  />

                  {/* 2 Action Items */}
                  <FormField
                    control={form.control}
                    name="actionItems"
                    render={({ field }) => (
                      <FormItem className="coaching-plan-step coaching-plan-step-2 coaching-action-step coaching-textarea-field border-gp-gold-300 bg-gp-surface-card relative rounded-[12px] border p-4 shadow-[0_4px_16px_rgba(201,164,76,0.08)]">
                        <span className="coaching-plan-number text-gp-gold-700 border-gp-gold-500 bg-gp-gold-50 absolute top-4 -left-[44px] z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-[11px] leading-none font-bold shadow-[0_0_0_5px_white]">
                          02
                        </span>
                        <div className="flex items-start gap-2.5">
                          <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 mt-px flex size-7 shrink-0 items-center justify-center rounded-[8px] border">
                            <CheckCircle2
                              className="size-4"
                              aria-hidden="true"
                            />
                          </span>
                          <div>
                            <FormLabel className="text-gp-navy-900 text-[13px] leading-[18px] font-bold">
                              Action Items & Next Steps *
                            </FormLabel>
                            <p className="text-gp-text-muted mt-0.5 text-xs leading-4 font-medium">
                              Turn the coaching discussion into clear follow-up.
                            </p>
                          </div>
                        </div>
                        {pointComposerEnabled ? (
                          <PointComposer
                            key={`action-items-${composerResetKey}`}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={isPending}
                            ariaLabel="Add next action"
                            addPlaceholder="Add next action..."
                            quickAdds={[
                              "Follow up with Dr. Ahmed next week",
                              "Review objection-handling material",
                              "Practice call opening before next coaching",
                              "Prepare clinical evidence summary",
                              "Confirm next visit timing",
                            ]}
                            emptyText="No action items added yet."
                            countSingular="action item"
                            countPlural="action items"
                            tone="action"
                            icon={Square}
                          />
                        ) : (
                          <>
                            <FormControl>
                              <Textarea
                                {...field}
                                className={textareaClassName}
                                placeholder="e.g.&#10;Follow up with Dr. X next week&#10;Review product objection handling&#10;Practice call opening"
                              />
                            </FormControl>
                            <PointHelper
                              value={field.value}
                              hint="One action per line"
                            />
                          </>
                        )}
                        <FormMessage className="text-gp-danger text-[13px]" />
                      </FormItem>
                    )}
                  />

                  {/* 3 Notes */}
                  <div className="coaching-plan-step coaching-plan-step-3 border-gp-border-subtle bg-gp-surface-subtle relative rounded-[12px] border p-4">
                    <span className="coaching-plan-number text-gp-navy-900 border-gp-border-control bg-gp-surface-control absolute top-4 -left-[44px] z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-[11px] leading-none font-bold shadow-[0_0_0_5px_white]">
                      03
                    </span>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem className="coaching-textarea-field">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <FormLabel className="text-gp-navy-900 text-[13px] leading-[18px] font-semibold">
                                Overall Notes & Observations
                              </FormLabel>
                              <span className="text-gp-text-muted border-gp-border-control bg-gp-surface-card rounded-full border px-2 py-0.5 text-[10px] leading-4 font-semibold">
                                Optional
                              </span>
                            </div>
                            <p className="text-gp-text-muted mt-0.5 text-xs leading-4 font-medium">
                              Add useful context that does not fit the action
                              plan.
                            </p>
                          </div>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="coaching-textarea border-gp-border-control bg-gp-surface-card text-gp-navy-900 placeholder:text-gp-text-placeholder hover:border-gp-gold-300 focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/15 min-h-24 w-full rounded-[10px] px-3.5 py-2.5 text-sm leading-5 shadow-none"
                              placeholder="Additional observations, context, or notes about the visit…"
                            />
                          </FormControl>
                          <FormMessage className="text-gp-danger text-[13px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Sticky actions */}
            <footer className="coaching-sticky-footer bg-gp-surface-card/95 border-gp-border-default sticky bottom-0 z-10 flex flex-col gap-3 border-t px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="min-w-0">
                {isDirty ? (
                  <span className="text-gp-text-muted inline-flex items-center gap-1.5 text-xs font-medium">
                    <span
                      className="bg-gp-warning size-1.5 rounded-full"
                      aria-hidden="true"
                    />
                    Unsaved changes
                  </span>
                ) : (
                  <span className="text-gp-text-placeholder inline-flex items-center gap-1.5 text-xs font-medium">
                    <span
                      className="bg-gp-border-control size-1.5 rounded-full"
                      aria-hidden="true"
                    />
                    No changes yet
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetReviewForm}
                  disabled={isPending}
                  className="coaching-cancel text-gp-navy-900 border-gp-border-default bg-gp-surface-card hover:bg-gp-surface-hover focus-visible:ring-gp-gold-500/15 focus-visible:border-gp-gold-500 h-10 rounded-[10px] border px-4 text-sm font-semibold shadow-none focus-visible:ring-3 focus-visible:outline-none"
                >
                  <X className="size-4" aria-hidden="true" />
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isPending || saveSucceeded}
                  className="coaching-save bg-gp-navy-900 hover:bg-gp-navy-850 focus-visible:ring-gp-gold-500/25 h-11 gap-2 rounded-[12px] border border-transparent px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(16,29,54,0.18)] transition-[background-color,box-shadow,transform,color] duration-[170ms] hover:text-white focus-visible:ring-3 focus-visible:outline-none active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-gp-text-muted disabled:opacity-60"
                >
                  {isPending ? (
                    <LoaderCircle
                      className="text-gp-gold-500 size-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <CircleCheck
                      className={cn(
                        "coaching-save-icon text-gp-gold-500 size-4",
                        saveSucceeded && "coaching-save-success-icon",
                      )}
                      aria-hidden="true"
                    />
                  )}
                  {isPending
                    ? "Saving..."
                    : saveSucceeded
                      ? "Saved"
                      : "Save Review"}
                </Button>
              </div>
            </footer>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
