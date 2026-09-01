import type { Request, Response } from "express";
import type { SavePracticeCodeSnippetUseCase } from "@application/practice-code-snippet/use-cases/SavePracticeCodeSnippetUseCase.js";
import type { GetPracticeCodeSnippetUseCase } from "@application/practice-code-snippet/use-cases/GetPracticeCodeSnippetUseCase.js";

export class PracticeCodeSnippetController {
  constructor(
    private readonly savePracticeCodeSnippetUseCase: SavePracticeCodeSnippetUseCase,
    private readonly getPracticeCodeSnippetUseCase: GetPracticeCodeSnippetUseCase
  ) {}

  get = async (req: Request, res: Response): Promise<void> => {
    const { lessonId, topicSlug, language } = req.params as {
      lessonId: string;
      topicSlug: string;
      language: string;
    };
    const snippet = await this.getPracticeCodeSnippetUseCase.execute(lessonId, topicSlug, language);
    res.json(snippet ? snippet.toPrimitives() : null);
  };

  save = async (req: Request, res: Response): Promise<void> => {
    const { lessonId, topicSlug, language } = req.params as {
      lessonId: string;
      topicSlug: string;
      language: string;
    };
    const { codeContent } = req.body as { codeContent: string };
    const snippet = await this.savePracticeCodeSnippetUseCase.execute(lessonId, topicSlug, language, codeContent);
    res.json(snippet.toPrimitives());
  };
}
