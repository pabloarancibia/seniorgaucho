import { z } from "zod";

export const quizAnswerParamsSchema = z.object({
  lessonId: z.string().min(1),
  questionId: z.string().min(1),
});

export const submitQuizAnswerBodySchema = z.object({
  selectedOption: z.string().min(1),
  isCorrect: z.boolean(),
});
