import { API_URL } from "@/lib/api/client";
import type { PracticeChatEvent, PracticeChatIntent, CodeLanguage } from "@/lib/api/types";

interface StreamPracticeChatMessageInput {
  text: string;
  code?: string;
  language?: CodeLanguage;
  intent?: PracticeChatIntent;
  /** Slug del <Exercise> desplegado/activo (ver ActiveExerciseContext) — le da al mentor el ejercicio en curso sin que lo tenga que inferir. */
  activeExerciseId?: string;
}

/**
 * POST que responde text/event-stream, leído con fetch()+getReader() — no
 * EventSource, que es GET-only y no puede mandar el texto del mensaje (más
 * el código actual del editor) en el body del mismo request que abre el
 * stream.
 */
export async function* streamPracticeChatMessage(
  lessonId: string,
  sessionId: string,
  input: StreamPracticeChatMessageInput,
  signal?: AbortSignal
): AsyncGenerator<PracticeChatEvent> {
  const res = await fetch(`${API_URL}/lessons/${lessonId}/practice-sessions/${sessionId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`No se pudo iniciar el stream del chat de práctica (HTTP ${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const dataLine = frame.split("\n").find((line) => line.startsWith("data:"));
      if (!dataLine) continue; // comentarios de heartbeat (":\n\n") no tienen línea "data:"

      const json = dataLine.slice("data:".length).trim();
      if (!json) continue;

      yield JSON.parse(json) as PracticeChatEvent;
    }
  }
}
