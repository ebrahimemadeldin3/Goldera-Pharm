import { z } from "zod";

const completionLocationSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  accuracy: z.number().finite().min(0).nullable(),
  capturedAt: z.string().datetime(),
});

export const visitReportSchema = z.object({
  visitId: z.string().min(1, "Visit ID is required"),
  duration: z.string().min(1, "Duration is required"),
  rating: z.string().min(1, "Please select a rating"),
  discussedTopicsText: z
    .string()
    .min(1, "Please provide at least one discussed topic")
    .max(1000, "Maximum 1000 characters"),
  doctorFeedback: z.string().max(1000, "Maximum 1000 characters").optional(),
  visitPurpose: z
    .string()
    .min(1, "Visit purpose is required")
    .max(500, "Maximum 500 characters"),
  notes: z.string().max(1000, "Maximum 1000 characters").optional(),
  samplesProvided: z.array(z.string()),
  completionLocation: completionLocationSchema.nullable().optional(),
});

export type VisitReportFormValues = z.infer<typeof visitReportSchema>;
