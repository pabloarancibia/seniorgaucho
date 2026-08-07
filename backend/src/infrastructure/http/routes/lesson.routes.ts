import { Router } from "express";
import type { LessonController } from "@infrastructure/http/controllers/LessonController.js";
import { validateRequest } from "@infrastructure/http/middlewares/validateRequest.js";
import { createLessonBodySchema, lessonSlugParamsSchema } from "@infrastructure/http/schemas/lesson.schema.js";

export function lessonRoutes(controller: LessonController): Router {
  const router = Router();

  router.get("/", controller.list);
  router.post("/", validateRequest(createLessonBodySchema, "body"), controller.create);
  router.get("/:slug", validateRequest(lessonSlugParamsSchema, "params"), controller.getBySlug);

  return router;
}
