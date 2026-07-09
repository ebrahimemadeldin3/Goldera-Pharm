import { z } from "zod";
import { baseRequestSchema } from "./common";

export const sampleDataItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  productName: z.string().min(1, "Product name is required"),
  amount: z.coerce.number().int().positive("Amount must be greater than 0"),
});

export const sampleRequestSchema = baseRequestSchema.extend({
  type: z.literal("SAMPLE"),
  sampleData: z
    .array(sampleDataItemSchema)
    .min(1, "At least one sample item is required"),
});
