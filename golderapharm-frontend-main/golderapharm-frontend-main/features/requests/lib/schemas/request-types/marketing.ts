import { z } from "zod";
import { baseRequestSchema } from "./common";

export const marketingRequestSchema = baseRequestSchema.extend({
  type: z.literal("MARKETING"),
  doctorIds: z.array(z.string()).min(1, "At least one doctor is required"),
  budget: z.coerce.number().positive("Budget is required"),
});
