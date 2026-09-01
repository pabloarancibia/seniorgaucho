"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { streamPracticeChatMessage } from "@/lib/api/practiceChatSse";
import type { CodeLanguage, LlmProviderKey, PracticeChatIntent, PracticeChatMessage, PracticeChatSession } from "@/lib/api/types";

export interface UsePracticeChatSessionResult {
  session: PracticeChatSession | null;
  messages: PracticeChatMessage[];
  loading: boolean;
  isStreaming: boolean;
  streamingText: string;
  error: string | null;
  sendMessage: (
    text: string,
    code: string,
    language: CodeLanguage,
    intent?: PracticeChatIntent,
    activeExerciseId?: string
  ) => Promise<void>;
}

/**
 * Arranca o resume el chat de práctica de un (lessonId, topicSlug), y
 * expone el estado + la acción de mandar un mensaje. No usa Context/Provider
 * a propósito: solo la pantalla de práctica de un tema consume este estado,
 * un hook plano pasado como props a los paneles hijos alcanza sin la capa
 * extra (mismo criterio que useTutorSession en Socratia).
 */
export function usePracticeChatSession(
  lessonId: string,
  topicSlug: string,
  locale: string,
  providerKey?: LlmProviderKey
): UsePracticeChatSessionResult {
  const [session, setSession] = useState<PracticeChatSession | null>(null);
  const [messages, setMessages] = useState<PracticeChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const started = await api.startPracticeChatSession(lessonId, topicSlug, providerKey, locale);
        if (cancelled) return;
        setSession(started);

        const detail = await api.getPracticeChatSession(lessonId, started.id);
        if (cancelled) return;
        setMessages(detail.messages);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error iniciando el chat de práctica");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // providerKey SÍ debe disparar un reinicio: es la forma de "cambiar de
    // proveedor" (StartPracticeChatSessionUseCase archiva la sesión previa y
    // arranca una nueva si el providerKey pedido difiere del actual).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, topicSlug, providerKey]);

  const sendMessage = useCallback(
    async (
      text: string,
      code: string,
      language: CodeLanguage,
      intent?: PracticeChatIntent,
      activeExerciseId?: string
    ) => {
      if (!session || isStreaming) return;

      setIsStreaming(true);
      setStreamingText("");
      setError(null);

      // Optimista: aparece de inmediato en la lista, se reemplaza por el
      // estado real (con su sequence definitivo) cuando termina el stream.
      setMessages((prev) => [
        ...prev,
        {
          id: `optimistic-${Date.now()}`,
          sessionId: session.id,
          sequence: -1,
          role: "USER",
          text,
          providerBlocks: null,
          createdAt: new Date().toISOString(),
        },
      ]);

      try {
        let assistantText = "";
        for await (const event of streamPracticeChatMessage(lessonId, session.id, {
          text,
          code,
          language,
          intent,
          activeExerciseId,
        })) {
          if (event.type === "token") {
            assistantText += event.text;
            setStreamingText(assistantText);
          } else if (event.type === "error") {
            setError(event.message);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Se perdió la conexión con el mentor");
      } finally {
        // El backend es la fuente de verdad real del orden/contenido final —
        // se refresca en vez de confiar en la reconstrucción optimista.
        try {
          const detail = await api.getPracticeChatSession(lessonId, session.id);
          setMessages(detail.messages);
        } catch {
          // Sin conexión: se queda con el estado optimista/local.
        }
        setIsStreaming(false);
        setStreamingText("");
      }
    },
    [lessonId, session, isStreaming]
  );

  return { session, messages, loading, isStreaming, streamingText, error, sendMessage };
}
