import { z } from "zod";

export const coachingReviewSchema = z.object({
  repId: z.string().min(1, "Medical representative is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  visitDate: z.date({
    message: "Visit date is required",
  }),
  visitDuration: z.string().min(1, "Visit duration is required"),
  visitLocation: z.string().min(1, "Visit location is required"),
  performanceRating: z
    .number()
    .min(1, "Performance rating is required")
    .max(5, "Performance rating must be between 1 and 5"),
  visitPros: z.string().min(1, "What went well is required"),
  visitCons: z.string().min(1, "Areas for improvement is required"),
  recommendations: z.string().min(1, "Recommendations are required"),
  actionItems: z.string().min(1, "Action items are required"),
  notes: z.string().optional(),
});

export type CoachingReviewFormValues = z.infer<typeof coachingReviewSchema>;
