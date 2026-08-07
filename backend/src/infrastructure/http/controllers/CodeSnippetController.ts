import type { Request, Response } from "express";
import type { SaveCodeSnippetUseCase } from "@application/code-snippet/use-cases/SaveCodeSnippetUseCase.js";
import type { GetCodeSnippetUseCase } from "@application/code-snippet/use-cases/GetCodeSnippetUseCase.js";

export class CodeSnippetController {
  constructor(
    private readonly saveCodeSnippetUseCase: SaveCodeSnippetUseCase,
    private readonly getCodeSnippetUseCase: GetCodeSnippetUseCase
  ) {}

  get = async (req: Request, res: Response): Promise<void> => {
    const { lessonId, language } = req.params as { lessonId: string; language: string };
    const snippet = await this.getCodeSnippetUseCase.execute(lessonId, language);
    res.json(snippet ? snippet.toPrimitives() : null);
  };

  save = async (req: Request, res: Response): Promise<void> => {
    const { lessonId, language } = req.params as { lessonId: string; language: string };
    const { codeContent } = req.body as { codeContent: string };
    const snippet = await this.saveCodeSnippetUseCase.execute(lessonId, language, codeContent);
    res.json(snippet.toPrimitives());
  };
}
