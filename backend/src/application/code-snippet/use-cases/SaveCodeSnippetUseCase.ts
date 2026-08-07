import type { CodeSnippet } from "@domain/code-snippet/entities/CodeSnippet.js";
import type { CodeSnippetRepository } from "@domain/code-snippet/repositories/CodeSnippetRepository.js";
import type { LessonRepository } from "@domain/lesson/repositories/LessonRepository.js";
import { NotFoundError } from "@shared/errors/AppError.js";

export class SaveCodeSnippetUseCase {
  constructor(
    private readonly codeSnippetRepository: CodeSnippetRepository,
    private readonly lessonRepository: LessonRepository
  ) {}

  async execute(lessonId: string, language: string, codeContent: string): Promise<CodeSnippet> {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError(`No se encontró la lección con id "${lessonId}"`);
    }

    return this.codeSnippetRepository.upsert(lessonId, language, codeContent);
  }
}
