import type { Progress } from "@domain/progress/entities/Progress.js";
import type { ProgressStatus } from "@domain/progress/value-objects/ProgressStatus.js";

export interface ProgressRepository {
  findByLessonId(lessonId: string): Promise<Progress | null>;
  /** Crea o actualiza el progreso de una lección (una lección = un registro). */
  upsert(lessonId: string, status: ProgressStatus): Promise<Progress>;
}
