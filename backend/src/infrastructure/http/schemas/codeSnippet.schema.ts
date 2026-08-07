import { z } from "zod";

export const codeSnippetParamsSchema = z.object({
  lessonId: z.string().min(1),
  language: z.enum(["python", "typescript"]),
});

export const saveCodeSnippetBodySchema = z.object({
  codeContent: z.string(),
});
