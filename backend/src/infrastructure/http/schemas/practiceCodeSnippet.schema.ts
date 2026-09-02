import { z } from "zod";

export const practiceCodeSnippetParamsSchema = z.object({
  lessonId: z.string().min(1),
  topicSlug: z.string().min(1),
  exerciseId: z.string().min(1),
  language: z.enum(["python", "typescript"]),
});

export const savePracticeCodeSnippetBodySchema = z.object({
  codeContent: z.string(),
});
