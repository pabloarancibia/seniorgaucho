import type { PracticeCodeSnippet } from "@domain/practice-code-snippet/entities/PracticeCodeSnippet.js";

export interface PracticeCodeSnippetRepository {
  findByLessonTopicAndLanguage(
    lessonId: string,
    topicSlug: string,
    language: string
  ): Promise<PracticeCodeSnippet | null>;
  /** Guarda el estado del editor (una lección + tema + lenguaje = un snippet). */
  upsert(
    lessonId: string,
    topicSlug: string,
    language: string,
    codeContent: string
  ): Promise<PracticeCodeSnippet>;
}
