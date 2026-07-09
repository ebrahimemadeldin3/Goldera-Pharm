import { z } from "zod";

const doctorWithDateSchema = z.object({
  doctorId: z.string(),
  visitDate: z.date(),
});

// Medical Rep - Create Visit Plan Schema
export const createVisitPlanSchema = z.object({
  planType: z.enum(["WEEKLY", "MONTHLY"], {
    message: "Plan type is required",
  }),
  title: z.string().min(1, "Plan title is required"),
  startDate: z.date({
    message: "Start date is required",
  }),
  endDate: z.date({
    message: "End date is required",
  }),
  description: z.string().optional(),
  objectives: z.string().optional(),
  doctorsWithDates: z
    .array(doctorWithDateSchema)
    .min(1, "At least one doctor must be selected"),
  targetVisits: z.number().min(1, "Target visits must be at least 1"),
});

// Supervisor - Create Plan Schema
export const createSupervisorPlanSchema = z.object({
  planType: z.enum(["WEEKLY", "MONTHLY"], {
    message: "Plan type is required",
  }),
  title: z.string().min(1, "Plan title is required"),
  startDate: z.date({
    message: "Start date is required",
  }),
  endDate: z.date({
    message: "End date is required",
  }),
  description: z.string().min(1, "Description is required"),
  objectives: z.string().optional(),
  doctorsWithDates: z
    .array(doctorWithDateSchema)
    .min(1, "At least one doctor must be selected"),
  targetVisits: z.number().min(1, "Target visits must be at least 1"),
  repId: z.string().min(1, "Medical rep is required"),
});

export type CreateVisitPlanFormValues = z.infer<typeof createVisitPlanSchema>;
export type CreateSupervisorPlanFormValues = z.infer<
  typeof createSupervisorPlanSchema
>;
