import type { PracticeCodeSnippet } from "@domain/practice-code-snippet/entities/PracticeCodeSnippet.js";
import type { PracticeCodeSnippetRepository } from "@domain/practice-code-snippet/repositories/PracticeCodeSnippetRepository.js";

export class GetPracticeCodeSnippetUseCase {
  constructor(private readonly practiceCodeSnippetRepository: PracticeCodeSnippetRepository) {}

  async execute(
    lessonId: string,
    topicSlug: string,
    exerciseId: string,
    language: string
  ): Promise<PracticeCodeSnippet | null> {
    return this.practiceCodeSnippetRepository.findByLessonTopicExerciseAndLanguage(
      lessonId,
      topicSlug,
      exerciseId,
      language
    );
  }
}
