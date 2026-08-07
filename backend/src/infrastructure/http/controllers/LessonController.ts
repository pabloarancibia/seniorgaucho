import type { Request, Response } from "express";
import type { CreateLessonUseCase } from "@application/lesson/use-cases/CreateLessonUseCase.js";
import type { ListLessonsUseCase } from "@application/lesson/use-cases/ListLessonsUseCase.js";
import type { GetLessonBySlugUseCase } from "@application/lesson/use-cases/GetLessonBySlugUseCase.js";

export class LessonController {
  constructor(
    private readonly createLessonUseCase: CreateLessonUseCase,
    private readonly listLessonsUseCase: ListLessonsUseCase,
    private readonly getLessonBySlugUseCase: GetLessonBySlugUseCase
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const lesson = await this.createLessonUseCase.execute(req.body);
    res.status(201).json(lesson.toPrimitives());
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    const lessons = await this.listLessonsUseCase.execute();
    res.json(lessons.map((lesson) => lesson.toPrimitives()));
  };

  getBySlug = async (req: Request, res: Response): Promise<void> => {
    const lesson = await this.getLessonBySlugUseCase.execute(req.params.slug as string);
    res.json(lesson.toPrimitives());
  };
}
