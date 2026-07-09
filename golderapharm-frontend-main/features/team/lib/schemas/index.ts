import { z } from "zod";

export const addMemberSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    dateOfBirth: z.date({
      message: "Date of birth is required",
    }),
    role: z.enum(["SUPERVISOR", "MEDICAL_REP"], {
      message: "Role is required",
    }),
    regionId: z.string().optional(),
    subRegionId: z.string().optional(),
    dateOfRecruitment: z.date().optional(),
    educationBackground: z.string().optional(),
    iqamaNumber: z.string().optional(),
    passportNumber: z.string().optional(),
    resume: z
      .instanceof(File)
      .refine((file) => file.size <= 5 * 1024 * 1024, {
        message: "CV must be less than 5MB",
      })
      .refine(
        (file) =>
          [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ].includes(file.type),
        {
          message: "CV must be PDF, DOC, or DOCX",
        },
      )
      .optional(),
    certificates: z
      .instanceof(FileList)
      .refine(
        (files) => {
          if (!files || files.length === 0) return true;
          return Array.from(files).every(
            (file) => file.size <= 5 * 1024 * 1024,
          );
        },
        {
          message: "Each certificate must be less than 5MB",
        },
      )
      .optional(),
    department: z.string().optional(),
    bio: z.string().optional(),
    supervisorId: z.string().optional(),
  })
  .refine(
    (data) => {
      // If role is MEDICAL_REP, supervisorId is required
      if (data.role === "MEDICAL_REP") {
        return !!data.supervisorId && data.supervisorId.length > 0;
      }
      return true;
    },
    {
      message: "Supervisor is required for Medical Representatives",
      path: ["supervisorId"],
    },
  );

export type AddMemberFormValues = z.infer<typeof addMemberSchema>;

export const editMemberSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().min(1, "Phone number is required").optional(),
  region: z.string().optional(),
  isActive: z.boolean().optional(),
  role: z.enum(["SUPERVISOR", "MEDICAL_REP"]).optional(),
  employeeId: z.string().optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});

export type EditMemberFormValues = z.infer<typeof editMemberSchema>;
