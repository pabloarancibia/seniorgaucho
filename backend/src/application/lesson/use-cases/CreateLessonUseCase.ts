import { Lesson, type NewLessonProps } from "@domain/lesson/entities/Lesson.js";
import type { LessonRepository } from "@domain/lesson/repositories/LessonRepository.js";
import { ConflictError } from "@shared/errors/AppError.js";

export class CreateLessonUseCase {
  constructor(private readonly lessonRepository: LessonRepository) {}

  async execute(input: NewLessonProps): Promise<Lesson> {
    const validated = Lesson.create(input);

    const existing = await this.lessonRepository.findBySlug(validated.slug);
    if (existing) {
      throw new ConflictError(`Ya existe una lección con el slug "${validated.slug}"`);
    }

    return this.lessonRepository.create(validated);
  }
}
