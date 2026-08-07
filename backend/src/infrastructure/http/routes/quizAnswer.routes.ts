import { Router } from "express";
import type { QuizAnswerController } from "@infrastructure/http/controllers/QuizAnswerController.js";
import { validateRequest } from "@infrastructure/http/middlewares/validateRequest.js";
import {
  quizAnswerParamsSchema,
  submitQuizAnswerBodySchema,
} from "@infrastructure/http/schemas/quizAnswer.schema.js";
import { lessonIdParamsSchema } from "@infrastructure/http/schemas/lesson.schema.js";

/** Se monta en /api/lessons/:lessonId/quiz-answers, requiere mergeParams. */
export function quizAnswerRoutes(controller: QuizAnswerController): Router {
  const router = Router({ mergeParams: true });

  router.get("/", validateRequest(lessonIdParamsSchema, "params"), controller.list);
  router.put(
    "/:questionId",
    validateRequest(quizAnswerParamsSchema, "params"),
    validateRequest(submitQuizAnswerBodySchema, "body"),
    controller.submit
  );

  return router;
}
