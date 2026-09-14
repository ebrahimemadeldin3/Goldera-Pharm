import { z } from "zod";

export const addDoctorSchema = z.object({
  nameEN: z.string().min(1, "English name is required"),
  nameAR: z.string().min(1, "Arabic name is required"),
  specialty: z.string().min(1, "Specialty is required"),
  subRegion: z.string().min(1, "Territory is required"),
  license: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[+\d][\d\s().-]{6,}$/, "Enter a valid phone number"),
  grade: z.string().min(1, "Grade is required"),
  avgPatients: z
    .string()
    .optional()
    .refine(
      (value) => !value || Number(value) >= 0,
      "Average patients must be 0 or greater",
    ),
  accountName: z.string().min(1, "Account name is required"),
});

export type AddDoctorFormValues = z.infer<typeof addDoctorSchema>;
