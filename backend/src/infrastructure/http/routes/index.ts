import { Router } from "express";
import type { Container } from "@infrastructure/config/container.js";
import { lessonRoutes } from "@infrastructure/http/routes/lesson.routes.js";
import { progressRoutes } from "@infrastructure/http/routes/progress.routes.js";
import { codeSnippetRoutes } from "@infrastructure/http/routes/codeSnippet.routes.js";
import { quizAnswerRoutes } from "@infrastructure/http/routes/quizAnswer.routes.js";

export function apiRoutes(container: Container): Router {
  const router = Router();

  router.use("/lessons", lessonRoutes(container.lessonController));
  router.use("/lessons/:lessonId/progress", progressRoutes(container.progressController));
  router.use("/lessons/:lessonId/code-snippets", codeSnippetRoutes(container.codeSnippetController));
  router.use("/lessons/:lessonId/quiz-answers", quizAnswerRoutes(container.quizAnswerController));

  return router;
}
