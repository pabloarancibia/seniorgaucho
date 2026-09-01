import { Router } from "express";
import type { LlmProviderController } from "@infrastructure/http/controllers/LlmProviderController.js";

export function llmProviderRoutes(controller: LlmProviderController): Router {
  const router = Router();

  router.get("/", controller.list);

  return router;
}
