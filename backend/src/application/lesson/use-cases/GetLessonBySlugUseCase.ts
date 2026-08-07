import type { Lesson } from "@domain/lesson/entities/Lesson.js";
import type { LessonRepository } from "@domain/lesson/repositories/LessonRepository.js";
import { NotFoundError } from "@shared/errors/AppError.js";

export class GetLessonBySlugUseCase {
  constructor(private readonly lessonRepository: LessonRepository) {}

  async execute(slug: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findBySlug(slug);
    if (!lesson) {
      throw new NotFoundError(`No se encontró la lección "${slug}"`);
    }
    return lesson;
  }
}
