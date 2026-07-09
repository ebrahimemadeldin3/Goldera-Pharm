import { z } from "zod";
import { baseRequestSchema } from "./common";

export const expenseRequestSchema = baseRequestSchema.extend({
  type: z.literal("EXPENSE"),
  doctorIds: z.array(z.string()).min(1, "At least one doctor is required"),
  budget: z.coerce.number().positive("Budget is required"),
});
