import { Router } from "express";
import type { ProgressController } from "@infrastructure/http/controllers/ProgressController.js";
import { validateRequest } from "@infrastructure/http/middlewares/validateRequest.js";
import { upsertProgressBodySchema } from "@infrastructure/http/schemas/progress.schema.js";
import { lessonIdParamsSchema } from "@infrastructure/http/schemas/lesson.schema.js";

/** Se monta en /api/lessons/:lessonId/progress, por eso requiere mergeParams. */
export function progressRoutes(controller: ProgressController): Router {
  const router = Router({ mergeParams: true });

  router.use(validateRequest(lessonIdParamsSchema, "params"));
  router.get("/", controller.get);
  router.put("/", validateRequest(upsertProgressBodySchema, "body"), controller.upsert);

  return router;
}
