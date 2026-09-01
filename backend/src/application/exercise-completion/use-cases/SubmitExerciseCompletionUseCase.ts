import type { ExerciseCompletion } from "@domain/exercise-completion/entities/ExerciseCompletion.js";
import type { ExerciseCompletionRepository } from "@domain/exercise-completion/repositories/ExerciseCompletionRepository.js";
import type { LessonRepository } from "@domain/lesson/repositories/LessonRepository.js";
import { NotFoundError } from "@shared/errors/AppError.js";

export class SubmitExerciseCompletionUseCase {
  constructor(
    private readonly exerciseCompletionRepository: ExerciseCompletionRepository,
    private readonly lessonRepository: LessonRepository
  ) {}

  async execute(lessonId: string, exerciseId: string, completed: boolean): Promise<ExerciseCompletion> {
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError(`No se encontró la lección con id "${lessonId}"`);
    }

    return this.exerciseCompletionRepository.upsert(lessonId, exerciseId, completed);
  }
}
