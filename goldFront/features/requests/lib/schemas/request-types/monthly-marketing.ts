import { z } from "zod";
import { baseRequestSchema } from "./common";

export const monthlyMarketingRequestSchema = baseRequestSchema.extend({
  type: z.literal("MONTHLY_MARKETING"),
  doctorIds: z.array(z.string()).length(1, "Select one target doctor"),
  budget: z.coerce
    .number()
    .positive("Amount must be greater than zero")
    .refine((val) => Math.round(val * 100) === val * 100, {
      message: "Amount supports up to 2 decimal places",
    }),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(1000, "Description must not exceed 1000 characters"),
});
