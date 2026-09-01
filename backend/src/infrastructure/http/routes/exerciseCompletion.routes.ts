import { Router } from "express";
import type { ExerciseCompletionController } from "@infrastructure/http/controllers/ExerciseCompletionController.js";
import { validateRequest } from "@infrastructure/http/middlewares/validateRequest.js";
import {
  exerciseCompletionParamsSchema,
  submitExerciseCompletionBodySchema,
} from "@infrastructure/http/schemas/exerciseCompletion.schema.js";
import { lessonIdParamsSchema } from "@infrastructure/http/schemas/lesson.schema.js";

/** Se monta en /api/lessons/:lessonId/exercise-completions, requiere mergeParams. */
export function exerciseCompletionRoutes(controller: ExerciseCompletionController): Router {
  const router = Router({ mergeParams: true });

  router.get("/", validateRequest(lessonIdParamsSchema, "params"), controller.list);
  router.put(
    "/:exerciseId",
    validateRequest(exerciseCompletionParamsSchema, "params"),
    validateRequest(submitExerciseCompletionBodySchema, "body"),
    controller.submit
  );

  return router;
}
