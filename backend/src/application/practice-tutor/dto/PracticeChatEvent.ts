import type { PracticeChatMessageProps } from "@domain/practice-tutor/entities/PracticeChatMessage.js";

/**
 * Eventos que SendPracticeChatMessageUseCase va emitiendo a medida que
 * procesa un turno — el controller SSE los mapea 1:1 a frames "event: <type>".
 */
export type PracticeChatEvent =
  | { type: "token"; text: string }
  | { type: "done"; message: PracticeChatMessageProps }
  | { type: "error"; code: string; message: string };
