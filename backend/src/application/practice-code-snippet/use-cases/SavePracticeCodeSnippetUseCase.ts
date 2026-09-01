import type { PracticeCodeSnippet } from "@domain/practice-code-snippet/entities/PracticeCodeSnippet.js";
import type { PracticeCodeSnippetRepository } from "@domain/practice-code-snippet/repositories/PracticeCodeSnippetRepository.js";
import type { LessonRepository } from "@domain/lesson/repositories/LessonRepository.js";
import { NotFoundError } from "@shared/errors/AppError.js";

export class SavePracticeCodeSnippetUseCase {
  constructor(
    private readonly practiceCodeSnippetRepository: PracticeCodeSnippetRepository,
    private readonly lessonRepository: LessonRepository
  ) {}

  async execute(
    lessonId: string,
    topicSlug: string,
    language: string,
    codeContent: string
  ): Promise<PracticeCodeSnippet> {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError(`No se encontró la lección con id "${lessonId}"`);
    }

    return this.practiceCodeSnippetRepository.upsert(lessonId, topicSlug, language, codeContent);
  }
}
