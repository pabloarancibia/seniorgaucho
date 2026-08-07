import { Router } from "express";
import type { CodeSnippetController } from "@infrastructure/http/controllers/CodeSnippetController.js";
import { validateRequest } from "@infrastructure/http/middlewares/validateRequest.js";
import {
  codeSnippetParamsSchema,
  saveCodeSnippetBodySchema,
} from "@infrastructure/http/schemas/codeSnippet.schema.js";

/** Se monta en /api/lessons/:lessonId/code-snippets/:language, requiere mergeParams. */
export function codeSnippetRoutes(controller: CodeSnippetController): Router {
  const router = Router({ mergeParams: true });

  router.get("/:language", validateRequest(codeSnippetParamsSchema, "params"), controller.get);
  router.put(
    "/:language",
    validateRequest(codeSnippetParamsSchema, "params"),
    validateRequest(saveCodeSnippetBodySchema, "body"),
    controller.save
  );

  return router;
}
