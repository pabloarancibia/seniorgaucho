import { PracticeCodeSnippet } from "@domain/practice-code-snippet/entities/PracticeCodeSnippet.js";
import type { PracticeCodeSnippetRepository } from "@domain/practice-code-snippet/repositories/PracticeCodeSnippetRepository.js";
import type {
  PrismaClient,
  PracticeCodeSnippet as PrismaPracticeCodeSnippet,
} from "@infrastructure/persistence/prisma/generated/client.js";

export class PrismaPracticeCodeSnippetRepository implements PracticeCodeSnippetRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByLessonTopicExerciseAndLanguage(
    lessonId: string,
    topicSlug: string,
    exerciseId: string,
    language: string
  ): Promise<PracticeCodeSnippet | null> {
    const record = await this.prisma.practiceCodeSnippet.findUnique({
      where: { lessonId_topicSlug_exerciseId_language: { lessonId, topicSlug, exerciseId, language } },
    });
    return record ? PrismaPracticeCodeSnippetRepository.toDomain(record) : null;
  }

  async upsert(
    lessonId: string,
    topicSlug: string,
    exerciseId: string,
    language: string,
    codeContent: string
  ): Promise<PracticeCodeSnippet> {
    const record = await this.prisma.practiceCodeSnippet.upsert({
      where: { lessonId_topicSlug_exerciseId_language: { lessonId, topicSlug, exerciseId, language } },
      create: { lessonId, topicSlug, exerciseId, language, codeContent },
      update: { codeContent },
    });
    return PrismaPracticeCodeSnippetRepository.toDomain(record);
  }

  private static toDomain(record: PrismaPracticeCodeSnippet): PracticeCodeSnippet {
    return PracticeCodeSnippet.reconstitute(record);
  }
}
