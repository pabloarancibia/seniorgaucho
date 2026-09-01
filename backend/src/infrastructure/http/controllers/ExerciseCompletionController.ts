import type { Request, Response } from "express";
import type { SubmitExerciseCompletionUseCase } from "@application/exercise-completion/use-cases/SubmitExerciseCompletionUseCase.js";
import type { ListExerciseCompletionsUseCase } from "@application/exercise-completion/use-cases/ListExerciseCompletionsUseCase.js";

export class ExerciseCompletionController {
  constructor(
    private readonly submitExerciseCompletionUseCase: SubmitExerciseCompletionUseCase,
    private readonly listExerciseCompletionsUseCase: ListExerciseCompletionsUseCase
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const completions = await this.listExerciseCompletionsUseCase.execute(req.params.lessonId as string);
    res.json(completions.map((completion) => completion.toPrimitives()));
  };

  submit = async (req: Request, res: Response): Promise<void> => {
    const { lessonId, exerciseId } = req.params as { lessonId: string; exerciseId: string };
    const { completed } = req.body as { completed: boolean };
    const completion = await this.submitExerciseCompletionUseCase.execute(lessonId, exerciseId, completed);
    res.json(completion.toPrimitives());
  };
}
