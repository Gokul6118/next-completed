import { z } from "zod";

export const todoFormSchema = z
  .object({
   
    text: z.string().min(1, "Text is required"),

    done: z.boolean(),

    date: z
      .string()
      .min(1, "Start date is required") 
      .refine((val) => {
        const input = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return input >= today;
      }, "Start date must be today or later"),

    endDate: z
      .string()
      .min(1, "End date is required"), 
  })
  .superRefine((data, ctx) => {
    if (!data.date || !data.endDate) return;

    const start = new Date(data.date);
    const end = new Date(data.endDate);

    if (end < start) {
      ctx.addIssue({
        path: ["endDate"],
        message: "End date must be after start date",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export type TodoForm = z.infer<typeof todoFormSchema>;
