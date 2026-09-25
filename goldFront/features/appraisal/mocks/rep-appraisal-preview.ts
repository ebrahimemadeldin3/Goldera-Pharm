import type { UserProfile } from "@/features/profile/lib/types";
import type { Review } from "../lib/types";

export const REP_APPRAISAL_PREVIEW_MODE = true;

type RepAppraisalPreviewStats = {
  totalAppraisals: number;
  latestScore: number | null;
  pendingAcknowledgement: number;
  acknowledged: number;
};

function calculateStats(reviews: Review[]): RepAppraisalPreviewStats {
  return {
    totalAppraisals: reviews.length,
    latestScore: reviews[0]?.overallCurrent ?? null,
    pendingAcknowledgement: reviews.filter((review) => !review.acknowledged)
      .length,
    acknowledged: reviews.filter((review) => review.acknowledged).length,
  };
}

export function getRepAppraisalPreviewData(
  rep?: UserProfile | null,
  territoryName?: string | null,
) {
  // UI preview only - remove when Rep appraisal backend integration is ready.
  const previewReview: Review = {
    id: "rep-appraisal-preview-q3-2026",
    name: rep?.name || "Medical Representative",
    initials:
      rep?.name
        ?.split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "MR",
    role: "Medical Rep",
    email: rep?.email || "rep.preview@golderapharm.com",
    department: rep?.department || "Field Sales",
    location: territoryName || rep?.location || undefined,
    period: "Q3 2026",
    statusBadge: "Good",
    lastReview: "Sep 30, 2026",
    overallCurrent: 84,
    overallPrevious: 79,
    repId: rep?.id || "preview-rep",
    managerId: "preview-manager",
    managerName: "Mohamed Abbas",
    acknowledged: false,
    acknowledgedAt: null,
    repComment: null,
    feedbackComments:
      "Strong field execution during Q3 with consistent visit discipline and clear product messaging. Continue improving competitor objection handling and broaden the follow-up plan for priority accounts.",
    kpis: [
      { label: "Presentation Skills", value: 86 },
      { label: "Selling Skills", value: 84 },
      { label: "Reporting", value: 82 },
      { label: "Product Information", value: 88 },
      { label: "Competitors Information", value: 78 },
      { label: "Org. Value & Policy Awareness", value: 85 },
      { label: "Utilization of Resources", value: 83 },
      { label: "Reliability & Credibility", value: 90 },
      { label: "Independence & Judgment", value: 82 },
      { label: "Team Spirit", value: 87 },
      { label: "Personal Drive", value: 86 },
      { label: "Creativity & Initiative", value: 80 },
      { label: "Broad Prospective", value: 81 },
      { label: "Communication Skills", value: 88 },
      { label: "Planning & Organizing", value: 84 },
      { label: "Appearance", value: 90 },
      { label: "Attitude", value: 87 },
      { label: "Timing", value: 72 },
    ],
  };

  return {
    reviews: [previewReview],
    totalCount: 1,
    stats: calculateStats([previewReview]),
  };
}
