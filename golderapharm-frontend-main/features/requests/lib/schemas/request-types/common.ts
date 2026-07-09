import { z } from "zod";

export const requestTypeValues = [
  "EXPENSE",
  "MARKETING",
  "LEAVE",
  "SAMPLE",
  "PERSONAL_EXPENSE",
] as const;

export const urgencyValues = ["low", "medium", "high", "priority"] as const;

export const baseRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(requestTypeValues, { message: "Request type is required" }),
  urgency: z.enum(urgencyValues, { message: "Urgency is required" }),
});
