import type { PracticeChatSession } from "@domain/practice-tutor/entities/PracticeChatSession.js";
import type { PracticeChatSessionRepository } from "@domain/practice-tutor/repositories/PracticeChatSessionRepository.js";
import type { LessonRepository } from "@domain/lesson/repositories/LessonRepository.js";
import type { LlmProviderRegistryPort } from "@domain/llm/ports/LlmProviderRegistry.js";
import type { LlmProviderKey } from "@domain/llm/ports/LlmProvider.js";
import { NotFoundError } from "@shared/errors/AppError.js";

/**
 * Devuelve la sesión ACTIVE existente del (lessonId, topicSlug) si ya usa el
 * mismo proveedor (resume idempotente), o la archiva y crea una nueva si
 * pide un proveedor distinto — este es el flujo de "cambiar de proveedor"
 * (p. ej. por cuota agotada): nunca se mezclan mensajes de dos proveedores
 * en el mismo transcript, ver comentario en PracticeChatSession.
 */
export class StartPracticeChatSessionUseCase {
  constructor(
    private readonly practiceChatSessionRepository: PracticeChatSessionRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly llmProviderRegistry: LlmProviderRegistryPort
  ) {}

  async execute(
    lessonId: string,
    topicSlug: string,
    providerKey?: LlmProviderKey,
    locale = "es"
  ): Promise<PracticeChatSession> {
    const provider = this.llmProviderRegistry.resolve(providerKey);
    const existing = await this.practiceChatSessionRepository.findActiveByLessonAndTopic(lessonId, topicSlug);

    if (existing && existing.providerKey === provider.key) {
      return existing;
    }

    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError(`No se encontró la lección con id "${lessonId}"`);
    }

    if (existing) {
      await this.practiceChatSessionRepository.archive(existing.id);
    }

    return this.practiceChatSessionRepository.create(lessonId, topicSlug, provider.key, provider.model, locale);
  }
}
