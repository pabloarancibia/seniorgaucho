import type { Request, Response } from "express";
import type { StartPracticeChatSessionUseCase } from "@application/practice-tutor/use-cases/StartPracticeChatSessionUseCase.js";
import type { GetPracticeChatSessionUseCase } from "@application/practice-tutor/use-cases/GetPracticeChatSessionUseCase.js";
import type { SendPracticeChatMessageUseCase } from "@application/practice-tutor/use-cases/SendPracticeChatMessageUseCase.js";
import type { LlmProviderKey } from "@domain/llm/ports/LlmProvider.js";
import { SseWriter } from "@infrastructure/http/sse/SseWriter.js";

const HEARTBEAT_INTERVAL_MS = 15_000;

export class PracticeChatSessionController {
  constructor(
    private readonly startPracticeChatSessionUseCase: StartPracticeChatSessionUseCase,
    private readonly getPracticeChatSessionUseCase: GetPracticeChatSessionUseCase,
    private readonly sendPracticeChatMessageUseCase: SendPracticeChatMessageUseCase
  ) {}

  start = async (req: Request, res: Response): Promise<void> => {
    const { lessonId } = req.params as { lessonId: string };
    const { topicSlug, providerKey, locale } = req.body as {
      topicSlug: string;
      providerKey?: LlmProviderKey;
      locale?: string;
    };
    const session = await this.startPracticeChatSessionUseCase.execute(lessonId, topicSlug, providerKey, locale);
    res.json(session.toPrimitives());
  };

  get = async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.params as { sessionId: string };
    const detail = await this.getPracticeChatSessionUseCase.execute(sessionId);
    res.json({
      session: detail.session.toPrimitives(),
      messages: detail.messages.map((message) => message.toPrimitives()),
    });
  };

  /**
   * Único endpoint que maneja sus propios errores con try/catch en vez de
   * delegar al errorHandler global: una vez que SseWriter.start() llama a
   * res.flushHeaders(), Express ya no puede cambiar el status code — la
   * única forma de comunicar un error acá es un frame "event: error"
   * seguido de cerrar la conexión.
   */
  sendMessage = async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.params as { sessionId: string };
    const { text, code, language, intent, activeExerciseId } = req.body as {
      text: string;
      code?: string;
      language?: "python" | "typescript";
      intent?: "hint" | "explain" | "free";
      activeExerciseId?: string;
    };

    const sse = new SseWriter(res);
    sse.start();

    const heartbeat = setInterval(() => sse.heartbeat(), HEARTBEAT_INTERVAL_MS);
    const abortController = new AbortController();
    // res.on("close"), no req.on("close"): el request (un POST con un body
    // chico) termina de leerse casi al instante y dispara su propio
    // "close" mucho antes de que la respuesta SSE termine — abortaría el
    // fetch al proveedor real casi de inmediato. res solo emite "close"
    // cuando la conexión de verdad se corta.
    res.on("close", () => abortController.abort());

    try {
      for await (const event of this.sendPracticeChatMessageUseCase.execute(
        sessionId,
        { text, code, language, intent, activeExerciseId },
        abortController.signal
      )) {
        sse.send(event.type, event);
      }
    } catch (error) {
      sse.send("error", {
        type: "error",
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Error inesperado procesando el mensaje",
      });
    } finally {
      clearInterval(heartbeat);
      sse.end();
    }
  };
}
