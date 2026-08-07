import { CodeSnippet } from "@domain/code-snippet/entities/CodeSnippet.js";
import type { CodeSnippetRepository } from "@domain/code-snippet/repositories/CodeSnippetRepository.js";
import type {
  PrismaClient,
  CodeSnippet as PrismaCodeSnippet,
} from "@infrastructure/persistence/prisma/generated/client.js";

export class PrismaCodeSnippetRepository implements CodeSnippetRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByLessonAndLanguage(lessonId: string, language: string): Promise<CodeSnippet | null> {
    const record = await this.prisma.codeSnippet.findUnique({
      where: { lessonId_language: { lessonId, language } },
    });
    return record ? PrismaCodeSnippetRepository.toDomain(record) : null;
  }

  async upsert(lessonId: string, language: string, codeContent: string): Promise<CodeSnippet> {
    const record = await this.prisma.codeSnippet.upsert({
      where: { lessonId_language: { lessonId, language } },
      create: { lessonId, language, codeContent },
      update: { codeContent },
    });
    return PrismaCodeSnippetRepository.toDomain(record);
  }

  private static toDomain(record: PrismaCodeSnippet): CodeSnippet {
    return CodeSnippet.reconstitute(record);
  }
}
