import { z } from "zod";
import { baseRequestSchema } from "./common";

export const leaveRequestSchema = baseRequestSchema.extend({
  type: z.literal("LEAVE"),
  leaveType: z.string().min(1, "Leave type is required"),
  leaveStartDate: z.string().min(1, "Start date is required"),
  leaveEndDate: z.string().min(1, "End date is required"),
});
