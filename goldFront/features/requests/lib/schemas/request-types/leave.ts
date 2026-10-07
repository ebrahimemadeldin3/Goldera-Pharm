import { z } from "zod";
import { baseRequestSchema } from "./common";

export const leaveRequestSchema = baseRequestSchema
  .extend({
    type: z.literal("LEAVE"),
    leaveType: z.string().trim().min(1, "Leave type is required"),
    leaveStartDate: z.string().trim().min(1, "Start date is required"),
    leaveEndDate: z.string().trim().min(1, "End date is required"),
  })
  .refine(
    (data) => {
      if (!data.leaveStartDate || !data.leaveEndDate) return true;
      return new Date(data.leaveEndDate) >= new Date(data.leaveStartDate);
    },
    {
      message: "Leave end date cannot be earlier than start date",
      path: ["leaveEndDate"],
    },
  );
