import { z } from "zod";

export const createForecastSchema = z.object({
  periodType: z.enum(["MONTHLY", "QUARTERLY"], {
    message: "Period type is required",
  }),
  month: z.string().optional(),
  quarter: z.string().optional(),
  year: z.number().min(2020).max(2100),
  distributions: z
    .array(
      z.object({
        doctorId: z.string(),
        allocations: z.array(
          z.object({
            productId: z.string(),
            units: z.number().min(0),
          }),
        ),
      }),
    )
    .min(1, "At least one doctor must be selected"),
  notes: z.string().optional(),
});

export const saveDraftForecastSchema = createForecastSchema;

export const submitForecastSchema = createForecastSchema.refine(
  (data) => {
    // Ensure all distributions have at least one allocation with units > 0
    return data.distributions.every((dist) =>
      dist.allocations.some((alloc) => alloc.units > 0),
    );
  },
  {
    message: "Each doctor must have at least one product allocated",
  },
);

export type CreateForecastFormValues = z.infer<typeof createForecastSchema>;
export type SaveDraftForecastFormValues = z.infer<
  typeof saveDraftForecastSchema
>;
export type SubmitForecastFormValues = z.infer<typeof submitForecastSchema>;
