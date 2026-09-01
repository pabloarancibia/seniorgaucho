import type { PracticeChatSession } from "@domain/practice-tutor/entities/PracticeChatSession.js";
import type { LlmProviderKey } from "@domain/llm/ports/LlmProvider.js";

export interface PracticeChatSessionRepository {
  findById(id: string): Promise<PracticeChatSession | null>;
  findActiveByLessonAndTopic(lessonId: string, topicSlug: string): Promise<PracticeChatSession | null>;
  create(
    lessonId: string,
    topicSlug: string,
    providerKey: LlmProviderKey,
    model: string,
    locale: string
  ): Promise<PracticeChatSession>;
  archive(sessionId: string): Promise<void>;
}
