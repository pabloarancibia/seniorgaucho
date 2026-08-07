import type { CodeSnippet } from "@domain/code-snippet/entities/CodeSnippet.js";
import type { CodeSnippetRepository } from "@domain/code-snippet/repositories/CodeSnippetRepository.js";

export class GetCodeSnippetUseCase {
  constructor(private readonly codeSnippetRepository: CodeSnippetRepository) {}

  async execute(lessonId: string, language: string): Promise<CodeSnippet | null> {
    return this.codeSnippetRepository.findByLessonAndLanguage(lessonId, language);
  }
}
