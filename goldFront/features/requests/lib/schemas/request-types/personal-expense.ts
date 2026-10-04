import { z } from "zod";
import { baseRequestSchema } from "./common";

export const totalExpenseDataItemSchema = z.object({
  name: z.string().trim().min(1, "Expense item name is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
});

export const personalExpenseRequestSchema = baseRequestSchema.extend({
  type: z.literal("PERSONAL_EXPENSE"),
  visitedCity: z.string().trim().min(1, "Visit city is required"),
  visitDaysCount: z.coerce
    .number()
    .int()
    .positive("Visit days must be greater than 0"),
  totalExpenseAmount: z.coerce.number().nonnegative().optional(),
  totalExpenseData: z
    .array(totalExpenseDataItemSchema)
    .min(1, "At least one expense item is required"),
});
