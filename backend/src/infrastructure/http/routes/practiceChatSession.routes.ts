import { Router } from "express";
import type { PracticeChatSessionController } from "@infrastructure/http/controllers/PracticeChatSessionController.js";
import { validateRequest } from "@infrastructure/http/middlewares/validateRequest.js";
import {
  practiceChatSessionLessonParamsSchema,
  startPracticeChatSessionBodySchema,
  practiceChatSessionParamsSchema,
  sendPracticeChatMessageBodySchema,
} from "@infrastructure/http/schemas/practiceChatSession.schema.js";

/** Se monta en /api/lessons/:lessonId/practice-sessions, requiere mergeParams. */
export function practiceChatSessionRoutes(controller: PracticeChatSessionController): Router {
  const router = Router({ mergeParams: true });

  router.post(
    "/",
    validateRequest(practiceChatSessionLessonParamsSchema, "params"),
    validateRequest(startPracticeChatSessionBodySchema, "body"),
    controller.start
  );
  router.get("/:sessionId", validateRequest(practiceChatSessionParamsSchema, "params"), controller.get);
  router.post(
    "/:sessionId/messages",
    validateRequest(practiceChatSessionParamsSchema, "params"),
    validateRequest(sendPracticeChatMessageBodySchema, "body"),
    controller.sendMessage
  );

  return router;
}
