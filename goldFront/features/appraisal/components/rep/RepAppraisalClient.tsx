"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Award,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  Gauge,
  MessageSquare,
  SearchX,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/utils/toast";
import { cn } from "@/lib/utils";
import type { Review } from "../../lib/types";
import { acknowledgeAppraisalAction } from "../../api/rep";

type FilterKey = "all" | "pending" | "acknowledged";

type RepAppraisalClientProps = {
  reviews: Review[];
  page?: number;
  limit?: number;
  totalCount?: number;
  stats: {
    totalAppraisals: number;
    latestScore: number | null;
    pendingAcknowledgement: number;
    acknowledged: number;
  };
  backendIntegrationPending?: boolean;
  previewMode?: boolean;
};

type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: "green" | "navy" | "gold";
};

const filterOptions: Array<{ id: FilterKey; label: string }> = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending Acknowledgement" },
  { id: "acknowledged", label: "Acknowledged" },
];

const KPI_GROUPS = [
  {
    title: "Job Related Skills",
    labels: ["Presentation Skills", "Selling Skills", "Reporting"],
  },
  {
    title: "Job Knowledge Skills",
    labels: ["Product Information", "Competitors Information"],
  },
  {
    title: "Organizational Skills",
    labels: ["Org. Value & Policy Awareness", "Utilization of Resources"],
  },
  {
    title: "Interpersonal Skills",
    labels: [
      "Reliability & Credibility",
      "Independence & Judgment",
      "Team Spirit",
      "Personal Drive",
      "Creativity & Initiative",
      "Broad Prospective",
      "Communication Skills",
      "Planning & Organizing",
    ],
  },
  {
    title: "General Factors",
    labels: ["Appearance", "Attitude", "Timing"],
  },
];

function scoreColor(score: number) {
  if (score >= 85) return "#168557";
  if (score >= 70) return "#C9A44C";
  if (score >= 50) return "#F59E0B";
  return "#B42318";
}

function formatAcknowledgedAt(value?: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function groupKpis(review: Review) {
  return KPI_GROUPS.map((group) => ({
    ...group,
    items: review.kpis.filter((kpi) => group.labels.includes(kpi.label)),
  })).filter((group) => group.items.length > 0);
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: MetricCardProps) {
  const toneClass =
    tone === "green"
      ? "border-[#CBEFDD] bg-[#E9F8F1] text-[#168557]"
      : tone === "gold"
        ? "border-[#E9DDB8] bg-[#FFF8E5] text-[#8A6515]"
        : "border-[#D8DEE9] bg-[#F6F8FB] text-[#182033]";

  return (
    <div className="rounded-[14px] border border-[#E5E8EF] bg-white p-4 shadow-none">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-[10px] border",
            toneClass,
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#667085]">{label}</p>
          <p className="mt-1 text-2xl leading-none font-bold text-[#182033]">
            {value}
          </p>
          <p className="mt-1.5 truncate text-xs font-medium text-[#98A2B3]">
            {helper}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ review }: { review: Review }) {
  if (review.acknowledged) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#CBEFDD] bg-[#E9F8F1] px-2.5 py-1 text-xs font-bold text-[#168557]">
        <CheckCircle2 className="size-3.5" aria-hidden="true" />
        Acknowledged
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E9DDB8] bg-[#FFF8E5] px-2.5 py-1 text-xs font-bold text-[#8A6515]">
      <Clock3 className="size-3.5" aria-hidden="true" />
      Pending Acknowledgement
    </span>
  );
}

