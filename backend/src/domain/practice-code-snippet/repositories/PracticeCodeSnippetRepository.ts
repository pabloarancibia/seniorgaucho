import type { PracticeCodeSnippet } from "@domain/practice-code-snippet/entities/PracticeCodeSnippet.js";

export interface PracticeCodeSnippetRepository {
  findByLessonTopicExerciseAndLanguage(
    lessonId: string,
    topicSlug: string,
    exerciseId: string,
    language: string
  ): Promise<PracticeCodeSnippet | null>;
  /** Guarda el estado del editor (una lección + tema + ejercicio + lenguaje = un snippet). */
  upsert(
    lessonId: string,
    topicSlug: string,
    exerciseId: string,
    language: string,
    codeContent: string
  ): Promise<PracticeCodeSnippet>;
}
