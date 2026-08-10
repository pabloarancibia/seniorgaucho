import { z } from "zod";

export const createLessonBodySchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "El slug debe ser kebab-case (ej: two-sum-problem)"),
  title: z.string().min(1),
  mdxContent: z.string().min(1),
  titleEn: z.string().min(1).nullable().optional(),
  mdxContentEn: z.string().min(1).nullable().optional(),
  order: z.number().int().nonnegative().default(0),
});

export const updateLessonBodySchema = z
  .object({
    title: z.string().min(1),
    mdxContent: z.string().min(1),
    titleEn: z.string().min(1).nullable(),
    mdxContentEn: z.string().min(1).nullable(),
    order: z.number().int().nonnegative(),
  })
  .partial()
  .refine((body) => Object.keys(body).length > 0, "Debe incluir al menos un campo a actualizar");

export const lessonSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const lessonIdParamsSchema = z.object({
  lessonId: z.string().min(1),
});
