import { z } from "zod";

export const upsertProgressBodySchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
});
