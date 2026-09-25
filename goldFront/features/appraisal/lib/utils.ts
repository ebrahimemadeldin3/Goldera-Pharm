import {
  formatSaudiDateDisplay,
  getInitials,
  getSaudiDateParts,
  parseDateValue,
} from "@/lib/utils";
import type { Review, AppraisalApiResponse } from "./types";

export function mapAppraisalToReview(appraisal: AppraisalApiResponse): Review {
  const scores = [
    appraisal.presentationSkills,
    appraisal.sellingSkills,
    appraisal.reporting,
    appraisal.productInformation,
    appraisal.competitorsInformation,
    appraisal.organizationalValueAwareness,
    appraisal.properUtilizationOfResources,
    appraisal.reliabilityAndCredibility,
    appraisal.independenceAndJudgment,
    appraisal.teamSpirit,
    appraisal.personalDrive,
    appraisal.creativityAndInitiative,
    appraisal.broadProspective,
    appraisal.communicationSkills,
    appraisal.planningAndOrganizing,
    appraisal.appearance,
    appraisal.attitude,
    appraisal.timing,
  ];
  const overallCurrent = Math.round(
    scores.reduce((acc, score) => acc + (score ?? 0), 0) / scores.length,
  );

  let statusBadge: "Excellent" | "Good" | "Improving" | undefined;
  if (overallCurrent >= 90) statusBadge = "Excellent";
  else if (overallCurrent >= 70) statusBadge = "Good";
  else statusBadge = "Improving";

  const periodDate = parseDateValue(appraisal.period);
  const { year, month } = getSaudiDateParts(periodDate);
  const quarter = `Q${Math.ceil(Number(month) / 3)}`;

  return {
    id: appraisal.id,
    repId: appraisal.repId,
    managerId: appraisal.managerId,
    name: appraisal.rep?.name || "Unknown",
    initials: getInitials(appraisal.rep?.name || "Unknown"),
    role: appraisal.rep?.role === "SUPERVISOR" ? "Supervisor" : "Medical Rep",
    email: appraisal.rep?.email || "N/A",
    department: appraisal.rep?.department || undefined,
    location: appraisal.rep?.location || undefined,
    period: `${quarter} ${year}`,
    statusBadge,
    lastReview: formatSaudiDateDisplay(new Date(appraisal.createdAt)),
    overallCurrent,
    kpis: [
      {
        label: "Presentation Skills",
        value: appraisal.presentationSkills ?? 0,
      },
      { label: "Selling Skills", value: appraisal.sellingSkills ?? 0 },
      { label: "Reporting", value: appraisal.reporting ?? 0 },
      {
        label: "Product Information",
        value: appraisal.productInformation ?? 0,
      },
      {
        label: "Competitors Information",
        value: appraisal.competitorsInformation ?? 0,
      },
      {
        label: "Org. Value & Policy Awareness",
        value: appraisal.organizationalValueAwareness ?? 0,
      },
      {
        label: "Utilization of Resources",
        value: appraisal.properUtilizationOfResources ?? 0,
      },
      {
        label: "Reliability & Credibility",
        value: appraisal.reliabilityAndCredibility ?? 0,
      },
      {
        label: "Independence & Judgment",
        value: appraisal.independenceAndJudgment ?? 0,
      },
      { label: "Team Spirit", value: appraisal.teamSpirit ?? 0 },
      { label: "Personal Drive", value: appraisal.personalDrive ?? 0 },
      {
        label: "Creativity & Initiative",
        value: appraisal.creativityAndInitiative ?? 0,
      },
      { label: "Broad Prospective", value: appraisal.broadProspective ?? 0 },
      {
        label: "Communication Skills",
        value: appraisal.communicationSkills ?? 0,
      },
      {
        label: "Planning & Organizing",
        value: appraisal.planningAndOrganizing ?? 0,
      },
      { label: "Appearance", value: appraisal.appearance ?? 0 },
      { label: "Attitude", value: appraisal.attitude ?? 0 },
      { label: "Timing", value: appraisal.timing ?? 0 },
    ],
    feedbackComments: appraisal.feedbackComments || undefined,
    managerName: appraisal.manager?.name || "Manager",
    acknowledged: Boolean(appraisal.acknowledged ?? appraisal.acknowledgedAt),
    acknowledgedAt: appraisal.acknowledgedAt ?? null,
    repComment: appraisal.repComment ?? appraisal.employeeComment ?? null,
  };
}
