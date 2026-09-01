import { z } from "zod";

export const practiceChatSessionLessonParamsSchema = z.object({
  lessonId: z.string().min(1),
});

export const startPracticeChatSessionBodySchema = z.object({
  topicSlug: z.string().min(1),
  providerKey: z.enum(["anthropic", "google", "fake"]).optional(),
  locale: z.enum(["es", "en"]).optional(),
});

export const practiceChatSessionParamsSchema = z.object({
  lessonId: z.string().min(1),
  sessionId: z.string().min(1),
});

export const sendPracticeChatMessageBodySchema = z.object({
  text: z.string().min(1),
  code: z.string().optional(),
  language: z.enum(["python", "typescript"]).optional(),
  intent: z.enum(["hint", "explain", "free"]).optional(),
  activeExerciseId: z.string().optional(),
});
