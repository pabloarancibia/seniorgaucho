import type { Request, Response } from "express";
import type { SubmitQuizAnswerUseCase } from "@application/quiz-answer/use-cases/SubmitQuizAnswerUseCase.js";
import type { ListQuizAnswersUseCase } from "@application/quiz-answer/use-cases/ListQuizAnswersUseCase.js";

export class QuizAnswerController {
  constructor(
    private readonly submitQuizAnswerUseCase: SubmitQuizAnswerUseCase,
    private readonly listQuizAnswersUseCase: ListQuizAnswersUseCase
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const answers = await this.listQuizAnswersUseCase.execute(req.params.lessonId as string);
    res.json(answers.map((answer) => answer.toPrimitives()));
  };

  submit = async (req: Request, res: Response): Promise<void> => {
    const { lessonId, questionId } = req.params as { lessonId: string; questionId: string };
    const { selectedOption, isCorrect } = req.body as { selectedOption: string; isCorrect: boolean };
    const answer = await this.submitQuizAnswerUseCase.execute(lessonId, questionId, selectedOption, isCorrect);
    res.json(answer.toPrimitives());
  };
}
