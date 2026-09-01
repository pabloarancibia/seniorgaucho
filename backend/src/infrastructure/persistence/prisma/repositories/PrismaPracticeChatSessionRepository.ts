import {
  PracticeChatSession,
  type PracticeChatSessionStatus as DomainStatus,
} from "@domain/practice-tutor/entities/PracticeChatSession.js";
import type { PracticeChatSessionRepository } from "@domain/practice-tutor/repositories/PracticeChatSessionRepository.js";
import type { LlmProviderKey } from "@domain/llm/ports/LlmProvider.js";
import type {
  PrismaClient,
  PracticeChatSession as PrismaPracticeChatSession,
} from "@infrastructure/persistence/prisma/generated/client.js";

export class PrismaPracticeChatSessionRepository implements PracticeChatSessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<PracticeChatSession | null> {
    const record = await this.prisma.practiceChatSession.findUnique({ where: { id } });
    return record ? PrismaPracticeChatSessionRepository.toDomain(record) : null;
  }

  async findActiveByLessonAndTopic(lessonId: string, topicSlug: string): Promise<PracticeChatSession | null> {
    const record = await this.prisma.practiceChatSession.findFirst({
      where: { lessonId, topicSlug, status: "ACTIVE" },
      orderBy: { startedAt: "desc" },
    });
    return record ? PrismaPracticeChatSessionRepository.toDomain(record) : null;
  }

  async create(
    lessonId: string,
    topicSlug: string,
    providerKey: LlmProviderKey,
    model: string,
    locale: string
  ): Promise<PracticeChatSession> {
    const record = await this.prisma.practiceChatSession.create({
      data: { lessonId, topicSlug, providerKey, model, locale },
    });
    return PrismaPracticeChatSessionRepository.toDomain(record);
  }

  async archive(sessionId: string): Promise<void> {
    await this.prisma.practiceChatSession.update({
      where: { id: sessionId },
      data: { status: "ARCHIVED" },
    });
  }

  private static toDomain(record: PrismaPracticeChatSession): PracticeChatSession {
    return PracticeChatSession.reconstitute({
      id: record.id,
      lessonId: record.lessonId,
      topicSlug: record.topicSlug,
      status: record.status as DomainStatus,
      providerKey: record.providerKey as LlmProviderKey,
      model: record.model,
      locale: record.locale,
      startedAt: record.startedAt,
      lastActivityAt: record.lastActivityAt,
    });
  }
}
