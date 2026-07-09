import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  internalRef: z.string().min(1, "Internal reference is required"),
  salesPrice: z.number().positive("Sales price must be a positive number"),
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;
