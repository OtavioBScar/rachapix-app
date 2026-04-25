import { z } from "zod";

export const createExpenseSchema = z.object({
  title: z.string().trim().min(2),
  description: z.string().trim().min(1).optional(),
  originalAmountCents: z.number().int().positive(),
  participantUserIds: z.array(z.string().min(1)).min(1),
  dueDate: z.string().datetime().optional(),
});

export const expenseParamsSchema = z.object({
  id: z.string().min(1),
});

export const upsertExpenseDocumentSchema = z.object({
  imageUrl: z.string().trim().url(),
  extractedAmountCents: z.number().int().positive().optional(),
  extractedText: z.string().trim().min(1).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpsertExpenseDocumentInput = z.infer<typeof upsertExpenseDocumentSchema>;
