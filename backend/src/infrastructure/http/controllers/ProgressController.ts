import type { Request, Response } from "express";
import type { UpsertProgressUseCase } from "@application/progress/use-cases/UpsertProgressUseCase.js";
import type { GetProgressUseCase } from "@application/progress/use-cases/GetProgressUseCase.js";
import type { ProgressStatus } from "@domain/progress/value-objects/ProgressStatus.js";

export class ProgressController {
  constructor(
    private readonly upsertProgressUseCase: UpsertProgressUseCase,
    private readonly getProgressUseCase: GetProgressUseCase
  ) {}

  get = async (req: Request, res: Response): Promise<void> => {
    const progress = await this.getProgressUseCase.execute(req.params.lessonId as string);
    res.json(progress.toPrimitives());
  };

  upsert = async (req: Request, res: Response): Promise<void> => {
    const { status } = req.body as { status: ProgressStatus };
    const progress = await this.upsertProgressUseCase.execute(req.params.lessonId as string, status);
    res.json(progress.toPrimitives());
  };
}