function AppraisalCard({
  review,
  onOpen,
}: {
  review: Review;
  onOpen: (review: Review) => void;
}) {
  const score = Math.min(100, Math.max(0, review.overallCurrent));

  return (
    <article className="flex flex-col gap-4 rounded-[14px] border border-[#E5E8EF] bg-white p-4 shadow-none transition-colors hover:border-[#CBEFDD] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.08em] text-[#168557] uppercase">
            Performance Appraisal
          </p>
          <h3 className="mt-1 text-lg leading-6 font-bold text-[#182033]">
            {review.period}
          </h3>
          <p className="mt-1 text-sm font-medium text-[#667085]">
            Reviewed by {review.managerName}
          </p>
          <p className="mt-0.5 text-xs font-medium text-[#98A2B3]">
            {review.lastReview}
          </p>
        </div>
        <StatusBadge review={review} />
      </div>

      <div className="rounded-[12px] border border-[#EEF1F6] bg-[#FBFCFE] p-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#667085]">
              Overall Score
            </p>
            <p className="mt-1 text-3xl leading-none font-bold text-[#182033]">
              {score}
              <span className="ml-1 text-sm font-semibold text-[#667085]">
                / 100
              </span>
            </p>
          </div>
          {review.statusBadge && (
            <span className="rounded-full border border-[#CBEFDD] bg-[#E9F8F1] px-2.5 py-1 text-xs font-bold text-[#168557]">
              {review.statusBadge}
            </span>
          )}
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E5E8EF]">
          <div
            className="h-full rounded-full"
            style={{ width: `${score}%`, backgroundColor: scoreColor(score) }}
          />
        </div>
        <p className="mt-2 text-xs font-medium text-[#667085]">
          {review.kpis.length} performance criteria assessed
        </p>
      </div>

      <button
        type="button"
        onClick={() => onOpen(review)}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#168557] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(22,133,87,0.18)] transition-[background-color,transform,box-shadow] duration-[170ms] hover:-translate-y-px hover:bg-[#107349] focus-visible:ring-2 focus-visible:ring-[#168557]/25 focus-visible:outline-none active:translate-y-0 sm:w-fit"
      >
        <FileCheck2 className="size-4" aria-hidden="true" />
        View Appraisal
      </button>
    </article>
  );
}

