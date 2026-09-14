import { z } from "zod";

export const createPharmacySchema = z.object({
  name: z.string().min(1, "Pharmacy name is required."),
  city: z.string().min(1, "City is required."),
  subRegion: z.string().min(1, "Territory is required."),
  region: z.string().min(1, "Region is required."),
  country: z.string().min(1, "Country is required."),
});

export type CreatePharmacyFormValues = z.infer<typeof createPharmacySchema>;
