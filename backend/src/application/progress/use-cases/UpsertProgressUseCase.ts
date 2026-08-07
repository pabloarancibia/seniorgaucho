import type { Progress } from "@domain/progress/entities/Progress.js";
import type { ProgressRepository } from "@domain/progress/repositories/ProgressRepository.js";
import type { ProgressStatus } from "@domain/progress/value-objects/ProgressStatus.js";
import type { LessonRepository } from "@domain/lesson/repositories/LessonRepository.js";
import { NotFoundError } from "@shared/errors/AppError.js";

export class UpsertProgressUseCase {
  constructor(
    private readonly progressRepository: ProgressRepository,
    private readonly lessonRepository: LessonRepository
  ) {}

  async execute(lessonId: string, status: ProgressStatus): Promise<Progress> {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError(`No se encontró la lección con id "${lessonId}"`);
    }

    return this.progressRepository.upsert(lessonId, status);
  }
}
