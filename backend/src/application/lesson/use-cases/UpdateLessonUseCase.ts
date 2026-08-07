import type { Lesson } from "@domain/lesson/entities/Lesson.js";
import type { LessonRepository, UpdateLessonProps } from "@domain/lesson/repositories/LessonRepository.js";
import { NotFoundError } from "@shared/errors/AppError.js";

export class UpdateLessonUseCase {
  constructor(private readonly lessonRepository: LessonRepository) {}

  async execute(slug: string, props: UpdateLessonProps): Promise<Lesson> {
    const lesson = await this.lessonRepository.findBySlug(slug);
    if (!lesson) {
      throw new NotFoundError(`No se encontró la lección "${slug}"`);
    }

    return this.lessonRepository.update(lesson.id, props);
  }
}
