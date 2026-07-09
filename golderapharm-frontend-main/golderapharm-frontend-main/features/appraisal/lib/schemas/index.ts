import { z } from "zod";

const scoreField = z.number().min(0).max(100);

/**
 * Schema for creating a new appraisal
 */
export const createAppraisalSchema = z.object({
  repId: z.string().uuid("Invalid rep ID"),
  period: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, "Invalid date format"),
  // Job Related Skills
  presentationSkills: scoreField,
  sellingSkills: scoreField,
  reporting: scoreField,
  // Job Knowledge Skills
  productInformation: scoreField,
  competitorsInformation: scoreField,
  // Organizational Skills
  organizationalValueAwareness: scoreField,
  properUtilizationOfResources: scoreField,
  // Interpersonal Skills
  reliabilityAndCredibility: scoreField,
  independenceAndJudgment: scoreField,
  teamSpirit: scoreField,
  personalDrive: scoreField,
  creativityAndInitiative: scoreField,
  broadProspective: scoreField,
  communicationSkills: scoreField,
  planningAndOrganizing: scoreField,
  // General Factors
  appearance: scoreField,
  attitude: scoreField,
  timing: scoreField,
  feedbackComments: z.string().optional(),
});

export type CreateAppraisalFormValues = z.infer<typeof createAppraisalSchema>;
