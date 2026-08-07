import { z } from "zod";

export const createLessonBodySchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "El slug debe ser kebab-case (ej: two-sum-problem)"),
  title: z.string().min(1),
  mdxContent: z.string().min(1),
  language: z.enum(["es", "en"]).default("es"),
  order: z.number().int().nonnegative().default(0),
});

export const lessonSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const lessonIdParamsSchema = z.object({
  lessonId: z.string().min(1),
});