function AppraisalDetailsDialog({
  review,
  open,
  onOpenChange,
  onAcknowledged,
  previewMode = false,
}: {
  review: Review | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAcknowledged: (review: Review) => void;
  previewMode?: boolean;
}) {
  const [comment, setComment] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!review) return null;

  const score = Math.min(100, Math.max(0, review.overallCurrent));
  const groups = groupKpis(review);
  const acknowledgedAt = formatAcknowledgedAt(review.acknowledgedAt);
  const existingComment = review.repComment?.trim();
  const canAcknowledge = !review.acknowledged;

  function handleConfirmAccept() {
    if (!review || !canAcknowledge || isPending) return;

    startTransition(async () => {
      if (previewMode) {
        // UI preview only - remove when Rep appraisal backend integration is ready.
        onAcknowledged({
          ...review,
          acknowledged: true,
          acknowledgedAt: new Date().toISOString(),
          repComment: comment.trim() || null,
        });
        setConfirmOpen(false);
        toast.success({
          title: "Preview acknowledgement applied",
          description:
            "This visual state is temporary and will reset after refresh.",
        });
        return;
      }

      const result = await acknowledgeAppraisalAction(review.id, comment);

      if (result.success && result.review) {
        onAcknowledged(result.review);
        setConfirmOpen(false);
        toast.success({
          title: "Appraisal acknowledged",
          description: "Your response was submitted with the acknowledgement.",
        });
        return;
      }

      toast.error({
        title: result.backendIntegrationPending
          ? "Backend integration pending"
          : "Unable to acknowledge appraisal",
        description: result.backendIntegrationPending
          ? "The frontend is ready, but the acknowledgement endpoint is not available yet."
          : result.error?.message,
      });
      setConfirmOpen(false);
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="z-[60] flex max-h-[calc(100dvh-16px)] w-[calc(100vw-16px)] max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-[16px] border border-[#E5E8EF] bg-white p-0 shadow-[0_20px_48px_rgba(16,29,54,0.18)] sm:max-h-[calc(100dvh-32px)] sm:w-[min(880px,calc(100vw-32px))]"
        >
          <div className="shrink-0 bg-[#101D36] px-5 py-5 text-white">
            <DialogHeader className="pr-10 text-left">
              <DialogTitle className="text-xl font-semibold text-white">
                Performance Appraisal
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-sm text-[#C8D2E1]">
                {review.period} reviewed by {review.managerName}
              </DialogDescription>
            </DialogHeader>
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Close appraisal details"
                className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-[10px] text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#168557]/40 focus-visible:outline-none"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </DialogClose>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#F6F8FB] p-4 sm:p-5">
            <section className="rounded-[14px] border border-[#E5E8EF] bg-white p-4">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold tracking-[0.08em] text-[#667085] uppercase">
                    Overall Performance
                  </p>
                  <div className="mt-2 flex flex-wrap items-end gap-2">
                    <span className="text-4xl leading-none font-bold text-[#182033]">
                      {score}
                    </span>
                    <span className="pb-1 text-sm font-semibold text-[#667085]">
                      / 100
                    </span>
                    {review.statusBadge && (
                      <span className="mb-1 rounded-full border border-[#CBEFDD] bg-[#E9F8F1] px-2.5 py-1 text-xs font-bold text-[#168557]">
                        {review.statusBadge}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 text-sm sm:min-w-64">
                  <div>
                    <p className="text-xs font-semibold text-[#667085]">
                      Review Date
                    </p>
                    <p className="mt-1 font-semibold text-[#182033]">
                      {review.lastReview}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#667085]">
                      Status
                    </p>
                    <div className="mt-1">
                      <StatusBadge review={review} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[14px] border border-[#E5E8EF] bg-white p-4">
              <div className="mb-4 flex items-center gap-2">
                <Gauge className="size-4 text-[#168557]" aria-hidden="true" />
                <h3 className="text-sm font-bold text-[#182033]">
                  Performance Breakdown
                </h3>
              </div>
              <div className="space-y-4">
                {groups.map((group) => (
                  <div key={group.title}>
                    <p className="mb-2 text-xs font-bold tracking-[0.06em] text-[#667085] uppercase">
                      {group.title}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {group.items.map((kpi) => (
                        <div
                          key={kpi.label}
                          className="rounded-[10px] border border-[#EEF1F6] bg-[#FBFCFE] p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="min-w-0 text-xs font-semibold text-[#344054]">
                              {kpi.label}
                            </span>
                            <span className="shrink-0 text-xs font-bold text-[#182033]">
                              {kpi.value} / 100
                            </span>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E5E8EF]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, Math.max(0, kpi.value))}%`,
                                backgroundColor: scoreColor(kpi.value),
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[14px] border border-[#E5E8EF] bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <MessageSquare
                  className="size-4 text-[#168557]"
                  aria-hidden="true"
                />
                <h3 className="text-sm font-bold text-[#182033]">
                  Manager Feedback
                </h3>
              </div>
              <p className="min-h-20 rounded-[10px] border border-[#EEF1F6] bg-[#FBFCFE] p-3 text-sm leading-6 whitespace-pre-wrap text-[#344054]">
                {review.feedbackComments?.trim() ||
                  "No manager feedback comments were provided."}
              </p>
            </section>

            <section className="rounded-[14px] border border-[#E5E8EF] bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <UserRound
                  className="size-4 text-[#168557]"
                  aria-hidden="true"
                />
                <h3 className="text-sm font-bold text-[#182033]">
                  Your Response
                </h3>
              </div>

              {review.acknowledged ? (
                <div className="rounded-[10px] border border-[#CBEFDD] bg-[#F7FCFA] p-3">
                  <p className="font-semibold text-[#168557]">
                    Acknowledged{acknowledgedAt ? ` on ${acknowledgedAt}` : ""}
                  </p>
                  <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-[#344054]">
                    {existingComment || "No response comment was submitted."}
                  </p>
                </div>
              ) : (
                <>
                  <label
                    htmlFor="rep-appraisal-comment"
                    className="text-xs font-semibold text-[#667085]"
                  >
                    Add a comment about this appraisal
                  </label>
                  <Textarea
                    id="rep-appraisal-comment"
                    maxLength={1000}
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Share your feedback or acknowledgement..."
                    className="mt-2 min-h-28 rounded-[10px] border-[#E5E8EF] bg-[#FBFCFE] text-sm shadow-none focus-visible:border-[#168557] focus-visible:ring-[#168557]/15"
                  />
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-medium text-[#667085]">
                      By accepting, you confirm that you have reviewed this
                      appraisal.
                    </p>
                    <span className="text-xs font-semibold text-[#98A2B3]">
                      {comment.length} / 1000
                    </span>
                  </div>
                </>
              )}
            </section>
          </div>

          <DialogFooter className="border-t border-[#E5E8EF] bg-white px-4 py-3.5 sm:px-5">
            <DialogClose asChild>
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[#E5E8EF] bg-white px-4 text-sm font-semibold text-[#344054] transition-colors hover:bg-[#F9FAFB] focus-visible:ring-2 focus-visible:ring-[#168557]/20 focus-visible:outline-none"
              >
                Close
              </button>
            </DialogClose>
            {canAcknowledge && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirmOpen(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#168557] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(22,133,87,0.18)] transition-colors hover:bg-[#107349] focus-visible:ring-2 focus-visible:ring-[#168557]/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-65"
              >
                <ShieldCheck className="size-4" aria-hidden="true" />
                Accept Appraisal
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-[14px] border border-[#E5E8EF] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#182033]">
              Acknowledge Appraisal?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#667085]">
              You are confirming that you have reviewed this performance
              appraisal. Your comment will be submitted with your
              acknowledgement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[10px] border-[#E5E8EF] text-[#344054]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault();
                handleConfirmAccept();
              }}
              className="rounded-[10px] bg-[#168557] text-white hover:bg-[#107349] focus-visible:ring-[#168557]/25"
            >
              {isPending ? "Submitting..." : "Accept Appraisal"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function RepAppraisalClient({
  reviews: initialReviews,
  page = 1,
  limit = 10,
  totalCount = 0,
  stats,
  backendIntegrationPending = false,
  previewMode = false,
}: RepAppraisalClientProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [reviews, setReviews] = useState(initialReviews);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const counts = useMemo(
    () => ({
      all: reviews.length,
      pending: reviews.filter((review) => !review.acknowledged).length,
      acknowledged: reviews.filter((review) => review.acknowledged).length,
    }),
    [reviews],
  );

  const displayStats = useMemo(
    () => ({
      totalAppraisals: reviews.length || stats.totalAppraisals,
      latestScore: reviews[0]?.overallCurrent ?? stats.latestScore,
      pendingAcknowledgement: reviews.filter((review) => !review.acknowledged)
        .length,
      acknowledged: reviews.filter((review) => review.acknowledged).length,
    }),
    [reviews, stats],
  );

  const visibleReviews = useMemo(() => {
    if (filter === "pending") {
      return reviews.filter((review) => !review.acknowledged);
    }
    if (filter === "acknowledged") {
      return reviews.filter((review) => review.acknowledged);
    }
    return reviews;
  }, [filter, reviews]);

  function handleAcknowledged(updatedReview: Review) {
    setReviews((current) =>
      current.map((review) =>
        review.id === updatedReview.id ? updatedReview : review,
      ),
    );
    setSelectedReview(updatedReview);
  }

  const emptyTitle = backendIntegrationPending
    ? "Backend integration pending"
    : filter === "all"
      ? "No appraisals yet"
      : "No appraisals found";
  const emptyDescription = backendIntegrationPending
    ? "The Medical Rep appraisal page is ready, but the rep retrieval endpoint is not available yet."
    : filter === "all"
      ? "Your performance appraisals will appear here after they are shared by your manager."
      : "Try another acknowledgement filter.";

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.08em] text-[#168557] uppercase">
          <span className="inline-block h-px w-6 bg-[#168557]" />
          Management / Appraisal
        </p>
        <h1 className="mt-2 text-[26px] leading-tight font-semibold text-[#182033] sm:text-[30px]">
          Performance Appraisals
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 font-medium text-[#667085]">
          Review your performance evaluations, feedback, and development
          recommendations.
        </p>
      </header>

      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        aria-label="Appraisal summary"
      >
        <MetricCard
          label="Total Appraisals"
          value={String(displayStats.totalAppraisals)}
          helper="Shared with you"
          icon={ClipboardCheck}
          tone="green"
        />
        <MetricCard
          label="Latest Score"
          value={
            displayStats.latestScore === null
              ? "-"
              : `${displayStats.latestScore}%`
          }
          helper="Most recent appraisal"
          icon={Award}
          tone="navy"
        />
        <MetricCard
          label="Pending Acknowledgement"
          value={String(displayStats.pendingAcknowledgement)}
          helper={`${displayStats.acknowledged} acknowledged`}
          icon={Clock3}
          tone="gold"
        />
      </section>

      <section className="overflow-hidden rounded-[14px] border border-[#E5E8EF] bg-white">
        <div className="border-b border-[#EEF1F6] p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#182033]">
                My Appraisals
              </h2>
              <p className="mt-1 text-sm font-medium text-[#667085]">
                {visibleReviews.length} of {reviews.length} shown
              </p>
            </div>
            <div
              role="tablist"
              aria-label="Filter appraisals"
              className="flex w-full flex-wrap items-center gap-1 rounded-[12px] border border-[#E5E8EF] bg-[#F6F8FB] p-1 sm:w-fit"
            >
              {filterOptions.map((option) => {
                const isActive = filter === option.id;
                const count = counts[option.id];

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setFilter(option.id)}
                    className={cn(
                      "inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-[9px] px-3 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#168557]/25 focus-visible:outline-none sm:flex-none",
                      isActive
                        ? "border border-[#CBEFDD] bg-[#E9F8F1] text-[#168557]"
                        : "border border-transparent bg-white text-[#667085] hover:text-[#182033]",
                    )}
                  >
                    <span>{option.label}</span>
                    <span
                      className={cn(
                        "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                        isActive
                          ? "bg-[#168557] text-white"
                          : "bg-[#F6F8FB] text-[#344054]",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {visibleReviews.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-[#DDE3EE] bg-[#FBFCFE] px-5 py-10 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-[12px] bg-[#E9F8F1] text-[#168557]">
                {backendIntegrationPending ? (
                  <ShieldCheck className="size-5" aria-hidden="true" />
                ) : (
                  <SearchX className="size-5" aria-hidden="true" />
                )}
              </span>
              <h3 className="mt-4 text-base font-bold text-[#182033]">
                {emptyTitle}
              </h3>
              <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 font-medium text-[#667085]">
                {emptyDescription}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {visibleReviews.map((review) => (
                <AppraisalCard
                  key={review.id}
                  review={review}
                  onOpen={setSelectedReview}
                />
              ))}
            </div>
          )}
        </div>

        <TablePaginationFooter
          page={page}
          limit={limit}
          totalCount={totalCount}
          itemLabel="appraisals"
          ariaLabel="Appraisals pagination"
          pageNavAriaLabel="Appraisal pages"
        />
      </section>

      <AppraisalDetailsDialog
        review={selectedReview}
        open={Boolean(selectedReview)}
        onOpenChange={(open) => {
          if (!open) setSelectedReview(null);
        }}
        onAcknowledged={handleAcknowledged}
        previewMode={previewMode}
      />
    </div>
  );
}
