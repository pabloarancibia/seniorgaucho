import { Progress } from "@domain/progress/entities/Progress.js";
import type { ProgressRepository } from "@domain/progress/repositories/ProgressRepository.js";

export class GetProgressUseCase {
  constructor(private readonly progressRepository: ProgressRepository) {}

  async execute(lessonId: string): Promise<Progress> {
    const progress = await this.progressRepository.findByLessonId(lessonId);
    return progress ?? Progress.pending(lessonId);
  }
}
