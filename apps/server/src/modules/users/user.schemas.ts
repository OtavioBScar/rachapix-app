import { z } from "zod";

export const updateMeSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: z.string().trim().min(8).nullable().optional(),
  pixKey: z.string().trim().min(3).nullable().optional(),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
