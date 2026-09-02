import { Router } from "express";
import type { PracticeCodeSnippetController } from "@infrastructure/http/controllers/PracticeCodeSnippetController.js";
import { validateRequest } from "@infrastructure/http/middlewares/validateRequest.js";
import {
  practiceCodeSnippetParamsSchema,
  savePracticeCodeSnippetBodySchema,
} from "@infrastructure/http/schemas/practiceCodeSnippet.schema.js";

/** Se monta en /api/lessons/:lessonId/practice-code-snippets/:topicSlug/:exerciseId/:language, requiere mergeParams. */
export function practiceCodeSnippetRoutes(controller: PracticeCodeSnippetController): Router {
  const router = Router({ mergeParams: true });

  router.get(
    "/:topicSlug/:exerciseId/:language",
    validateRequest(practiceCodeSnippetParamsSchema, "params"),
    controller.get
  );
  router.put(
    "/:topicSlug/:exerciseId/:language",
    validateRequest(practiceCodeSnippetParamsSchema, "params"),
    validateRequest(savePracticeCodeSnippetBodySchema, "body"),
    controller.save
  );

  return router;
}
