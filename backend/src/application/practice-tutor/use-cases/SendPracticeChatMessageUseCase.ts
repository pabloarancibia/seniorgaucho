import type { PracticeChatSessionRepository } from "@domain/practice-tutor/repositories/PracticeChatSessionRepository.js";
import type { PracticeChatMessageRepository } from "@domain/practice-tutor/repositories/PracticeChatMessageRepository.js";
import type { LessonRepository } from "@domain/lesson/repositories/LessonRepository.js";
import type { LlmProviderRegistryPort } from "@domain/llm/ports/LlmProviderRegistry.js";
import type { LlmMessage } from "@domain/llm/value-objects/LlmMessage.js";
import {
  buildPracticeTutorSystemPrompt,
  type PracticeTutorIntent,
  type PracticeTutorLocale,
} from "@domain/practice-tutor/services/PracticeTutorPromptBuilder.js";
import { extractTopicContent } from "@domain/practice-tutor/services/ExerciseContentExtractor.js";
import { practiceChatMessageToLlmMessage } from "@application/practice-tutor/services/practiceChatMessageMapper.js";
import type { PracticeChatEvent } from "@application/practice-tutor/dto/PracticeChatEvent.js";

export interface SendPracticeChatMessageInput {
  text: string;
  code?: string | undefined;
  language?: "python" | "typescript" | undefined;
  intent?: PracticeTutorIntent | undefined;
  /** id (slugify del title) del <Exercise> desplegado en el frontend — ver ActiveExerciseContext. */
  activeExerciseId?: string | undefined;
}

/** Elige mdxContentEn cuando el locale de la sesión es "en" y hay traducción cargada; si no, cae al español. */
function localizedMdx(mdxContent: string, mdxContentEn: string | null, locale: string): string {
  return locale === "en" && mdxContentEn ? mdxContentEn : mdxContent;
}

function localizedTitle(title: string, titleEn: string | null, locale: string): string {
  return locale === "en" && titleEn ? titleEn : title;
}

/**
 * El loop de un turno del chat de práctica, como async generator: cada
 * evento que produce el proveedor se traduce a un PracticeChatEvent que el
 * controller SSE reenvía tal cual. Sin loop de tool-calling (a diferencia
 * del tutor de Socratia) — el chat de práctica es solo Q&A/pista/
 * explicación, un único stream() por turno. Transporte-agnóstico a
 * propósito, no sabe nada de Express/SSE.
 */
export class SendPracticeChatMessageUseCase {
  constructor(
    private readonly practiceChatSessionRepository: PracticeChatSessionRepository,
    private readonly practiceChatMessageRepository: PracticeChatMessageRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly llmProviderRegistry: LlmProviderRegistryPort
  ) {}

  async *execute(
    sessionId: string,
    input: SendPracticeChatMessageInput,
    signal?: AbortSignal
  ): AsyncGenerator<PracticeChatEvent> {
    const session = await this.practiceChatSessionRepository.findById(sessionId);
    if (!session) {
      yield { type: "error", code: "NOT_FOUND", message: `No existe la sesión "${sessionId}"` };
      return;
    }
    if (!session.isActive) {
      yield { type: "error", code: "SESSION_INACTIVE", message: "Esta sesión ya no está activa" };
      return;
    }

    const lesson = await this.lessonRepository.findById(session.lessonId);
    if (!lesson) {
      yield { type: "error", code: "NOT_FOUND", message: "No se encontró la lección de esta sesión" };
      return;
    }

    const mdxSource = localizedMdx(lesson.mdxContent, lesson.mdxContentEn, session.locale);
    const topicContent = extractTopicContent(mdxSource, session.topicSlug);
    if (!topicContent) {
      yield { type: "error", code: "NOT_FOUND", message: "No se encontró el tema de esta sesión en la lección" };
      return;
    }

    const provider = this.llmProviderRegistry.resolve(session.providerKey);

    await this.practiceChatMessageRepository.append({
      sessionId: session.id,
      role: "USER",
      text: input.text,
      providerBlocks: null,
    });

    const history = await this.practiceChatMessageRepository.findBySessionId(session.id);
    const conversationMessages: LlmMessage[] = history.map(practiceChatMessageToLlmMessage);

    const systemPrompt = buildPracticeTutorSystemPrompt({
      lessonTitle: localizedTitle(lesson.title, lesson.titleEn, session.locale),
      topicTitle: topicContent.topicTitle,
      exercises: topicContent.exercises,
      currentCode: input.code ?? "",
      currentLanguage: input.language ?? "python",
      intent: input.intent,
      locale: session.locale as PracticeTutorLocale,
      activeExerciseId: input.activeExerciseId,
    });

    let assistantMessage: LlmMessage | null = null;
    let streamError: { code: string; message: string } | null = null;

    for await (const event of provider.stream({ system: systemPrompt, messages: conversationMessages }, signal)) {
      if (event.type === "text_delta") {
        yield { type: "token", text: event.text };
      } else if (event.type === "done") {
        assistantMessage = event.message;
      } else if (event.type === "error") {
        streamError = { code: event.code, message: event.message };
      }
      // "tool_call" no aplica acá: el chat de práctica no manda `tools` en el request.
    }

    if (streamError) {
      yield { type: "error", ...streamError };
      return;
    }
    if (!assistantMessage) {
      yield { type: "error", code: "no_response", message: "El proveedor no devolvió una respuesta" };
      return;
    }

    const saved = await this.practiceChatMessageRepository.append({
      sessionId: session.id,
      role: "ASSISTANT",
      text: assistantMessage.text ?? "",
      providerBlocks: assistantMessage.providerBlocks ?? null,
    });

    yield { type: "done", message: saved.toPrimitives() };
  }
}
