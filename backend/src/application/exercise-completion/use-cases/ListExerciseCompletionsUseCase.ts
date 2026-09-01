import type { ExerciseCompletion } from "@domain/exercise-completion/entities/ExerciseCompletion.js";
import type { ExerciseCompletionRepository } from "@domain/exercise-completion/repositories/ExerciseCompletionRepository.js";

export class ListExerciseCompletionsUseCase {
  constructor(private readonly exerciseCompletionRepository: ExerciseCompletionRepository) {}

  async execute(lessonId: string): Promise<ExerciseCompletion[]> {
    return this.exerciseCompletionRepository.findByLessonId(lessonId);
  }
}
