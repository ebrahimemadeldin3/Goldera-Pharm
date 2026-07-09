import { z } from "zod";

/**
 * Base visit schema - shared fields for all roles
 */
const baseVisitSchema = z.object({
  doctorId: z.string().min(1, "Doctor is required"),
  products: z.string().optional(),
  date: z.date({
    message: "Visit date is required",
  }),
  time: z.string().min(1, "Visit time is required"),
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
 * Medical Rep visit schema - no visit type field
 */
export const medicalRepVisitSchema = baseVisitSchema;

// Type exports
export type ManagerVisitFormValues = z.infer<typeof managerVisitSchema>;
export type SupervisorVisitFormValues = z.infer<typeof supervisorVisitSchema>;
export type MedicalRepVisitFormValues = z.infer<typeof medicalRepVisitSchema>;

// Union type for all visit form values
export type VisitFormValues =
  | ManagerVisitFormValues
  | SupervisorVisitFormValues
  | MedicalRepVisitFormValues;
