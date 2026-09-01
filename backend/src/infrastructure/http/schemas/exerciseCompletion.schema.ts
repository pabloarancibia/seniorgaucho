import { z } from "zod";

export const exerciseCompletionParamsSchema = z.object({
  lessonId: z.string().min(1),
  exerciseId: z.string().min(1),
});

export const submitExerciseCompletionBodySchema = z.object({
  completed: z.boolean(),
});
