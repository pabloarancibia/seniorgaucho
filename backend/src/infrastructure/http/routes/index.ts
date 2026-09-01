import { Router } from "express";
import type { Container } from "@infrastructure/config/container.js";
import { lessonRoutes } from "@infrastructure/http/routes/lesson.routes.js";
import { progressRoutes } from "@infrastructure/http/routes/progress.routes.js";
import { codeSnippetRoutes } from "@infrastructure/http/routes/codeSnippet.routes.js";
import { quizAnswerRoutes } from "@infrastructure/http/routes/quizAnswer.routes.js";
import { exerciseCompletionRoutes } from "@infrastructure/http/routes/exerciseCompletion.routes.js";
import { practiceCodeSnippetRoutes } from "@infrastructure/http/routes/practiceCodeSnippet.routes.js";
import { llmProviderRoutes } from "@infrastructure/http/routes/llmProvider.routes.js";
import { practiceChatSessionRoutes } from "@infrastructure/http/routes/practiceChatSession.routes.js";

export function apiRoutes(container: Container): Router {
  const router = Router();

  router.use("/lessons", lessonRoutes(container.lessonController));
  router.use("/lessons/:lessonId/progress", progressRoutes(container.progressController));
  router.use("/lessons/:lessonId/code-snippets", codeSnippetRoutes(container.codeSnippetController));
  router.use("/lessons/:lessonId/quiz-answers", quizAnswerRoutes(container.quizAnswerController));
  router.use(
    "/lessons/:lessonId/exercise-completions",
    exerciseCompletionRoutes(container.exerciseCompletionController)
  );
  router.use(
    "/lessons/:lessonId/practice-code-snippets",
    practiceCodeSnippetRoutes(container.practiceCodeSnippetController)
  );
  // No anidado bajo /lessons: los proveedores LLM no son lesson-scoped.
  router.use("/llm-providers", llmProviderRoutes(container.llmProviderController));
  router.use(
    "/lessons/:lessonId/practice-sessions",
    practiceChatSessionRoutes(container.practiceChatSessionController)
  );

  return router;
}
