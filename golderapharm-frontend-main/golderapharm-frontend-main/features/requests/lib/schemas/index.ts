import { z } from "zod";
import { expenseRequestSchema } from "./request-types/expense";
import { leaveRequestSchema } from "./request-types/leave";
import { marketingRequestSchema } from "./request-types/marketing";
import { personalExpenseRequestSchema } from "./request-types/personal-expense";
import { sampleRequestSchema } from "./request-types/sample";
import { requestTypeValues, urgencyValues } from "./request-types/common";

export const submitRequestSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    subject: z.string().min(1, "Subject is required"),
    description: z.string().min(1, "Description is required"),
    type: z.enum(requestTypeValues, {
      message: "Request type is required",
    }),
    urgency: z.enum(urgencyValues, {
      message: "Urgency is required",
    }),

    // LEAVE fields
    leaveType: z.string().optional(),
    leaveStartDate: z.string().optional(),
    leaveEndDate: z.string().optional(),

    // EXPENSE / MARKETING fields
    doctorIds: z.array(z.string()).optional(),
    budget: z.coerce.number().nonnegative().optional(),

    // SAMPLE fields
    sampleData: z
      .array(
        z.object({
          productId: z.string().optional(),
          productName: z.string().optional(),
          amount: z.coerce.number().optional(),
        }),
      )
      .optional(),

    // PERSONAL_EXPENSE fields
    visitedCity: z.string().optional(),
    visitDaysCount: z.coerce.number().int().positive().optional(),
    totalExpenseAmount: z.coerce.number().nonnegative().optional(),
    totalExpenseData: z
      .array(
        z.object({
          name: z.string().optional(),
          amount: z.coerce.number().optional(),
        }),
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    const schemaByType = {
      EXPENSE: expenseRequestSchema,
      MARKETING: marketingRequestSchema,
      LEAVE: leaveRequestSchema,
      SAMPLE: sampleRequestSchema,
      PERSONAL_EXPENSE: personalExpenseRequestSchema,
    } as const;

    const result = schemaByType[data.type].safeParse(data);
    if (!result.success) {
      result.error.issues.forEach((issue) =>
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: issue.message,
          path: issue.path,
        }),
      );
    }

    // totalExpenseAmount is computed before submit and attached in onSubmit.
    if (data.type === "PERSONAL_EXPENSE" && data.totalExpenseAmount == null) {
      return;
    }
  });

export const updateRequestSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"], {
    message: "Status is required",
  }),
  response: z.string().optional(),
});

export type SubmitRequestFormValues = z.infer<typeof submitRequestSchema>;
export type UpdateRequestFormValues = z.infer<typeof updateRequestSchema>;
