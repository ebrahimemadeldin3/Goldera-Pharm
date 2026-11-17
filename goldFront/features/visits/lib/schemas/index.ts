import { z } from "zod";

export const VISIT_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidVisitDuration(value?: string): boolean {
  if (!value || !value.trim()) return true;
  const match = /^(\d+)(?:\s*(?:min|mins|minute|minutes|m))?$/i.exec(
    value.trim(),
  );
  if (!match) return false;
  const mins = Number(match[1]);
  return Number.isInteger(mins) && mins >= 15 && mins <= 480 && mins % 15 === 0;
}

/**
 * Base visit schema - shared fields for all roles
 */
const baseVisitSchema = z.object({
  doctorId: z.string().min(1, "Doctor is required"),
  products: z.string().optional(),
  date: z.date({
    message: "Visit date is required",
  }),
  time: z
    .string()
    .min(1, "Visit time is required")
    .regex(VISIT_TIME_PATTERN, "Time must be between 00:00 and 23:59"),
  duration: z
    .string()
    .optional()
    .refine((v) => isValidVisitDuration(v), {
      message: "Duration must be in 15-minute increments (15–480 min)",
    }),
  companionType: z.enum(["SINGLE", "WITH_MANAGER"]),
  accompanyingManagerId: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Manager visit schema - can select CHECK, MANAGER (with supervisor), or COACHING (with medical rep)
 */
export const managerVisitSchema = baseVisitSchema
  .extend({
    visitType: z.enum(["CHECK", "MANAGER", "COACHING"], {
      message: "Visit type is required",
    }),
    supervisorId: z.string().optional(),
    medicalRepId: z.string().optional(),
  })
  .refine(
    (data) => {
      // If visitType is MANAGER, supervisorId is required
      if (data.visitType === "MANAGER") {
        return !!data.supervisorId;
      }
      // If visitType is COACHING, medicalRepId is required
      if (data.visitType === "COACHING") {
        return !!data.medicalRepId;
      }
      return true;
    },
    {
      message:
        "Supervisor is required for Manager visits, Medical Rep is required for Coaching visits",
      path: ["visitType"],
    },
  );

/**
 * Supervisor visit schema - can select CHECK or COACHING (with medical rep)
 */
export const supervisorVisitSchema = baseVisitSchema
  .extend({
    visitType: z.enum(["CHECK", "COACHING"], {
      message: "Visit type is required",
    }),
    medicalRepId: z.string().optional(),
  })
  .refine(
    (data) => {
      // If visitType is COACHING, medicalRepId is required
      if (data.visitType === "COACHING") {
        return !!data.medicalRepId;
      }
      return true;
    },
    {
      message: "Medical Rep is required for Coaching visits",
      path: ["medicalRepId"],
    },
  );

/**
 * Medical Rep visit schema - includes Single / Joint Visit validation
 */
export const medicalRepVisitSchema = baseVisitSchema.refine(
  (data) =>
    data.companionType !== "WITH_MANAGER" ||
    Boolean(data.accompanyingManagerId?.trim()),
  {
    message: "Please select an accompanying Manager for a Joint Visit",
    path: ["accompanyingManagerId"],
  },
);

/**
 * Historical Add Visit schema - for visits that have already taken place
 */
export const historicalVisitSchema = z
  .object({
    doctorId: z.string().min(1, "Doctor is required"),
    date: z.date({
      message: "Visit date is required",
    }),
    time: z
      .string()
      .min(1, "Visit time is required")
      .regex(VISIT_TIME_PATTERN, "Time must be between 00:00 and 23:59"),
    duration: z
      .string()
      .min(1, "Visit duration is required")
      .refine((v) => isValidVisitDuration(v), {
        message: "Duration must be in 15-minute increments (15–480 min)",
      }),
    companionType: z.enum(["SINGLE", "WITH_MANAGER"]),
    accompanyingManagerId: z.string().optional(),
    rating: z.number().int().min(1, "Rating is required").max(5),
    visitPurpose: z.string().min(1, "Visit purpose is required"),
    discussedTopics: z
      .array(z.string().min(1))
      .min(1, "At least one discussed topic is required"),
    samplesProvided: z.array(z.string()).optional(),
    doctorFeedback: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) =>
      data.companionType !== "WITH_MANAGER" ||
      Boolean(data.accompanyingManagerId?.trim()),
    {
      message: "Please select an accompanying Manager for a Joint Visit",
      path: ["accompanyingManagerId"],
    },
  );

// Type exports
export type ManagerVisitFormValues = z.infer<typeof managerVisitSchema>;
export type SupervisorVisitFormValues = z.infer<typeof supervisorVisitSchema>;
export type MedicalRepVisitFormValues = z.infer<typeof medicalRepVisitSchema>;
export type HistoricalVisitFormValues = z.infer<typeof historicalVisitSchema>;

// Union type for all visit form values
export type VisitFormValues =
  | ManagerVisitFormValues
  | SupervisorVisitFormValues
  | MedicalRepVisitFormValues;
