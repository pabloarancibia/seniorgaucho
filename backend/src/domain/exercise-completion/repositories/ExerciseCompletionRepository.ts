import type { ExerciseCompletion } from "@domain/exercise-completion/entities/ExerciseCompletion.js";

export interface ExerciseCompletionRepository {
  findByLessonId(lessonId: string): Promise<ExerciseCompletion[]>;
  /** Marca/desmarca un ejercicio como completado (último estado gana). */
  upsert(lessonId: string, exerciseId: string, completed: boolean): Promise<ExerciseCompletion>;
}
