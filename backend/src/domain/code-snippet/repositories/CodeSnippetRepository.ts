import type { CodeSnippet } from "@domain/code-snippet/entities/CodeSnippet.js";

export interface CodeSnippetRepository {
  findByLessonAndLanguage(lessonId: string, language: string): Promise<CodeSnippet | null>;
  /** Guarda el estado del editor (una lección + lenguaje = un snippet). */
  upsert(lessonId: string, language: string, codeContent: string): Promise<CodeSnippet>;
}
