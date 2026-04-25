import { z } from "zod";

export const chargeParamsSchema = z.object({
  id: z.string().min(1),
});
